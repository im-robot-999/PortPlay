import React, { ReactNode } from 'react';
import { create } from 'zustand';
import { PlayerState, GameSnapshot, InputState } from '@portplay/shared';

interface GameState {
  // Player state
  playerId: string;
  username: string;
  playerState: PlayerState | null;
  
  // Game state
  currentRoom: string | null;
  gameSnapshot: GameSnapshot | null;
  isConnected: boolean;
  isGameRunning: boolean;
  
  // Input state
  currentInput: InputState;
  inputSequence: number;
  
  // UI state
  showInventory: boolean;
  showChat: boolean;
  showPauseMenu: boolean;
  
  // Actions
  setPlayer: (playerId: string, username: string) => void;
  setPlayerState: (state: PlayerState) => void;
  setGameSnapshot: (snapshot: GameSnapshot) => void;
  setCurrentRoom: (roomId: string | null) => void;
  setConnectionStatus: (connected: boolean) => void;
  setGameRunning: (running: boolean) => void;
  updateInput: (input: Partial<InputState>) => void;
  resetInput: () => void;
  incrementInputSequence: () => void;
  toggleInventory: () => void;
  toggleChat: () => void;
  togglePauseMenu: () => void;
  resetGame: () => void;
}

// Create the Zustand store hook
const useGameStore = create<GameState>((set) => ({
  // Initial state
  playerId: '',
  username: '',
  playerState: null,
  currentRoom: null,
  gameSnapshot: null,
  isConnected: false,
  isGameRunning: false,
  currentInput: {
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
  },
  inputSequence: 0,
  showInventory: false,
  showChat: false,
  showPauseMenu: false,

  // Actions
  setPlayer: (playerId: string, username: string) => {
    set({ playerId, username });
  },

  setPlayerState: (state: PlayerState) => {
    set({ playerState: state });
  },

  setGameSnapshot: (snapshot: GameSnapshot) => {
    set((state) => {
      const me = state.playerId ? snapshot.players.find(p => p.id === state.playerId) : undefined;
      return {
        gameSnapshot: snapshot,
        playerState: me ?? state.playerState
      };
    });
  },

  setCurrentRoom: (roomId: string | null) => {
    set({ currentRoom: roomId });
  },

  setConnectionStatus: (connected: boolean) => {
    set({ isConnected: connected });
  },

  setGameRunning: (running: boolean) => {
    set({ isGameRunning: running });
  },

  updateInput: (input: Partial<InputState>) => {
    set((state) => ({
      currentInput: { ...state.currentInput, ...input }
    }));
  },

  resetInput: () => {
    set({
      currentInput: {
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
      }
    });
  },

  incrementInputSequence: () => {
    set((state) => ({ inputSequence: state.inputSequence + 1 }));
  },

  toggleInventory: () => {
    set((state) => ({ showInventory: !state.showInventory }));
  },

  toggleChat: () => {
    set((state) => ({ showChat: !state.showChat }));
  },

  togglePauseMenu: () => {
    set((state) => ({ showPauseMenu: !state.showPauseMenu }));
  },

  resetGame: () => {
    set({
      playerId: '',
      username: '',
      playerState: null,
      currentRoom: null,
      gameSnapshot: null,
      isConnected: false,
      isGameRunning: false,
      currentInput: {
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
      },
      inputSequence: 0,
      showInventory: false,
      showChat: false,
      showPauseMenu: false
    });
  }
}));

// No-op provider for compatibility with existing App.tsx
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// Export the hook directly for components
export const useGame = useGameStore;

// Export the store for direct usage if needed
export { useGameStore };
