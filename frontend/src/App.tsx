import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GameProvider } from './store/GameStore';
import { LobbyScreen } from './components/LobbyScreen';
import { GameScreen } from './components/GameScreen';
import { LoadingScreen } from './components/LoadingScreen';

// Create a new query client for this component
const queryClient = new QueryClient();

export type GameState = 'lobby' | 'loading' | 'playing' | 'paused';

export interface GameSession {
  roomCode: string;
  roomId: string;
  playerId: string;
  username: string;
  chapterId: string;
}

function App() {
  const [gameState, setGameState] = useState<GameState>('lobby');
  const [gameSession, setGameSession] = useState<GameSession | null>(null);

  const handleStartGame = (session: GameSession) => {
    setGameSession(session);
    setGameState('loading');
    
    // Simulate loading time
    setTimeout(() => {
      setGameState('playing');
    }, 2000);
  };

  const handleReturnToLobby = () => {
    setGameState('lobby');
    setGameSession(null);
  };

  const handlePauseGame = () => {
    setGameState('paused');
  };

  const handleResumeGame = () => {
    setGameState('playing');
  };

  const renderGameContent = () => {
    switch (gameState) {
      case 'lobby':
        return (
          <LobbyScreen 
            onStartGame={handleStartGame}
          />
        );
      
      case 'loading':
        return (
          <LoadingScreen 
            gameSession={gameSession!}
            onLoadingComplete={() => setGameState('playing')}
          />
        );
      
      case 'playing':
        return (
          <GameScreen 
            gameSession={gameSession!}
            onPause={handlePauseGame}
            onReturnToLobby={handleReturnToLobby}
          />
        );
      
      case 'paused':
        return (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="cyber-panel text-center p-8">
              <h2 className="text-2xl font-cyber text-neon-blue mb-4">Game Paused</h2>
              <div className="space-y-4">
                <button 
                  onClick={handleResumeGame}
                  className="btn-primary w-full"
                >
                  Resume Game
                </button>
                <button 
                  onClick={handleReturnToLobby}
                  className="btn-secondary w-full"
                >
                  Return to Lobby
                </button>
              </div>
            </div>
          </div>
        );
      
      default:
        return <LobbyScreen onStartGame={handleStartGame} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <GameProvider>
        <div className="min-h-screen bg-cyber-dark text-white font-sans">
          {/* Header */}
          <header className="bg-cyber-gray border-b border-cyber-light p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-cyber text-neon-blue text-shadow">
                  PortPlay
                </h1>
                <span className="text-sm text-gray-400">
                  Multiplayer 3D Adventure
                </span>
              </div>
              
              {gameState === 'playing' && gameSession && (
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-gray-300">
                    Room: <span className="text-neon-blue font-mono">{gameSession.roomCode}</span>
                  </span>
                  <span className="text-gray-300">
                    Player: <span className="text-neon-green">{gameSession.username}</span>
                  </span>
                </div>
              )}
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            {renderGameContent()}
          </main>

          {/* Footer */}
          <footer className="bg-cyber-gray border-t border-cyber-light p-4">
            <div className="max-w-7xl mx-auto text-center text-sm text-gray-400">
              <p>© 2024 PortPlay. Built with React, Three.js, and Socket.io</p>
            </div>
          </footer>
        </div>
      </GameProvider>
    </QueryClientProvider>
  );
}

export default App;
