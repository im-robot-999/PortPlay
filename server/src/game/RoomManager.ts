import { GameRoom, PlayerState, Chapter, AnimationState } from '@portplay/shared';
import { GameLoop } from './GameLoop';
import { GAME_CONSTANTS } from './functions';

/**
 * Manages game rooms and sessions
 */
export class RoomManager {
  private rooms: Map<string, GameRoom> = new Map();
  private gameLoops: Map<string, GameLoop> = new Map();
  private roomCodes: Map<string, string> = new Map(); // code -> roomId

  constructor() {}

  /**
   * Creates a new game room
   */
  createRoom(
    hostId: string,
    hostUsername: string,
    chapterId: string,
    maxPlayers: number = GAME_CONSTANTS.MAX_PLAYERS_PER_ROOM
  ): GameRoom {
    const roomId = this.generateRoomId();
    const roomCode = this.generateRoomCode();
    
    const room: GameRoom = {
      id: roomId,
      code: roomCode,
      hostId,
      players: [],
      maxPlayers,
      chapterId,
      state: 'waiting',
      createdAt: Date.now(),
      lastActivity: Date.now()
    };

    // Create game loop for this room
    const gameLoop = new GameLoop();
    gameLoop.onSnapshot((snapshot) => {
      // Broadcast snapshot to all players in the room
      this.broadcastToRoom(roomId, 'game_snapshot', snapshot);
    });

    this.rooms.set(roomId, room);
    this.gameLoops.set(roomId, gameLoop);
    this.roomCodes.set(roomCode, roomId);

    console.log(`Room ${roomCode} created by ${hostUsername} for chapter ${chapterId}`);

    return room;
  }

  /**
   * Joins a player to a room
   */
  joinRoom(roomCode: string, playerId: string, username: string): GameRoom | null {
    const roomId = this.roomCodes.get(roomCode);
    if (!roomId) {
      console.log(`Room code ${roomCode} not found`);
      return null;
    }

    const room = this.rooms.get(roomId);
    if (!room) {
      console.log(`Room ${roomId} not found`);
      return null;
    }

    if (room.players.length >= room.maxPlayers) {
      console.log(`Room ${roomCode} is full`);
      return null;
    }

    if (room.state !== 'waiting') {
      console.log(`Room ${roomCode} is not accepting players`);
      return null;
    }

    // Check if player is already in the room
    if (room.players.find(p => p.id === playerId)) {
      console.log(`Player ${username} is already in room ${roomCode}`);
      return room;
    }

    // Create player state
    const player: PlayerState = {
      id: playerId,
      userId: playerId,
      username,
      position: { x: 0, y: 1, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      health: GAME_CONSTANTS.MAX_HEALTH,
      maxHealth: GAME_CONSTANTS.MAX_HEALTH,
      animationState: AnimationState.IDLE,
      inventory: [],
      xp: 0,
      level: 1,
      lastInputSequence: 0,
      lastServerTick: 0
    };

    // Add player to room
    room.players.push(player);
    room.lastActivity = Date.now();

    // Add player to game loop
    const gameLoop = this.gameLoops.get(roomId);
    if (gameLoop) {
      gameLoop.addPlayer(player);
    }

    console.log(`Player ${username} joined room ${roomCode}`);

    // Start game if enough players
    if (room.players.length >= 2 && room.state === 'waiting') {
      this.startGame(roomId);
    }

    return room;
  }

  /**
   * Removes a player from a room
   */
  leaveRoom(roomId: string, playerId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const playerIndex = room.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return;

    const player = room.players[playerIndex];
    room.players.splice(playerIndex, 1);
    room.lastActivity = Date.now();

    // Remove player from game loop
    const gameLoop = this.gameLoops.get(roomId);
    if (gameLoop) {
      gameLoop.removePlayer(playerId);
    }

    console.log(`Player ${player.username} left room ${room.code}`);

    // Handle room cleanup
    if (room.players.length === 0) {
      this.cleanupRoom(roomId);
    } else if (room.hostId === playerId) {
      // Transfer host to next player
      room.hostId = room.players[0].id;
      console.log(`Host transferred to ${room.players[0].username}`);
    }
  }

  /**
   * Starts the game in a room
   */
  startGame(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    if (room.state !== 'waiting') {
      console.log(`Room ${room.code} is already in game`);
      return;
    }

    if (room.players.length < 2) {
      console.log(`Room ${room.code} needs at least 2 players to start`);
      return;
    }

    room.state = 'playing';
    room.lastActivity = Date.now();

    // Start the game loop
    const gameLoop = this.gameLoops.get(roomId);
    if (gameLoop) {
      gameLoop.start();
    }

    console.log(`Game started in room ${room.code}`);

    // Broadcast game start
    this.broadcastToRoom(roomId, 'game_started', {
      roomId: room.id,
      players: room.players.map(p => ({ id: p.id, username: p.username }))
    });
  }

  /**
   * Ends the game in a room
   */
  endGame(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.state = 'completed';
    room.lastActivity = Date.now();

    // Stop the game loop
    const gameLoop = this.gameLoops.get(roomId);
    if (gameLoop) {
      gameLoop.stop();
    }

    console.log(`Game ended in room ${room.code}`);

    // Broadcast game end
    this.broadcastToRoom(roomId, 'game_ended', {
      roomId: room.id,
      results: {
        players: room.players.map(p => ({ id: p.id, username: p.username, xp: p.xp }))
      }
    });
  }

  /**
   * Handles player input in a room
   */
  handlePlayerInput(roomId: string, input: any): void {
    const gameLoop = this.gameLoops.get(roomId);
    if (!gameLoop) return;

    gameLoop.queueInput(input);
  }

  /**
   * Gets a room by ID
   */
  getRoom(roomId: string): GameRoom | undefined {
    return this.rooms.get(roomId);
  }

  /**
   * Gets a room by code
   */
  getRoomByCode(roomCode: string): GameRoom | undefined {
    const roomId = this.roomCodes.get(roomCode);
    if (!roomId) return undefined;
    return this.rooms.get(roomId);
  }

  /**
   * Gets all rooms
   */
  getAllRooms(): GameRoom[] {
    return Array.from(this.rooms.values());
  }

  /**
   * Gets active rooms (waiting or playing)
   */
  getActiveRooms(): GameRoom[] {
    return Array.from(this.rooms.values()).filter(
      room => room.state === 'waiting' || room.state === 'playing'
    );
  }

  /**
   * Gets the game loop for a room
   */
  getGameLoop(roomId: string): GameLoop | undefined {
    return this.gameLoops.get(roomId);
  }

  /**
   * Broadcasts a message to all players in a room
   */
  broadcastToRoom(roomId: string, event: string, data: any): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    // This would be implemented with Socket.io
    // For now, we just log it
    console.log(`Broadcasting ${event} to room ${room.code}:`, data);
  }

  /**
   * Cleans up a room and its resources
   */
  private cleanupRoom(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    // Stop game loop
    const gameLoop = this.gameLoops.get(roomId);
    if (gameLoop) {
      gameLoop.stop();
      this.gameLoops.delete(roomId);
    }

    // Remove room code mapping
    this.roomCodes.delete(room.code);

    // Remove room
    this.rooms.delete(roomId);

    console.log(`Room ${room.code} cleaned up`);
  }

  /**
   * Generates a unique room ID
   */
  private generateRoomId(): string {
    return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generates a unique room code
   */
  private generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Ensure uniqueness
    while (this.roomCodes.has(code)) {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }
    
    return code;
  }

  /**
   * Gets room statistics
   */
  getStats(): {
    totalRooms: number;
    activeRooms: number;
    waitingRooms: number;
    playingRooms: number;
    totalPlayers: number;
  } {
    const rooms = Array.from(this.rooms.values());
    const activeRooms = rooms.filter(r => r.state === 'waiting' || r.state === 'playing');
    const waitingRooms = rooms.filter(r => r.state === 'waiting');
    const playingRooms = rooms.filter(r => r.state === 'playing');
    const totalPlayers = rooms.reduce((sum, room) => sum + room.players.length, 0);

    return {
      totalRooms: rooms.length,
      activeRooms: activeRooms.length,
      waitingRooms: waitingRooms.length,
      playingRooms: playingRooms.length,
      totalPlayers
    };
  }

  /**
   * Cleans up inactive rooms
   */
  cleanupInactiveRooms(maxInactiveTime: number = 30 * 60 * 1000): void {
    const now = Date.now();
    const roomsToCleanup: string[] = [];

    for (const [roomId, room] of this.rooms.entries()) {
      if (now - room.lastActivity > maxInactiveTime) {
        roomsToCleanup.push(roomId);
      }
    }

    roomsToCleanup.forEach(roomId => {
      console.log(`Cleaning up inactive room ${roomId}`);
      this.cleanupRoom(roomId);
    });

    if (roomsToCleanup.length > 0) {
      console.log(`Cleaned up ${roomsToCleanup.length} inactive rooms`);
    }
  }
}
