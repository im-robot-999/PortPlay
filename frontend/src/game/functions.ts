import { 
  Vector3, 
  Quaternion, 
  PlayerState, 
  GameSnapshot, 
  InputSnapshot, 
  InputState,
  AnimationState
} from '@portplay/shared';

/**
 * Client-side game constants
 */
export const CLIENT_CONSTANTS = {
  PREDICTION_WINDOW: 100, // ms
  RECONCILIATION_SMOOTHING: 0.1, // smoothing factor for position corrections
  INPUT_BUFFER_SIZE: 10, // number of inputs to buffer
  MAX_INTERPOLATION_DELAY: 100, // ms
  CAMERA_SMOOTHING: 0.1, // camera follow smoothing
  FOV: 75, // field of view
  NEAR_PLANE: 0.1,
  FAR_PLANE: 1000
} as const;

/**
 * Input buffering and prediction functions
 */

/**
 * Input buffer for storing recent inputs
 */
export class InputBuffer {
  private inputs: InputSnapshot[] = [];
  private maxSize: number;

  constructor(maxSize: number = CLIENT_CONSTANTS.INPUT_BUFFER_SIZE) {
    this.maxSize = maxSize;
  }

  /**
   * Adds an input to the buffer
   */
  addInput(input: InputSnapshot): void {
    this.inputs.push(input);
    
    // Remove old inputs if buffer is full
    if (this.inputs.length > this.maxSize) {
      this.inputs.shift();
    }
  }

  /**
   * Gets all inputs in the buffer
   */
  getInputs(): InputSnapshot[] {
    return [...this.inputs];
  }

  /**
   * Clears the input buffer
   */
  clear(): void {
    this.inputs = [];
  }

  /**
   * Gets the latest input
   */
  getLatestInput(): InputSnapshot | undefined {
    return this.inputs[this.inputs.length - 1];
  }

  /**
   * Gets inputs within a time window
   */
  getInputsInWindow(startTime: number, endTime: number): InputSnapshot[] {
    return this.inputs.filter(
      input => input.timestamp >= startTime && input.timestamp <= endTime
    );
  }
}

/**
 * Client-side prediction system
 */
export class ClientPrediction {
  private inputBuffer: InputBuffer;
  private predictedState: PlayerState | null = null;
  private lastServerSnapshot: GameSnapshot | null = null;

  constructor() {
    this.inputBuffer = new InputBuffer();
  }

  /**
   * Predicts player state based on current input and last known state
   */
  predictPlayerState(
    currentInput: InputState,
    lastKnownState: PlayerState,
    deltaTime: number
  ): PlayerState {
    // Apply input to last known state
    const predictedState = this.applyInputToPlayer(lastKnownState, currentInput, deltaTime);
    
    // Store prediction for later reconciliation
    this.predictedState = predictedState;
    
    return predictedState;
  }

  /**
   * Applies input to player state (client-side physics)
   */
  private applyInputToPlayer(
    player: PlayerState,
    input: InputState,
    deltaTime: number
  ): PlayerState {
    let newPosition = { ...player.position };
    let newVelocity = { ...player.velocity };
    let newAnimationState = player.animationState;

    // Simple movement prediction
    const moveSpeed = input.run ? 7.5 : 5; // Slightly faster than server for responsiveness
    
    if (input.forward) newPosition.z -= moveSpeed * deltaTime;
    if (input.backward) newPosition.z += moveSpeed * deltaTime;
    if (input.left) newPosition.x -= moveSpeed * deltaTime;
    if (input.right) newPosition.x += moveSpeed * deltaTime;

    // Jump prediction
    if (input.jump && player.position.y <= 0.1) {
      newVelocity.y = 8.0;
      newAnimationState = 'jumping';
    }

    // Dash prediction
    if (input.dash) {
      const dashDirection = this.normalizeMovementVector(input);
      newVelocity.x += dashDirection.x * 15.0;
      newVelocity.z += dashDirection.z * 15.0;
      newAnimationState = 'dashing';
    }

    // Update position based on velocity
    newPosition.x += newVelocity.x * deltaTime;
    newPosition.y += newVelocity.y * deltaTime;
    newPosition.z += newVelocity.z * deltaTime;

    // Apply gravity
    newVelocity.y -= 9.8 * deltaTime;

    // Ground collision
    if (newPosition.y < 0) {
      newPosition.y = 0;
      newVelocity.y = 0;
      newAnimationState = player.velocity.y < -2 ? 'falling' : 'idle';
    }

    // Update animation state
    if (Math.abs(newVelocity.x) > 0.1 || Math.abs(newVelocity.z) > 0.1) {
      if (input.run) {
        newAnimationState = 'running';
      } else {
        newAnimationState = 'walking';
      }
    } else if (newPosition.y <= 0.1) {
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
   * Normalizes movement input into a direction vector
   */
  private normalizeMovementVector(input: InputState): Vector3 {
    let x = 0;
    let z = 0;

    if (input.forward) z -= 1;
    if (input.backward) z += 1;
    if (input.left) x -= 1;
    if (input.right) x += 1;

    if (x === 0 && z === 0) {
      return { x: 0, y: 0, z: 0 };
    }

    const length = Math.sqrt(x * x + z * z);
    return { x: x / length, y: 0, z: z / length };
  }

  /**
   * Reconciles predicted state with server snapshot
   */
  reconcileWithServer(
    serverSnapshot: GameSnapshot,
    playerId: string
  ): PlayerState | null {
    const serverPlayer = serverSnapshot.players.find(p => p.id === playerId);
    if (!serverPlayer || !this.predictedState) return null;

    // Calculate position difference
    const positionDiff = {
      x: serverPlayer.position.x - this.predictedState.position.x,
      y: serverPlayer.position.y - this.predictedState.position.y,
      z: serverPlayer.position.z - this.predictedState.position.z
    };

    // If difference is significant, apply correction
    const threshold = 0.5; // meters
    if (Math.abs(positionDiff.x) > threshold || 
        Math.abs(positionDiff.y) > threshold || 
        Math.abs(positionDiff.z) > threshold) {
      
      // Smooth correction over time
      const correctedPosition = {
        x: this.predictedState.position.x + positionDiff.x * CLIENT_CONSTANTS.RECONCILIATION_SMOOTHING,
        y: this.predictedState.position.y + positionDiff.y * CLIENT_CONSTANTS.RECONCILIATION_SMOOTHING,
        z: this.predictedState.position.z + positionDiff.z * CLIENT_CONSTANTS.RECONCILIATION_SMOOTHING
      };

      const reconciledState = {
        ...this.predictedState,
        position: correctedPosition,
        velocity: serverPlayer.velocity,
        animationState: serverPlayer.animationState
      };

      // Update last server snapshot
      this.lastServerSnapshot = serverSnapshot;
      
      return reconciledState;
    }

    return this.predictedState;
  }

  /**
   * Gets the input buffer
   */
  getInputBuffer(): InputBuffer {
    return this.inputBuffer;
  }

  /**
   * Gets the last predicted state
   */
  getPredictedState(): PlayerState | null {
    return this.predictedState;
  }

  /**
   * Gets the last server snapshot
   */
  getLastServerSnapshot(): GameSnapshot | null {
    return this.lastServerSnapshot;
  }
}

/**
 * Interpolation functions for smooth rendering
 */
export class Interpolation {
  /**
   * Interpolates between two Vector3 values
   */
  static interpolateVector3(
    a: Vector3,
    b: Vector3,
    alpha: number
  ): Vector3 {
    return {
      x: a.x + (b.x - a.x) * alpha,
      y: a.y + (b.y - a.y) * alpha,
      z: a.z + (b.z - a.z) * alpha
    };
  }

  /**
   * Interpolates between two Quaternion values
   */
  static interpolateQuaternion(
    a: Quaternion,
    b: Quaternion,
    alpha: number
  ): Quaternion {
    // Simple linear interpolation for quaternions
    // In production, you'd want to use spherical linear interpolation (SLERP)
    return {
      x: a.x + (b.x - a.x) * alpha,
      y: a.y + (b.y - a.y) * alpha,
      z: a.z + (b.z - a.z) * alpha,
      w: a.w + (b.w - a.w) * alpha
    };
  }

  /**
   * Interpolates between two game snapshots
   */
  static interpolateSnapshots(
    snapshot1: GameSnapshot,
    snapshot2: GameSnapshot,
    alpha: number
  ): GameSnapshot {
    const interpolatedPlayers = snapshot1.players.map((player1, index) => {
      const player2 = snapshot2.players[index];
      if (!player2) return player1;

      return {
        ...player1,
        position: this.interpolateVector3(player1.position, player2.position, alpha),
        velocity: this.interpolateVector3(player1.velocity, player2.velocity, alpha),
        rotation: this.interpolateQuaternion(player1.rotation, player2.rotation, alpha)
      };
    });

    return {
      ...snapshot1,
      players: interpolatedPlayers
    };
  }
}

/**
 * Camera control functions
 */
export class CameraController {
  /**
   * Calculates camera position to follow a target
   */
  static calculateFollowPosition(
    targetPosition: Vector3,
    targetRotation: Quaternion,
    offset: Vector3 = { x: 0, y: 5, z: 10 }
  ): Vector3 {
    // Convert quaternion to Euler angles for camera positioning
    const yaw = Math.atan2(
      2 * (targetRotation.w * targetRotation.y + targetRotation.x * targetRotation.z),
      1 - 2 * (targetRotation.y * targetRotation.y + targetRotation.z * targetRotation.z)
    );

    // Calculate camera position behind and above target
    const cameraX = targetPosition.x - Math.sin(yaw) * offset.z;
    const cameraZ = targetPosition.z - Math.cos(yaw) * offset.z;
    const cameraY = targetPosition.y + offset.y;

    return { x: cameraX, y: cameraY, z: cameraZ };
  }

  /**
   * Smoothly follows a target with camera
   */
  static smoothFollow(
    currentCameraPosition: Vector3,
    targetCameraPosition: Vector3,
    smoothing: number = CLIENT_CONSTANTS.CAMERA_SMOOTHING
  ): Vector3 {
    return {
      x: currentCameraPosition.x + (targetCameraPosition.x - currentCameraPosition.x) * smoothing,
      y: currentCameraPosition.y + (targetCameraPosition.y - currentCameraPosition.y) * smoothing,
      z: currentCameraPosition.z + (targetCameraPosition.z - currentCameraPosition.z) * smoothing
    };
  }
}

/**
 * Utility functions for client-side game logic
 */
export class ClientUtils {
  /**
   * Creates a default input state
   */
  static createDefaultInputState(): InputState {
    return {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false,
      run: false,
      dash: false,
      attack: false,
      interact: false,
      useItem: false
    };
  }

  /**
   * Creates a default player state
   */
  static createDefaultPlayerState(
    id: string,
    username: string
  ): PlayerState {
    return {
      id,
      userId: id,
      username,
      position: { x: 0, y: 1, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      health: 100,
      maxHealth: 100,
      animationState: 'idle',
      inventory: [],
      xp: 0,
      level: 1,
      lastInputSequence: 0,
      lastServerTick: 0
    };
  }

  /**
   * Calculates distance between two points
   */
  static distance(a: Vector3, b: Vector3): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Checks if two positions are close enough
   */
  static isNear(a: Vector3, b: Vector3, threshold: number = 1.0): boolean {
    return this.distance(a, b) <= threshold;
  }

  /**
   * Formats time in MM:SS format
   */
  static formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Generates a unique ID
   */
  static generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
