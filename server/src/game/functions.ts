import { 
  Vector3, 
  Quaternion, 
  PlayerState, 
  GameSnapshot, 
  InputSnapshot, 
  GameEntity,
  QuestProgress,
  QuestState,
  ItemType,
  InventoryItem,
  AnimationState
} from '@portplay/shared';
import { 
  createVector3, 
  addVector3, 
  multiplyVector3, 
  distanceVector3,
  checkAABBCollision,
  calculateDamage
} from '@portplay/shared';

/**
 * Game constants
 */
export const GAME_CONSTANTS = {
  GRAVITY: -9.8,
  JUMP_FORCE: 8.0,
  MOVE_SPEED: 5.0,
  RUN_MULTIPLIER: 1.5,
  DASH_FORCE: 15.0,
  DASH_DURATION: 0.2,
  MAX_HEALTH: 100,
  PLAYER_SIZE: { x: 0.5, y: 1.8, z: 0.5 },
  GROUND_Y: 0,
  TICK_RATE: 60,
  MAX_PLAYERS_PER_ROOM: 8,
  REJOIN_WINDOW_MS: 30000
} as const;

/**
 * Physics integration functions
 */

/**
 * Applies input to player state and updates physics
 * @param player - Current player state
 * @param input - Player input state
 * @param deltaTime - Time since last update
 * @returns Updated player state
 */
export function applyPlayerInput(
  player: PlayerState,
  input: any,
  deltaTime: number
): PlayerState {
  let newVelocity = { ...player.velocity };
  let newPosition = { ...player.position };
  let newAnimationState = player.animationState;

  // Apply gravity
  newVelocity.y += GAME_CONSTANTS.GRAVITY * deltaTime;

  // Handle movement
  const moveSpeed = input.run ? 
    GAME_CONSTANTS.MOVE_SPEED * GAME_CONSTANTS.RUN_MULTIPLIER : 
    GAME_CONSTANTS.MOVE_SPEED;

  if (input.forward) {
    newVelocity.z -= moveSpeed;
  }
  if (input.backward) {
    newVelocity.z += moveSpeed;
  }
  if (input.left) {
    newVelocity.x -= moveSpeed;
  }
  if (input.right) {
    newVelocity.x += moveSpeed;
  }

  // Handle jumping
  if (input.jump && player.position.y <= GAME_CONSTANTS.GROUND_Y + 0.1) {
    newVelocity.y = GAME_CONSTANTS.JUMP_FORCE;
    newAnimationState = AnimationState.JUMPING;
  }

  // Handle dashing
  if (input.dash) {
    const dashDirection = normalizeMovementVector(input);
    newVelocity.x += dashDirection.x * GAME_CONSTANTS.DASH_FORCE;
    newVelocity.z += dashDirection.z * GAME_CONSTANTS.DASH_FORCE;
    newAnimationState = AnimationState.DASHING;
  }

  // Update position based on velocity
  newPosition.x += newVelocity.x * deltaTime;
  newPosition.y += newVelocity.y * deltaTime;
  newPosition.z += newVelocity.z * deltaTime;

  // Ground collision
  if (newPosition.y < GAME_CONSTANTS.GROUND_Y) {
    newPosition.y = GAME_CONSTANTS.GROUND_Y;
    newVelocity.y = 0;
    newAnimationState = player.velocity.y < -2 ? AnimationState.FALLING : AnimationState.IDLE;
  }

  // Update animation state based on movement
  if (Math.abs(newVelocity.x) > 0.1 || Math.abs(newVelocity.z) > 0.1) {
    if (input.run) {
      newAnimationState = AnimationState.RUNNING;
    } else {
      newAnimationState = AnimationState.WALKING;
    }
  } else if (newPosition.y <= GAME_CONSTANTS.GROUND_Y + 0.1) {
    newAnimationState = AnimationState.IDLE;
  }

  return {
    ...player,
    position: newPosition,
    velocity: newVelocity,
    animationState: newAnimationState
  };
}

/**
 * Normalizes movement input into a direction vector
 * @param input - Player input state
 * @returns Normalized movement direction
 */
function normalizeMovementVector(input: any): Vector3 {
  let x = 0;
  let z = 0;

  if (input.forward) z -= 1;
  if (input.backward) z += 1;
  if (input.left) x -= 1;
  if (input.right) x += 1;

  if (x === 0 && z === 0) {
    return createVector3(0, 0, 0);
  }

  const length = Math.sqrt(x * x + z * z);
  return createVector3(x / length, 0, z / length);
}

/**
 * Hit detection functions
 */

/**
 * Checks if a player attack hits a target
 * @param attacker - Attacking player
 * @param target - Target entity
 * @param attackRange - Attack range
 * @returns True if hit
 */
export function checkMeleeHit(
  attacker: PlayerState,
  target: GameEntity,
  attackRange: number
): boolean {
  const distance = distanceVector3(attacker.position, target.position);
  return distance <= attackRange;
}

/**
 * Checks if a ranged attack hits a target
 * @param origin - Origin of the attack
 * @param direction - Direction of the attack
 * @param target - Target entity
 * @param maxRange - Maximum range of the attack
 * @returns True if hit
 */
export function checkRangedHit(
  origin: Vector3,
  direction: Vector3,
  target: GameEntity,
  maxRange: number
): boolean {
  const distance = distanceVector3(origin, target.position);
  if (distance > maxRange) return false;

  // Simple hit check - in a real implementation, you'd do proper ray casting
  const targetDirection = {
    x: target.position.x - origin.x,
    y: target.position.y - origin.y,
    z: target.position.z - origin.z
  };

  const dot = direction.x * targetDirection.x + 
              direction.y * targetDirection.y + 
              direction.z * targetDirection.z;
  
  const angle = Math.acos(dot / (distance * Math.sqrt(
    direction.x * direction.x + 
    direction.y * direction.y + 
    direction.z * direction.z
  )));

  return angle < 0.3; // ~17 degrees
}

/**
 * Applies damage to a target
 * @param target - Target to damage
 * @param damage - Amount of damage
 * @returns Updated target state
 */
export function applyDamage(target: GameEntity, damage: number): GameEntity {
  if (target.health === undefined) return target;
  
  const newHealth = Math.max(0, target.health - damage);
  return {
    ...target,
    health: newHealth
  };
}

/**
 * Snapshot and reconciliation functions
 */

/**
 * Creates a new game snapshot
 * @param tick - Current game tick
 * @param players - Current player states
 * @param entities - Current game entities
 * @param quests - Current quest states
 * @returns New game snapshot
 */
export function createGameSnapshot(
  tick: number,
  players: PlayerState[],
  entities: GameEntity[],
  quests: QuestProgress[]
): GameSnapshot {
  return {
    tick,
    timestamp: Date.now(),
    players,
    entities,
    quests,
    worldState: {}
  };
}

/**
 * Applies input snapshot to game state
 * @param snapshot - Current game snapshot
 * @param input - Input snapshot to apply
 * @param deltaTime - Time since last update
 * @returns Updated game snapshot
 */
export function applyInputToSnapshot(
  snapshot: GameSnapshot,
  input: InputSnapshot,
  deltaTime: number
): GameSnapshot {
  const playerIndex = snapshot.players.findIndex(p => p.id === input.playerId);
  if (playerIndex === -1) return snapshot;

  const updatedPlayers = [...snapshot.players];
  updatedPlayers[playerIndex] = applyPlayerInput(
    updatedPlayers[playerIndex],
    input.input,
    deltaTime
  );

  return {
    ...snapshot,
    players: updatedPlayers
  };
}

/**
 * Quest and progression functions
 */

/**
 * Starts a new quest
 * @param questId - Quest identifier
 * @param objectives - Quest objectives
 * @returns New quest progress
 */
export function startQuest(questId: string, objectives: string[]): QuestProgress {
  return {
    id: questId,
    state: QuestState.IN_PROGRESS,
    cluesFound: [],
    objectives,
    completedObjectives: [],
    startTime: Date.now(),
    lastUpdateTime: Date.now()
  };
}

/**
 * Adds a clue to a quest
 * @param quest - Current quest progress
 * @param clueId - Clue identifier
 * @returns Updated quest progress
 */
export function addClueToQuest(quest: QuestProgress, clueId: string): QuestProgress {
  if (quest.cluesFound.includes(clueId)) {
    return quest;
  }

  return {
    ...quest,
    cluesFound: [...quest.cluesFound, clueId],
    lastUpdateTime: Date.now()
  };
}

/**
 * Completes a quest objective
 * @param quest - Current quest progress
 * @param objectiveId - Objective identifier
 * @returns Updated quest progress
 */
export function completeQuestObjective(
  quest: QuestProgress, 
  objectiveId: string
): QuestProgress {
  if (quest.completedObjectives.includes(objectiveId)) {
    return quest;
  }

  const newCompletedObjectives = [...quest.completedObjectives, objectiveId];
  const isCompleted = newCompletedObjectives.length === quest.objectives.length;

  return {
    ...quest,
    completedObjectives: newCompletedObjectives,
    state: isCompleted ? QuestState.COMPLETED : QuestState.IN_PROGRESS,
    lastUpdateTime: Date.now()
  };
}

/**
 * Inventory and item functions
 */

/**
 * Adds an item to player inventory
 * @param player - Player state
 * @param item - Item to add
 * @returns Updated player state
 */
export function addItemToInventory(
  player: PlayerState, 
  item: InventoryItem
): PlayerState {
  const existingItemIndex = player.inventory.findIndex(i => i.type === item.type);
  
  if (existingItemIndex !== -1) {
    // Stack existing item
    const updatedInventory = [...player.inventory];
    updatedInventory[existingItemIndex] = {
      ...updatedInventory[existingItemIndex],
      quantity: updatedInventory[existingItemIndex].quantity + item.quantity
    };
    
    return {
      ...player,
      inventory: updatedInventory
    };
  } else {
    // Add new item
    return {
      ...player,
      inventory: [...player.inventory, item]
    };
  }
}

/**
 * Uses an item from player inventory
 * @param player - Player state
 * @param itemType - Type of item to use
 * @returns Updated player state and success flag
 */
export function useInventoryItem(
  player: PlayerState, 
  itemType: ItemType
): { player: PlayerState; success: boolean } {
  const itemIndex = player.inventory.findIndex(i => i.type === itemType);
  
  if (itemIndex === -1) {
    return { player, success: false };
  }

  const item = player.inventory[itemIndex];
  if (item.quantity <= 0) {
    return { player, success: false };
  }

  // Apply item effects
  let updatedPlayer = { ...player };
  
  switch (itemType) {
    case ItemType.HEALTH_PACK:
      updatedPlayer.health = Math.min(
        updatedPlayer.maxHealth, 
        updatedPlayer.health + 25
      );
      break;
    case ItemType.JUMP_BOOTS:
      // Jump boots effect would be applied in the physics update
      break;
  }

  // Remove one item
  const updatedInventory = [...player.inventory];
  if (item.quantity === 1) {
    updatedInventory.splice(itemIndex, 1);
  } else {
    updatedInventory[itemIndex] = {
      ...item,
      quantity: item.quantity - 1
    };
  }

  updatedPlayer.inventory = updatedInventory;

  return { player: updatedPlayer, success: true };
}

/**
 * Adds experience points to a player
 * @param player - Player state
 * @param xp - Experience points to add
 * @returns Updated player state
 */
export function addExperience(player: PlayerState, xp: number): PlayerState {
  const newXp = player.xp + xp;
  const newLevel = Math.floor(newXp / 100) + 1; // Simple level calculation
  
  return {
    ...player,
    xp: newXp,
    level: newLevel
  };
}

/**
 * Validation and anti-cheat functions
 */

/**
 * Validates player input for anti-cheat
 * @param input - Input snapshot to validate
 * @param lastInput - Last input from the same player
 * @param maxInputAge - Maximum age of input in milliseconds
 * @returns Validation result
 */
export function validatePlayerInput(
  input: InputSnapshot,
  lastInput: InputSnapshot | null,
  maxInputAge: number
): { valid: boolean; reason?: string } {
  const now = Date.now();
  
  // Check input age
  if (now - input.timestamp > maxInputAge) {
    return { valid: false, reason: 'Input too old' };
  }

  // Check sequence number
  if (lastInput && input.sequence <= lastInput.sequence) {
    return { valid: false, reason: 'Invalid sequence number' };
  }

  // Check for impossible movements (e.g., moving too fast)
  if (lastInput) {
    const timeDiff = (input.timestamp - lastInput.timestamp) / 1000;
    const maxDistance = 10; // Maximum reasonable distance per second
    
    // This is a simplified check - in practice you'd want more sophisticated validation
    if (timeDiff > 0 && timeDiff < 1) {
      const distance = Math.sqrt(
        Math.pow(input.input.forward ? 1 : 0, 2) +
        Math.pow(input.input.backward ? 1 : 0, 2) +
        Math.pow(input.input.left ? 1 : 0, 2) +
        Math.pow(input.input.right ? 1 : 0, 2)
      );
      
      if (distance > maxDistance) {
        return { valid: false, reason: 'Movement too fast' };
      }
    }
  }

  return { valid: true };
}

/**
 * Rate limiting functions
 */

/**
 * Simple rate limiter for input events
 * @param playerId - Player identifier
 * @param lastInputTime - Last input time for this player
 * @param minInterval - Minimum interval between inputs in milliseconds
 * @returns Whether input should be allowed
 */
export function checkInputRateLimit(
  playerId: string,
  lastInputTime: Record<string, number>,
  minInterval: number
): boolean {
  const now = Date.now();
  const lastTime = lastInputTime[playerId] || 0;
  
  if (now - lastTime < minInterval) {
    return false;
  }
  
  lastInputTime[playerId] = now;
  return true;
}
