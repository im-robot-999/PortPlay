import React, { useEffect, useState } from 'react';
import { GameSession } from '../App';

interface LoadingScreenProps {
  gameSession: GameSession;
  onLoadingComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  gameSession, 
  onLoadingComplete 
}) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState('Initializing...');

  useEffect(() => {
    const loadingStages = [
      'Initializing game engine...',
      'Loading 3D assets...',
      'Connecting to game server...',
      'Setting up multiplayer session...',
      'Preparing world...',
      'Almost ready...'
    ];

    let currentStage = 0;
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          setTimeout(onLoadingComplete, 500);
          return 100;
        }
        return newProgress;
      });
    }, 200);

    const stageInterval = setInterval(() => {
      if (currentStage < loadingStages.length - 1) {
        currentStage++;
        setLoadingStage(loadingStages[currentStage]);
      }
    }, 400);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stageInterval);
    };
  }, [onLoadingComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyber-dark via-cyber-gray to-cyber-dark flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto p-8">
        {/* Game Logo */}
        <div className="mb-8">
          <h1 className="text-5xl font-cyber text-neon-blue text-shadow mb-2">
            PortPlay
          </h1>
          <p className="text-gray-400">Loading your adventure...</p>
        </div>

        {/* Session Info */}
        <div className="cyber-panel mb-8">
          <h2 className="text-xl font-cyber text-neon-green mb-4">
            Session Details
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Room Code:</span>
              <div className="text-neon-blue font-mono text-lg tracking-widest">
                {gameSession.roomCode}
              </div>
            </div>
            <div>
              <span className="text-gray-400">Chapter:</span>
              <div className="text-neon-pink">
                {gameSession.chapterId === 'neon-docks' && 'Neon Docks'}
                {gameSession.chapterId === 'forest-ladles' && 'Forest of Lost Ladles'}
                {gameSession.chapterId === 'spooky-museum' && 'Spooky Museum'}
              </div>
            </div>
            <div>
              <span className="text-gray-400">Player:</span>
              <div className="text-white">{gameSession.username}</div>
            </div>
            <div>
              <span className="text-gray-400">Status:</span>
              <div className="text-neon-green">Connecting...</div>
            </div>
          </div>
        </div>

        {/* Loading Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>{loadingStage}</span>
            <span>{Math.round(loadingProgress)}%</span>
          </div>
          <div className="w-full bg-cyber-gray rounded-full h-3 border border-cyber-light">
            <div 
              className="bg-gradient-to-r from-neon-blue to-neon-green h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-neon-blue rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-neon-green rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-neon-pink rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        {/* Tips */}
        <div className="mt-8 text-gray-400 text-sm">
          <p className="mb-2">
            <strong>Tip:</strong> Make sure your friends have the room code ready to join!
          </p>
          <p>
            Room code: <span className="text-neon-blue font-mono">{gameSession.roomCode}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
