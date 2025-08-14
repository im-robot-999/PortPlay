import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Game state interfaces
interface GameObjective {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
}

interface Collectible {
  id: string;
  type: 'item' | 'clue' | 'artifact';
  name: string;
  description: string;
  collected: boolean;
  position: [number, number, number];
}

interface GameProgress {
  objectives: GameObjective[];
  collectibles: Collectible[];
  score: number;
  timeElapsed: number;
  chapterCompleted: boolean;
}

interface GameMechanicsState {
  currentChapter: string;
  progress: GameProgress;
  playerPosition: [number, number, number];
  playerHealth: number;
  playerInventory: string[];
  gameState: 'playing' | 'paused' | 'completed' | 'failed';
}

// Action types
type GameAction =
  | { type: 'COLLECT_ITEM'; itemId: string }
  | { type: 'COMPLETE_OBJECTIVE'; objectiveId: string }
  | { type: 'UPDATE_PLAYER_POSITION'; position: [number, number, number] }
  | { type: 'UPDATE_PLAYER_HEALTH'; health: number }
  | { type: 'ADD_TO_INVENTORY'; item: string }
  | { type: 'REMOVE_FROM_INVENTORY'; item: string }
  | { type: 'UPDATE_GAME_STATE'; state: GameMechanicsState['gameState'] }
  | { type: 'RESET_CHAPTER' }
  | { type: 'UPDATE_TIME'; time: number };

// Initial game data
const initialObjectives: Record<string, GameObjective[]> = {
  'neon-docks': [
    {
      id: 'find-crate',
      title: 'Find the Misplaced Crate',
      description: 'Locate the mysterious crate containing important clues',
      completed: false,
      required: true
    },
    {
      id: 'locate-manifest',
      title: 'Locate the Manifest',
      description: 'Find the shipping manifest with cargo details',
      completed: false,
      required: true
    },
    {
      id: 'identify-container',
      title: 'Identify Suspicious Container',
      description: 'Examine the suspicious container for evidence',
      completed: false,
      required: true
    }
  ],
  'forest-ladles': [
    {
      id: 'find-chef',
      title: 'Find the NPC Chef',
      description: 'Locate the mysterious chef who holds an old map',
      completed: false,
      required: true
    },
    {
      id: 'collect-map-fragments',
      title: 'Collect Map Fragments',
      description: 'Gather scattered pieces of the ancient map',
      completed: false,
      required: true
    },
    {
      id: 'assemble-map',
      title: 'Assemble the Complete Map',
      description: 'Piece together the complete map to reveal secrets',
      completed: false,
      required: true
    }
  ],
  'spooky-museum': [
    {
      id: 'solve-puzzles',
      title: 'Solve Museum Puzzles',
      description: 'Complete the various puzzles scattered throughout the museum',
      completed: false,
      required: true
    },
    {
      id: 'restore-ghost-memories',
      title: 'Restore Curator Ghost Memories',
      description: 'Help the ghost curator recover their lost memories',
      completed: false,
      required: true
    },
    {
      id: 'get-port-coordinates',
      title: 'Get Port Coordinates',
      description: 'Obtain the coordinates to the mysterious port',
      completed: false,
      required: true
    }
  ]
};

const initialCollectibles: Record<string, Collectible[]> = {
  'neon-docks': [
    {
      id: 'neon-orb-1',
      type: 'item',
      name: 'Neon Orb',
      description: 'A glowing orb with mysterious energy',
      collected: false,
      position: [-5, 1, -10]
    },
    {
      id: 'cargo-manifest',
      type: 'clue',
      name: 'Cargo Manifest',
      description: 'Document listing all cargo in the shipment',
      collected: false,
      position: [0, 0.5, -20]
    },
    {
      id: 'suspicious-crate',
      type: 'artifact',
      name: 'Suspicious Crate',
      description: 'A crate that seems out of place',
      collected: false,
      position: [-8, 1.5, -5]
    }
  ],
  'forest-ladles': [
    {
      id: 'golden-ladle-1',
      type: 'item',
      name: 'Golden Ladle',
      description: 'A beautiful golden cooking ladle',
      collected: false,
      position: [5, 1, 5]
    },
    {
      id: 'map-fragment-1',
      type: 'clue',
      name: 'Map Fragment',
      description: 'A piece of an ancient map',
      collected: false,
      position: [-5, 1, -5]
    },
    {
      id: 'chef-note',
      type: 'clue',
      name: 'Chef\'s Note',
      description: 'A note from the mysterious chef',
      collected: false,
      position: [0, 1, -20]
    }
  ],
  'spooky-museum': [
    {
      id: 'ancient-artifact',
      type: 'artifact',
      name: 'Ancient Artifact',
      description: 'A mysterious artifact with glowing runes',
      collected: false,
      position: [-15, 1, -15]
    },
    {
      id: 'ghost-memory-1',
      type: 'clue',
      name: 'Ghost Memory Fragment',
      description: 'A fragment of the curator\'s memory',
      collected: false,
      position: [15, 1, -15]
    },
    {
      id: 'museum-key',
      type: 'item',
      name: 'Museum Key',
      description: 'A key that unlocks hidden areas',
      collected: false,
      position: [0, 1, 0]
    }
  ]
};

// Game mechanics reducer
const gameMechanicsReducer = (state: GameMechanicsState, action: GameAction): GameMechanicsState => {
  switch (action.type) {
    case 'COLLECT_ITEM': {
      const updatedCollectibles = state.progress.collectibles.map(item =>
        item.id === action.itemId ? { ...item, collected: true } : item
      );
      
      const score = state.progress.score + 100;
      
      return {
        ...state,
        progress: {
          ...state.progress,
          collectibles: updatedCollectibles,
          score
        }
      };
    }

    case 'COMPLETE_OBJECTIVE': {
      const updatedObjectives = state.progress.objectives.map(obj =>
        obj.id === action.objectiveId ? { ...obj, completed: true } : obj
      );
      
      const score = state.progress.score + 500;
      const chapterCompleted = updatedObjectives.every(obj => obj.completed);
      
      return {
        ...state,
        progress: {
          ...state.progress,
          objectives: updatedObjectives,
          score,
          chapterCompleted
        }
      };
    }

    case 'UPDATE_PLAYER_POSITION':
      return {
        ...state,
        playerPosition: action.position
      };

    case 'UPDATE_PLAYER_HEALTH':
      return {
        ...state,
        playerHealth: Math.max(0, Math.min(100, action.health))
      };

    case 'ADD_TO_INVENTORY':
      return {
        ...state,
        playerInventory: [...state.playerInventory, action.item]
      };

    case 'REMOVE_FROM_INVENTORY':
      return {
        ...state,
        playerInventory: state.playerInventory.filter(item => item !== action.item)
      };

    case 'UPDATE_GAME_STATE':
      return {
        ...state,
        gameState: action.state
      };

    case 'UPDATE_TIME':
      return {
        ...state,
        progress: {
          ...state.progress,
          timeElapsed: action.time
        }
      };

    case 'RESET_CHAPTER':
      return {
        ...state,
        progress: {
          objectives: initialObjectives[state.currentChapter] || [],
          collectibles: initialCollectibles[state.currentChapter] || [],
          score: 0,
          timeElapsed: 0,
          chapterCompleted: false
        },
        playerHealth: 100,
        playerInventory: [],
        gameState: 'playing'
      };

    default:
      return state;
  }
};

// Game mechanics context
interface GameMechanicsContextType {
  state: GameMechanicsState;
  dispatch: React.Dispatch<GameAction>;
  collectItem: (itemId: string) => void;
  completeObjective: (objectiveId: string) => void;
  updatePlayerPosition: (position: [number, number, number]) => void;
  updatePlayerHealth: (health: number) => void;
  addToInventory: (item: string) => void;
  removeFromInventory: (item: string) => void;
  resetChapter: () => void;
  getProgressPercentage: () => number;
  getChapterObjectives: () => GameObjective[];
  getChapterCollectibles: () => Collectible[];
}

const GameMechanicsContext = createContext<GameMechanicsContextType | undefined>(undefined);

// Game mechanics provider
interface GameMechanicsProviderProps {
  children: ReactNode;
  chapterId: string;
}

export const GameMechanicsProvider: React.FC<GameMechanicsProviderProps> = ({ 
  children, 
  chapterId 
}) => {
  const initialState: GameMechanicsState = {
    currentChapter: chapterId,
    progress: {
      objectives: initialObjectives[chapterId] || [],
      collectibles: initialCollectibles[chapterId] || [],
      score: 0,
      timeElapsed: 0,
      chapterCompleted: false
    },
    playerPosition: [0, 1, 0],
    playerHealth: 100,
    playerInventory: [],
    gameState: 'playing'
  };

  const [state, dispatch] = useReducer(gameMechanicsReducer, initialState);

  // Helper functions
  const collectItem = (itemId: string) => {
    dispatch({ type: 'COLLECT_ITEM', itemId });
  };

  const completeObjective = (objectiveId: string) => {
    dispatch({ type: 'COMPLETE_OBJECTIVE', objectiveId });
  };

  const updatePlayerPosition = (position: [number, number, number]) => {
    dispatch({ type: 'UPDATE_PLAYER_POSITION', position });
  };

  const updatePlayerHealth = (health: number) => {
    dispatch({ type: 'UPDATE_PLAYER_HEALTH', health });
  };

  const addToInventory = (item: string) => {
    dispatch({ type: 'ADD_TO_INVENTORY', item });
  };

  const removeFromInventory = (item: string) => {
    dispatch({ type: 'REMOVE_FROM_INVENTORY', item });
  };

  const resetChapter = () => {
    dispatch({ type: 'RESET_CHAPTER' });
  };

  const getProgressPercentage = () => {
    const totalObjectives = state.progress.objectives.length;
    const completedObjectives = state.progress.objectives.filter(obj => obj.completed).length;
    return totalObjectives > 0 ? (completedObjectives / totalObjectives) * 100 : 0;
  };

  const getChapterObjectives = () => {
    return state.progress.objectives;
  };

  const getChapterCollectibles = () => {
    return state.progress.collectibles;
  };

  const contextValue: GameMechanicsContextType = {
    state,
    dispatch,
    collectItem,
    completeObjective,
    updatePlayerPosition,
    updatePlayerHealth,
    addToInventory,
    removeFromInventory,
    resetChapter,
    getProgressPercentage,
    getChapterObjectives,
    getChapterCollectibles
  };

  return (
    <GameMechanicsContext.Provider value={contextValue}>
      {children}
    </GameMechanicsContext.Provider>
  );
};

// Hook to use game mechanics
export const useGameMechanics = () => {
  const context = useContext(GameMechanicsContext);
  if (context === undefined) {
    throw new Error('useGameMechanics must be used within a GameMechanicsProvider');
  }
  return context;
};

// Utility functions for game interactions
export const checkProximity = (
  playerPos: [number, number, number], 
  targetPos: [number, number, number], 
  threshold: number = 2
): boolean => {
  const [px, py, pz] = playerPos;
  const [tx, ty, tz] = targetPos;
  const distance = Math.sqrt((px - tx) ** 2 + (py - ty) ** 2 + (pz - tz) ** 2);
  return distance <= threshold;
};

export const calculateScore = (
  objectives: GameObjective[], 
  collectibles: Collectible[], 
  timeElapsed: number
): number => {
  const objectiveScore = objectives.filter(obj => obj.completed).length * 500;
  const collectibleScore = collectibles.filter(col => col.collected).length * 100;
  const timeBonus = Math.max(0, 1000 - Math.floor(timeElapsed / 60) * 10);
  return objectiveScore + collectibleScore + timeBonus;
};
