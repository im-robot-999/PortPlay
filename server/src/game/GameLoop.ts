import { GameSnapshot, PlayerState, GameEntity, QuestProgress } from '@portplay/shared';
import { 
  createGameSnapshot, 
  applyInputToSnapshot, 
  GAME_CONSTANTS 
} from './functions';

/**
 * Game loop class that manages the authoritative game state
 */
export class GameLoop {
  private tick: number = 0;
  private lastTickTime: number = 0;
  private tickInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private players: PlayerState[] = [];
  private entities: GameEntity[] = [];
  private quests: QuestProgress[] = [];
  private pendingInputs: any[] = [];
  private lastInputTimes: Record<string, number> = {};
  private onSnapshotCallback?: (snapshot: GameSnapshot) => void;

  constructor(
    private tickRate: number = GAME_CONSTANTS.TICK_RATE,
    private maxInputAge: number = 1000
  ) {}

  /**
   * Starts the game loop
   */
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTickTime = Date.now();
    this.tickInterval = setInterval(() => this.tickGame(), 1000 / this.tickRate);
    
    console.log(`Game loop started at ${this.tickRate} Hz`);
  }

  /**
   * Stops the game loop
   */
  stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
    
    console.log('Game loop stopped');
  }

  /**
   * Sets the callback for when a new snapshot is created
   */
  onSnapshot(callback: (snapshot: GameSnapshot) => void): void {
    this.onSnapshotCallback = callback;
  }

  /**
   * Adds a player to the game
   */
  addPlayer(player: PlayerState): void {
    this.players.push(player);
    console.log(`Player ${player.username} added to game`);
  }

  /**
   * Removes a player from the game
   */
  removePlayer(playerId: string): void {
    const index = this.players.findIndex(p => p.id === playerId);
    if (index !== -1) {
      const player = this.players[index];
      this.players.splice(index, 1);
      console.log(`Player ${player.username} removed from game`);
    }
  }

  /**
   * Adds an entity to the game
   */
  addEntity(entity: GameEntity): void {
    this.entities.push(entity);
  }

  /**
   * Removes an entity from the game
   */
  removeEntity(entityId: string): void {
    const index = this.entities.findIndex(e => e.id === entityId);
    if (index !== -1) {
      this.entities.splice(index, 1);
    }
  }

  /**
   * Adds a quest to the game
   */
  addQuest(quest: QuestProgress): void {
    this.quests.push(quest);
  }

  /**
   * Updates a quest in the game
   */
  updateQuest(questId: string, updates: Partial<QuestProgress>): void {
    const index = this.quests.findIndex(q => q.id === questId);
    if (index !== -1) {
      this.quests[index] = { ...this.quests[index], ...updates };
    }
  }

  /**
   * Queues input for processing in the next tick
   */
  queueInput(input: any): void {
    this.pendingInputs.push(input);
  }

  /**
   * Main game tick function
   */
  private tickGame(): void {
    const now = Date.now();
    const deltaTime = (now - this.lastTickTime) / 1000;
    
    // Process pending inputs
    this.processInputs(deltaTime);
    
    // Update game state
    this.updateGameState(deltaTime);
    
    // Create and emit snapshot
    const snapshot = createGameSnapshot(
      this.tick,
      this.players,
      this.entities,
      this.quests
    );
    
    if (this.onSnapshotCallback) {
      this.onSnapshotCallback(snapshot);
    }
    
    // Update tick counter and time
    this.tick++;
    this.lastTickTime = now;
  }

  /**
   * Processes all pending inputs
   */
  private processInputs(deltaTime: number): void {
    const validInputs = this.pendingInputs.filter(input => {
      // Basic validation
      if (!input.playerId || !input.input) return false;
      
      // Rate limiting
      if (!this.checkInputRateLimit(input.playerId)) return false;
      
      return true;
    });

    // Apply valid inputs to game state
    validInputs.forEach(input => {
      this.players = this.players.map(player => {
        if (player.id === input.playerId) {
          return this.applyInputToPlayer(player, input.input, deltaTime);
        }
        return player;
      });
    });

    // Clear processed inputs
    this.pendingInputs = [];
  }

  /**
   * Applies input to a specific player
   */
  private applyInputToPlayer(player: PlayerState, input: any, deltaTime: number): PlayerState {
    // This would call the physics functions from functions.ts
    // For now, we'll do a simple update
    let newPosition = { ...player.position };
    let newVelocity = { ...player.velocity };
    let newAnimationState = player.animationState;

    // Simple movement
    const moveSpeed = input.run ? 5 * 1.5 : 5;
    
    if (input.forward) newPosition.z -= moveSpeed * deltaTime;
    if (input.backward) newPosition.z += moveSpeed * deltaTime;
    if (input.left) newPosition.x -= moveSpeed * deltaTime;
    if (input.right) newPosition.x += moveSpeed * deltaTime;

    // Update animation state
    if (input.forward || input.backward || input.left || input.right) {
      newAnimationState = input.run ? 'running' : 'walking';
    } else {
      newAnimationState = 'idle';
    }

    return {
      ...player,
      position: newPosition,
      velocity: newVelocity,
      animationState: newAnimationState
    };
  }

  /**
   * Updates the game state (physics, AI, etc.)
   */
  private updateGameState(deltaTime: number): void {
    // Update player physics
    this.players = this.players.map(player => {
      // Apply gravity
      if (player.position.y > 0) {
        const newVelocity = { ...player.velocity };
        newVelocity.y -= 9.8 * deltaTime;
        
        const newPosition = { ...player.position };
        newPosition.y += newVelocity.y * deltaTime;
        
        // Ground collision
        if (newPosition.y < 0) {
          newPosition.y = 0;
          newVelocity.y = 0;
        }
        
        return {
          ...player,
          position: newPosition,
          velocity: newVelocity
        };
      }
      
      return player;
    });

    // Update entities (AI, etc.)
    this.entities = this.entities.map(entity => {
      // Simple AI update - entities move in a pattern
      if (entity.type === 'enemy') {
        const newPosition = { ...entity.position };
        newPosition.x += Math.sin(this.tick * 0.1) * 0.1;
        newPosition.z += Math.cos(this.tick * 0.1) * 0.1;
        
        return {
          ...entity,
          position: newPosition
        };
      }
      
      return entity;
    });
  }

  /**
   * Checks input rate limiting
   */
  private checkInputRateLimit(playerId: string): boolean {
    const now = Date.now();
    const lastTime = this.lastInputTimes[playerId] || 0;
    const minInterval = 1000 / this.tickRate; // Minimum interval between inputs
    
    if (now - lastTime < minInterval) {
      return false;
    }
    
    this.lastInputTimes[playerId] = now;
    return true;
  }

  /**
   * Gets the current game state
   */
  getGameState(): {
    tick: number;
    players: PlayerState[];
    entities: GameEntity[];
    quests: QuestProgress[];
  } {
    return {
      tick: this.tick,
      players: this.players,
      entities: this.entities,
      quests: this.quests
    };
  }

  /**
   * Gets a specific player by ID
   */
  getPlayer(playerId: string): PlayerState | undefined {
    return this.players.find(p => p.id === playerId);
  }

  /**
   * Gets all players
   */
  getPlayers(): PlayerState[] {
    return [...this.players];
  }

  /**
   * Gets the current tick number
   */
  getCurrentTick(): number {
    return this.tick;
  }

  /**
   * Checks if the game loop is running
   */
  isGameRunning(): boolean {
    return this.isRunning;
  }
}
