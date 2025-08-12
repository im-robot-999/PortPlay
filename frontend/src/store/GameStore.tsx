import React, { createContext, useContext, ReactNode } from 'react';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { PlayerState, GameSnapshot, InputState } from '@portplay/shared';
import { ClientUtils } from '../game/functions';

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

const useGameStore = create<GameState>()(
  devtools(
    (set, get) => ({
      // Initial state
      playerId: '',
      username: '',
      playerState: null,
      currentRoom: null,
      gameSnapshot: null,
      isConnected: false,
      isGameRunning: false,
      currentInput: ClientUtils.createDefaultInputState(),
      inputSequence: 0,
      showInventory: false,
      showChat: false,
      showPauseMenu: false,

      // Actions
      setPlayer: (playerId: string, username: string) => {
        const playerState = ClientUtils.createDefaultPlayerState(playerId, username);
        set({
          playerId,
          username,
          playerState
        });
      },

      setPlayerState: (state: PlayerState) => {
        set({ playerState: state });
      },

      setGameSnapshot: (snapshot: GameSnapshot) => {
        set({ gameSnapshot: snapshot });
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
        set({ currentInput: ClientUtils.createDefaultInputState() });
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
          currentInput: ClientUtils.createDefaultInputState(),
          inputSequence: 0,
          showInventory: false,
          showChat: false,
          showPauseMenu: false
        });
      }
    }),
    {
      name: 'portplay-game-store'
    }
  )
);

// Context for React components
const GameContext = createContext<ReturnType<typeof useGameStore> | null>(null);

// Provider component
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const store = useGameStore();
  
  return (
    <GameContext.Provider value={store}>
      {children}
    </GameContext.Provider>
  );
};

// Hook for using the store in components
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

// Export the store for direct usage
export { useGameStore };
