import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { RoomManager } from './game/RoomManager';
import { GameSocketHandler } from './sockets/GameSocketHandler';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize game systems
const roomManager = new RoomManager();
const gameSocketHandler = new GameSocketHandler(io, roomManager);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    rooms: roomManager.getStats()
  });
});

// API endpoints
app.get('/api/rooms', (req, res) => {
  try {
    const rooms = roomManager.getActiveRooms().map(room => ({
      id: room.id,
      code: room.code,
      hostId: room.hostId,
      playerCount: room.players.length,
      maxPlayers: room.maxPlayers,
      chapterId: room.chapterId,
      state: room.state,
      createdAt: room.createdAt
    }));

    res.json({
      success: true,
      rooms,
      total: rooms.length
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rooms'
    });
  }
});

app.get('/api/rooms/:roomCode', (req, res) => {
  try {
    const { roomCode } = req.params;
    const room = roomManager.getRoomByCode(roomCode);

    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }

    res.json({
      success: true,
      room: {
        id: room.id,
        code: room.code,
        hostId: room.hostId,
        players: room.players.map(p => ({
          id: p.id,
          username: p.username,
          level: p.level
        })),
        maxPlayers: room.maxPlayers,
        chapterId: room.chapterId,
        state: room.state,
        createdAt: room.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch room'
    });
  }
});

app.post('/api/rooms', (req, res) => {
  try {
    const { hostId, hostUsername, chapterId, maxPlayers } = req.body;

    if (!hostId || !hostUsername || !chapterId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const room = roomManager.createRoom(
      hostId,
      hostUsername,
      chapterId,
      maxPlayers
    );

    res.json({
      success: true,
      room: {
        id: room.id,
        code: room.code,
        hostId: room.hostId,
        maxPlayers: room.maxPlayers,
        chapterId: room.chapterId
      }
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create room'
    });
  }
});

// Chapter information endpoint
app.get('/api/chapters', (req, res) => {
  try {
    const chapters = [
      {
        id: 'neon-docks',
        name: 'Neon Docks: A Slippery Start',
        description: 'A neon-drenched shipping yard where a crate containing a clue to the mystery has been misplaced.',
        biome: 'cyberpunk',
        assets: ['neon_docks_environment.glb', 'crates.glb', 'conveyor_belts.glb'],
        spawnPoints: [
          { x: 0, y: 1, z: 0 },
          { x: 5, y: 1, z: 5 },
          { x: -5, y: 1, z: -5 }
        ],
        objectives: [
          'Find the misplaced crate',
          'Locate the manifest',
          'Identify the suspicious container'
        ],
        maxPlayers: 8,
        estimatedDuration: 15
      },
      {
        id: 'forest-ladles',
        name: 'Forest of Lost Ladles',
        description: 'Wooden pathways and swinging platforms where players hunt for an NPC chef who holds an old map.',
        biome: 'forest',
        assets: ['forest_environment.glb', 'wooden_platforms.glb', 'swinging_logs.glb'],
        spawnPoints: [
          { x: 0, y: 2, z: 0 },
          { x: 10, y: 2, z: 10 },
          { x: -10, y: 2, z: -10 }
        ],
        objectives: [
          'Find the NPC chef',
          'Collect map fragments',
          'Assemble the complete map'
        ],
        maxPlayers: 6,
        estimatedDuration: 20
      },
      {
        id: 'spooky-museum',
        name: 'Spooky Museum',
        description: 'A day/night museum with puzzles that change between visits and a mini-boss Curator Ghost.',
        biome: 'museum',
        assets: ['museum_environment.glb', 'puzzle_exhibits.glb', 'ghost_npc.glb'],
        spawnPoints: [
          { x: 0, y: 1, z: 0 },
          { x: 15, y: 1, z: 15 },
          { x: -15, y: 1, z: -15 }
        ],
        objectives: [
          'Solve the museum puzzles',
          'Restore the Curator Ghost\'s memories',
          'Get the port coordinates'
        ],
        maxPlayers: 4,
        estimatedDuration: 25
      }
    ];

    res.json({
      success: true,
      chapters
    });
  } catch (error) {
    console.error('Error fetching chapters:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chapters'
    });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 PortPlay server running on port ${PORT}`);
  console.log(`📡 Socket.io server ready for connections`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Log room manager stats
  const stats = roomManager.getStats();
  console.log(`📊 Room Manager Stats:`, stats);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  
  // Stop all game loops
  const activeRooms = roomManager.getActiveRooms();
  activeRooms.forEach(room => {
    if (room.state === 'playing') {
      roomManager.endGame(room.id);
    }
  });
  
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  
  // Stop all game loops
  const activeRooms = roomManager.getActiveRooms();
  activeRooms.forEach(room => {
    if (room.state === 'playing') {
      roomManager.endGame(room.id);
    }
  });
  
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Periodic cleanup of inactive rooms
setInterval(() => {
  roomManager.cleanupInactiveRooms();
}, 5 * 60 * 1000); // Every 5 minutes

export { app, server, io, roomManager, gameSocketHandler };
