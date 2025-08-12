import { Vector3, Quaternion, PlayerState, GameSnapshot, InputSnapshot } from './types';

/**
 * Vector3 utility functions
 */

/**
 * Creates a new Vector3 with the given coordinates
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param z - Z coordinate
 * @returns New Vector3 instance
 */
export function createVector3(x: number, y: number, z: number): Vector3 {
  return { x, y, z };
}

/**
 * Adds two Vector3 values
 * @param a - First vector
 * @param b - Second vector
 * @returns New Vector3 with sum
 */
export function addVector3(a: Vector3, b: Vector3): Vector3 {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
    z: a.z + b.z
  };
}

/**
 * Subtracts Vector3 b from Vector3 a
 * @param a - First vector
 * @param b - Second vector
 * @returns New Vector3 with difference
 */
export function subtractVector3(a: Vector3, b: Vector3): Vector3 {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z
  };
}

/**
 * Multiplies Vector3 by a scalar
 * @param vector - Vector to multiply
 * @param scalar - Scalar value
 * @returns New Vector3 with product
 */
export function multiplyVector3(vector: Vector3, scalar: number): Vector3 {
  return {
    x: vector.x * scalar,
    y: vector.y * scalar,
    z: vector.z * scalar
  };
}

/**
 * Calculates the magnitude (length) of a Vector3
 * @param vector - Vector to calculate magnitude for
 * @returns Magnitude value
 */
export function magnitudeVector3(vector: Vector3): number {
  return Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
}

/**
 * Normalizes a Vector3 to unit length
 * @param vector - Vector to normalize
 * @returns Normalized Vector3
 */
export function normalizeVector3(vector: Vector3): Vector3 {
  const mag = magnitudeVector3(vector);
  if (mag === 0) return { x: 0, y: 0, z: 0 };
  return multiplyVector3(vector, 1 / mag);
}

/**
 * Calculates distance between two Vector3 points
 * @param a - First point
 * @param b - Second point
 * @returns Distance value
 */
export function distanceVector3(a: Vector3, b: Vector3): number {
  return magnitudeVector3(subtractVector3(a, b));
}

/**
 * Quaternion utility functions
 */

/**
 * Creates a new Quaternion with the given values
 * @param x - X component
 * @param y - Y component
 * @param z - Z component
 * @param w - W component
 * @returns New Quaternion instance
 */
export function createQuaternion(x: number, y: number, z: number, w: number): Quaternion {
  return { x, y, z, w };
}

/**
 * Creates a quaternion from Euler angles (in radians)
 * @param x - X rotation (pitch)
 * @param y - Y rotation (yaw)
 * @param z - Z rotation (roll)
 * @returns New Quaternion
 */
export function quaternionFromEuler(x: number, y: number, z: number): Quaternion {
  const cx = Math.cos(x * 0.5);
  const sx = Math.sin(x * 0.5);
  const cy = Math.cos(y * 0.5);
  const sy = Math.sin(y * 0.5);
  const cz = Math.cos(z * 0.5);
  const sz = Math.sin(z * 0.5);

  return {
    x: sx * cy * cz - cx * sy * sz,
    y: cx * sy * cz + sx * cy * sz,
    z: cx * cy * sz - sx * sy * cz,
    w: cx * cy * cz + sx * sy * sz
  };
}

/**
 * Physics utility functions
 */

/**
 * Applies gravity to a velocity vector
 * @param velocity - Current velocity
 * @param gravity - Gravity strength (negative for downward)
 * @param deltaTime - Time since last update
 * @returns Updated velocity
 */
export function applyGravity(velocity: Vector3, gravity: number, deltaTime: number): Vector3 {
  return {
    ...velocity,
    y: velocity.y + gravity * deltaTime
  };
}

/**
 * Applies friction to a velocity vector
 * @param velocity - Current velocity
 * @param friction - Friction coefficient (0-1)
 * @param deltaTime - Time since last update
 * @returns Updated velocity
 */
export function applyFriction(velocity: Vector3, friction: number, deltaTime: number): Vector3 {
  const frictionFactor = Math.pow(friction, deltaTime);
  return multiplyVector3(velocity, frictionFactor);
}

/**
 * Checks if two 3D objects are colliding using AABB (Axis-Aligned Bounding Box)
 * @param pos1 - Position of first object
 * @param size1 - Size of first object
 * @param pos2 - Position of second object
 * @param size2 - Size of second object
 * @returns True if objects are colliding
 */
export function checkAABBCollision(
  pos1: Vector3,
  size1: Vector3,
  pos2: Vector3,
  size2: Vector3
): boolean {
  return (
    pos1.x < pos2.x + size2.x &&
    pos1.x + size1.x > pos2.x &&
    pos1.y < pos2.y + size2.y &&
    pos1.y + size1.y > pos2.y &&
    pos1.z < pos2.z + size2.z &&
    pos1.z + size1.z > pos2.z
  );
}

/**
 * Hit detection functions
 */

/**
 * Checks if a ray intersects with a sphere
 * @param rayOrigin - Origin of the ray
 * @param rayDirection - Direction of the ray (normalized)
 * @param sphereCenter - Center of the sphere
 * @param sphereRadius - Radius of the sphere
 * @returns Distance to intersection or null if no intersection
 */
export function raySphereIntersection(
  rayOrigin: Vector3,
  rayDirection: Vector3,
  sphereCenter: Vector3,
  sphereRadius: number
): number | null {
  const oc = subtractVector3(rayOrigin, sphereCenter);
  const a = rayDirection.x * rayDirection.x + rayDirection.y * rayDirection.y + rayDirection.z * rayDirection.z;
  const b = 2 * (oc.x * rayDirection.x + oc.y * rayDirection.y + oc.z * rayDirection.z);
  const c = oc.x * oc.x + oc.y * oc.y + oc.z * oc.z - sphereRadius * sphereRadius;
  
  const discriminant = b * b - 4 * a * c;
  
  if (discriminant < 0) return null;
  
  const t1 = (-b - Math.sqrt(discriminant)) / (2 * a);
  const t2 = (-b + Math.sqrt(discriminant)) / (2 * a);
  
  if (t1 > 0) return t1;
  if (t2 > 0) return t2;
  
  return null;
}

/**
 * Calculates damage based on distance and weapon properties
 * @param baseDamage - Base damage of the weapon
 * @param distance - Distance to target
 * @param maxRange - Maximum effective range
 * @param falloffStart - Distance where damage starts to fall off
 * @returns Calculated damage
 */
export function calculateDamage(
  baseDamage: number,
  distance: number,
  maxRange: number,
  falloffStart: number
): number {
  if (distance > maxRange) return 0;
  if (distance <= falloffStart) return baseDamage;
  
  const falloffRange = maxRange - falloffStart;
  const falloffDistance = distance - falloffStart;
  const falloffFactor = 1 - (falloffDistance / falloffRange);
  
  return baseDamage * falloffFactor;
}

/**
 * Snapshot utility functions
 */

/**
 * Creates a diff between two game snapshots
 * @param oldSnapshot - Previous snapshot
 * @param newSnapshot - New snapshot
 * @returns Object containing only changed properties
 */
export function diffSnapshots(
  oldSnapshot: GameSnapshot,
  newSnapshot: GameSnapshot
): Partial<GameSnapshot> {
  const diff: Partial<GameSnapshot> = {};
  
  if (oldSnapshot.tick !== newSnapshot.tick) {
    diff.tick = newSnapshot.tick;
  }
  
  if (oldSnapshot.timestamp !== newSnapshot.timestamp) {
    diff.timestamp = newSnapshot.timestamp;
  }
  
  // Compare players
  const playerDiffs = newSnapshot.players.filter((newPlayer, index) => {
    const oldPlayer = oldSnapshot.players[index];
    return !oldPlayer || JSON.stringify(oldPlayer) !== JSON.stringify(newPlayer);
  });
  
  if (playerDiffs.length > 0) {
    diff.players = playerDiffs;
  }
  
  // Compare entities
  const entityDiffs = newSnapshot.entities.filter((newEntity, index) => {
    const oldEntity = oldSnapshot.entities[index];
    return !oldEntity || JSON.stringify(oldEntity) !== JSON.stringify(newEntity);
  });
  
  if (entityDiffs.length > 0) {
    diff.entities = entityDiffs;
  }
  
  // Compare quests
  const questDiffs = newSnapshot.quests.filter((newQuest, index) => {
    const oldQuest = oldSnapshot.quests[index];
    return !oldQuest || JSON.stringify(oldQuest) !== JSON.stringify(newQuest);
  });
  
  if (questDiffs.length > 0) {
    diff.quests = questDiffs;
  }
  
  // Compare world state
  if (JSON.stringify(oldSnapshot.worldState) !== JSON.stringify(newSnapshot.worldState)) {
    diff.worldState = newSnapshot.worldState;
  }
  
  return diff;
}

/**
 * Interpolates between two snapshots based on time
 * @param snapshot1 - First snapshot
 * @param snapshot2 - Second snapshot
 * @param alpha - Interpolation factor (0-1)
 * @returns Interpolated snapshot
 */
export function interpolateSnapshots(
  snapshot1: GameSnapshot,
  snapshot2: GameSnapshot,
  alpha: number
): GameSnapshot {
  const interpolatedPlayers = snapshot1.players.map((player1, index) => {
    const player2 = snapshot2.players[index];
    if (!player2) return player1;
    
    return {
      ...player1,
      position: {
        x: player1.position.x + (player2.position.x - player1.position.x) * alpha,
        y: player1.position.y + (player2.position.y - player1.position.y) * alpha,
        z: player1.position.z + (player2.position.z - player1.position.z) * alpha
      },
      velocity: {
        x: player1.velocity.x + (player2.velocity.x - player1.velocity.x) * alpha,
        y: player1.velocity.y + (player2.velocity.y - player1.velocity.y) * alpha,
        z: player1.velocity.z + (player2.velocity.z - player1.velocity.z) * alpha
      }
    };
  });
  
  return {
    ...snapshot1,
    players: interpolatedPlayers
  };
}

/**
 * Quest utility functions
 */

/**
 * Checks if a quest objective is completed
 * @param quest - Quest progress
 * @param objectiveId - ID of the objective to check
 * @returns True if objective is completed
 */
export function isObjectiveCompleted(quest: any, objectiveId: string): boolean {
  return quest.completedObjectives.includes(objectiveId);
}

/**
 * Adds a clue to a quest
 * @param quest - Quest progress
 * @param clueId - ID of the clue to add
 * @returns Updated quest progress
 */
export function addClueToQuest(quest: any, clueId: string): any {
  if (quest.cluesFound.includes(clueId)) {
    return quest; // Clue already found
  }
  
  return {
    ...quest,
    cluesFound: [...quest.cluesFound, clueId],
    lastUpdateTime: Date.now()
  };
}

/**
 * Completes an objective in a quest
 * @param quest - Quest progress
 * @param objectiveId - ID of the objective to complete
 * @returns Updated quest progress
 */
export function completeObjective(quest: any, objectiveId: string): any {
  if (isObjectiveCompleted(quest, objectiveId)) {
    return quest; // Objective already completed
  }
  
  return {
    ...quest,
    completedObjectives: [...quest.completedObjectives, objectiveId],
    lastUpdateTime: Date.now()
  };
}

/**
 * Checks if a quest is fully completed
 * @param quest - Quest progress
 * @returns True if all objectives are completed
 */
export function isQuestCompleted(quest: any): boolean {
  return quest.objectives.every((objective: string) => 
    isObjectiveCompleted(quest, objective)
  );
}
