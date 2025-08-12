import { z } from 'zod';

// Vector3 type for 3D positions and velocities
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

// Quaternion type for 3D rotations
export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

// Player animation states
export enum AnimationState {
  IDLE = 'idle',
  WALKING = 'walking',
  RUNNING = 'running',
  JUMPING = 'jumping',
  FALLING = 'falling',
  ATTACKING = 'attacking',
  DASHING = 'dashing'
}

// Player input state
export interface InputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  run: boolean;
  dash: boolean;
  attack: boolean;
  interact: boolean;
  useItem: boolean;
}

// Player state in the game world
export interface PlayerState {
  id: string;
  userId: string;
  username: string;
  position: Vector3;
  velocity: Vector3;
  rotation: Quaternion;
  health: number;
  maxHealth: number;
  animationState: AnimationState;
  inventory: InventoryItem[];
  xp: number;
  level: number;
  lastInputSequence: number;
  lastServerTick: number;
}

// Inventory item types
export enum ItemType {
  HEALTH_PACK = 'health_pack',
  JUMP_BOOTS = 'jump_boots',
  CLUE_SCANNER = 'clue_scanner',
  PORT_KEY = 'port_key'
}

// Inventory item
export interface InventoryItem {
  id: string;
  type: ItemType;
  name: string;
  description: string;
  quantity: number;
  metadata?: Record<string, unknown>;
}

// Game entity (enemies, NPCs, interactive objects)
export interface GameEntity {
  id: string;
  type: string;
  position: Vector3;
  rotation: Quaternion;
  health?: number;
  metadata?: Record<string, unknown>;
}

// Quest state
export enum QuestState {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// Quest progress
export interface QuestProgress {
  id: string;
  state: QuestState;
  cluesFound: string[];
  objectives: string[];
  completedObjectives: string[];
  startTime: number;
  lastUpdateTime: number;
}

// Game snapshot (authoritative server state)
export interface GameSnapshot {
  tick: number;
  timestamp: number;
  players: PlayerState[];
  entities: GameEntity[];
  quests: QuestProgress[];
  worldState: Record<string, unknown>;
}

// Input snapshot from client
export interface InputSnapshot {
  sequence: number;
  playerId: string;
  input: InputState;
  timestamp: number;
}

// Room/Game session
export interface GameRoom {
  id: string;
  code: string;
  hostId: string;
  players: PlayerState[];
  maxPlayers: number;
  chapterId: string;
  state: 'waiting' | 'playing' | 'completed';
  createdAt: number;
  lastActivity: number;
}

// Chapter/Level data
export interface Chapter {
  id: string;
  name: string;
  description: string;
  biome: string;
  assets: string[];
  spawnPoints: Vector3[];
  objectives: string[];
  maxPlayers: number;
  estimatedDuration: number;
}

// Zod schemas for validation
export const Vector3Schema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number()
});

export const QuaternionSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
  w: z.number()
});

export const InputStateSchema = z.object({
  forward: z.boolean(),
  backward: z.boolean(),
  left: z.boolean(),
  right: z.boolean(),
  jump: z.boolean(),
  run: z.boolean(),
  dash: z.boolean(),
  attack: z.boolean(),
  interact: z.boolean(),
  useItem: z.boolean()
});

export const PlayerStateSchema = z.object({
  id: z.string(),
  userId: z.string(),
  username: z.string(),
  position: Vector3Schema,
  velocity: Vector3Schema,
  rotation: QuaternionSchema,
  health: z.number().min(0),
  maxHealth: z.number().min(1),
  animationState: z.nativeEnum(AnimationState),
  inventory: z.array(z.object({
    id: z.string(),
    type: z.nativeEnum(ItemType),
    name: z.string(),
    description: z.string(),
    quantity: z.number().min(1),
    metadata: z.record(z.unknown()).optional()
  })),
  xp: z.number().min(0),
  level: z.number().min(1),
  lastInputSequence: z.number(),
  lastServerTick: z.number()
});

export const GameSnapshotSchema = z.object({
  tick: z.number(),
  timestamp: z.number(),
  players: z.array(PlayerStateSchema),
  entities: z.array(z.object({
    id: z.string(),
    type: z.string(),
    position: Vector3Schema,
    rotation: QuaternionSchema,
    health: z.number().optional(),
    metadata: z.record(z.unknown()).optional()
  })),
  quests: z.array(z.object({
    id: z.string(),
    state: z.nativeEnum(QuestState),
    cluesFound: z.array(z.string()),
    objectives: z.array(z.string()),
    completedObjectives: z.array(z.string()),
    startTime: z.number(),
    lastUpdateTime: z.number()
  })),
  worldState: z.record(z.unknown())
});

export const InputSnapshotSchema = z.object({
  sequence: z.number(),
  playerId: z.string(),
  input: InputStateSchema,
  timestamp: z.number()
});

// Type exports
export type {
  Vector3,
  Quaternion,
  InputState,
  PlayerState,
  InventoryItem,
  GameEntity,
  QuestProgress,
  GameSnapshot,
  InputSnapshot,
  GameRoom,
  Chapter
};
