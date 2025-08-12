import { Server, Socket } from 'socket.io';
import { RoomManager } from '../game/RoomManager';
import { InputSnapshot, GameSnapshot } from '@portplay/shared';

/**
 * Handles Socket.io connections and game events
 */
export class GameSocketHandler {
  private io: Server;
  private roomManager: RoomManager;
  private playerSockets: Map<string, Socket> = new Map();
  private socketRooms: Map<string, string> = new Map(); // socketId -> roomId

  constructor(io: Server, roomManager: RoomManager) {
    this.io = io;
    this.roomManager = roomManager;
    this.setupEventHandlers();
  }

  /**
   * Sets up Socket.io event handlers
   */
  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`Socket connected: ${socket.id}`);
      
      this.handleConnection(socket);
      
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });

      socket.on('create_room', (data: { username: string; chapterId: string }) => {
        this.handleCreateRoom(socket, data);
      });

      socket.on('join_room', (data: { roomCode: string; username: string }) => {
        this.handleJoinRoom(socket, data);
      });

      socket.on('leave_room', () => {
        this.handleLeaveRoom(socket);
      });

      socket.on('player_input', (data: InputSnapshot) => {
        this.handlePlayerInput(socket, data);
      });

      socket.on('chat_message', (data: { message: string }) => {
        this.handleChatMessage(socket, data);
      });

      socket.on('use_item', (data: { itemType: string }) => {
        this.handleUseItem(socket, data);
      });

      socket.on('interact', (data: { targetId: string; action: string }) => {
        this.handleInteract(socket, data);
      });

      socket.on('start_game', () => {
        this.handleStartGame(socket);
      });

      socket.on('end_game', () => {
        this.handleEndGame(socket);
      });
    });
  }

  /**
   * Handles new socket connections
   */
  private handleConnection(socket: Socket): void {
    // Store socket reference
    this.playerSockets.set(socket.id, socket);
    
    // Send connection confirmation
    socket.emit('connected', {
      socketId: socket.id,
      timestamp: Date.now()
    });
  }

  /**
   * Handles socket disconnections
   */
  private handleDisconnect(socket: Socket): void {
    console.log(`Socket disconnected: ${socket.id}`);
    
    // Remove player from room
    this.handleLeaveRoom(socket);
    
    // Clean up references
    this.playerSockets.delete(socket.id);
    this.socketRooms.delete(socket.id);
  }

  /**
   * Handles room creation requests
   */
  private handleCreateRoom(socket: Socket, data: { username: string; chapterId: string }): void {
    try {
      const { username, chapterId } = data;
      
      if (!username || !chapterId) {
        socket.emit('error', { message: 'Username and chapter ID are required' });
        return;
      }

      // Create room
      const room = this.roomManager.createRoom(
        socket.id,
        username,
        chapterId
      );

      // Join socket to room
      socket.join(room.id);
      this.socketRooms.set(socket.id, room.id);

      // Send room creation confirmation
      socket.emit('room_created', {
        roomId: room.id,
        roomCode: room.code,
        hostId: room.hostId,
        players: room.players.map(p => ({ id: p.id, username: p.username }))
      });

      console.log(`Room ${room.code} created by ${username}`);
    } catch (error) {
      console.error('Error creating room:', error);
      socket.emit('error', { message: 'Failed to create room' });
    }
  }

  /**
   * Handles room join requests
   */
  private handleJoinRoom(socket: Socket, data: { roomCode: string; username: string }): void {
    try {
      const { roomCode, username } = data;
      
      if (!roomCode || !username) {
        socket.emit('error', { message: 'Room code and username are required' });
        return;
      }

      // Join room
      const room = this.roomManager.joinRoom(roomCode, socket.id, username);
      
      if (!room) {
        socket.emit('error', { message: 'Failed to join room' });
        return;
      }

      // Join socket to room
      socket.join(room.id);
      this.socketRooms.set(socket.id, room.id);

      // Send room join confirmation
      socket.emit('room_joined', {
        roomId: room.id,
        roomCode: room.code,
        players: room.players.map(p => ({ id: p.id, username: p.username })),
        state: room.state
      });

      // Notify other players in the room
      socket.to(room.id).emit('player_joined', {
        playerId: socket.id,
        username,
        players: room.players.map(p => ({ id: p.id, username: p.username }))
      });

      console.log(`Player ${username} joined room ${roomCode}`);
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  }

  /**
   * Handles room leave requests
   */
  private handleLeaveRoom(socket: Socket): void {
    const roomId = this.socketRooms.get(socket.id);
    if (!roomId) return;

    const room = this.roomManager.getRoom(roomId);
    if (!room) return;

    // Leave socket from room
    socket.leave(roomId);
    this.socketRooms.delete(socket.id);

    // Remove player from room
    this.roomManager.leaveRoom(roomId, socket.id);

    // Notify other players
    socket.to(roomId).emit('player_left', {
      playerId: socket.id,
      players: room.players.map(p => ({ id: p.id, username: p.username }))
    });

    // Send leave confirmation
    socket.emit('room_left', {
      roomId,
      message: 'Successfully left room'
    });

    console.log(`Player left room ${room.code}`);
  }

  /**
   * Handles player input
   */
  private handlePlayerInput(socket: Socket, data: InputSnapshot): void {
    const roomId = this.socketRooms.get(socket.id);
    if (!roomId) {
      socket.emit('error', { message: 'Not in a room' });
      return;
    }

    // Validate input
    if (!data.playerId || !data.input) {
      socket.emit('error', { message: 'Invalid input data' });
      return;
    }

    // Ensure player ID matches socket
    if (data.playerId !== socket.id) {
      socket.emit('error', { message: 'Player ID mismatch' });
      return;
    }

    // Queue input for processing
    this.roomManager.handlePlayerInput(roomId, data);

    // Send input confirmation
    socket.emit('input_received', {
      sequence: data.sequence,
      timestamp: Date.now()
    });
  }

  /**
   * Handles chat messages
   */
  private handleChatMessage(socket: Socket, data: { message: string }): void {
    const roomId = this.socketRooms.get(socket.id);
    if (!roomId) {
      socket.emit('error', { message: 'Not in a room' });
      return;
    }

    const room = this.roomManager.getRoom(roomId);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    // Validate message
    if (!data.message || data.message.trim().length === 0) {
      socket.emit('error', { message: 'Message cannot be empty' });
      return;
    }

    if (data.message.length > 200) {
      socket.emit('error', { message: 'Message too long' });
      return;
    }

    // Broadcast message to room
    const chatData = {
      playerId: socket.id,
      username: player.username,
      message: data.message.trim(),
      timestamp: Date.now()
    };

    this.io.to(roomId).emit('chat_message', chatData);

    console.log(`Chat in room ${room.code}: ${player.username}: ${data.message}`);
  }

  /**
   * Handles item usage
   */
  private handleUseItem(socket: Socket, data: { itemType: string }): void {
    const roomId = this.socketRooms.get(socket.id);
    if (!roomId) {
      socket.emit('error', { message: 'Not in a room' });
      return;
    }

    // This would integrate with the game functions
    // For now, just acknowledge the request
    socket.emit('item_used', {
      itemType: data.itemType,
      success: true,
      timestamp: Date.now()
    });
  }

  /**
   * Handles player interactions
   */
  private handleInteract(socket: Socket, data: { targetId: string; action: string }): void {
    const roomId = this.socketRooms.get(socket.id);
    if (!roomId) {
      socket.emit('error', { message: 'Not in a room' });
      return;
    }

    // This would integrate with the game functions
    // For now, just acknowledge the request
    socket.emit('interaction_completed', {
      targetId: data.targetId,
      action: data.action,
      success: true,
      timestamp: Date.now()
    });
  }

  /**
   * Handles game start requests
   */
  private handleStartGame(socket: Socket): void {
    const roomId = this.socketRooms.get(socket.id);
    if (!roomId) {
      socket.emit('error', { message: 'Not in a room' });
      return;
    }

    const room = this.roomManager.getRoom(roomId);
    if (!room) return;

    // Check if player is host
    if (room.hostId !== socket.id) {
      socket.emit('error', { message: 'Only the host can start the game' });
      return;
    }

    // Start the game
    this.roomManager.startGame(roomId);

    // Notify all players
    this.io.to(roomId).emit('game_started', {
      roomId: room.id,
      players: room.players.map(p => ({ id: p.id, username: p.username }))
    });
  }

  /**
   * Handles game end requests
   */
  private handleEndGame(socket: Socket): void {
    const roomId = this.socketRooms.get(socket.id);
    if (!roomId) {
      socket.emit('error', { message: 'Not in a room' });
      return;
    }

    const room = this.roomManager.getRoom(roomId);
    if (!room) return;

    // Check if player is host
    if (room.hostId !== socket.id) {
      socket.emit('error', { message: 'Only the host can end the game' });
      return;
    }

    // End the game
    this.roomManager.endGame(roomId);

    // Notify all players
    this.io.to(roomId).emit('game_ended', {
      roomId: room.id,
      results: {
        players: room.players.map(p => ({ id: p.id, username: p.username, xp: p.xp }))
      }
    });
  }

  /**
   * Broadcasts a game snapshot to all players in a room
   */
  broadcastSnapshot(roomId: string, snapshot: GameSnapshot): void {
    this.io.to(roomId).emit('game_snapshot', snapshot);
  }

  /**
   * Gets the room ID for a socket
   */
  getSocketRoom(socketId: string): string | undefined {
    return this.socketRooms.get(socketId);
  }

  /**
   * Gets all connected sockets
   */
  getConnectedSockets(): Map<string, Socket> {
    return new Map(this.playerSockets);
  }

  /**
   * Gets room statistics
   */
  getRoomStats(): any {
    return this.roomManager.getStats();
  }
}
