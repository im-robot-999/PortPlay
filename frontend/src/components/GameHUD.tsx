import React, { useState } from 'react';
import { GameSession } from '../App';
import { InputState } from '@portplay/shared';

interface GameHUDProps {
  gameSession: GameSession;
  currentInput: InputState;
  onPause: () => void;
  onReturnToLobby: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  gameSession,
  currentInput,
  onPause
}) => {
  const [showControls, setShowControls] = useState(false);
  const [showInventory, setShowInventory] = useState(false);

  return (
    <>
      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="flex justify-between items-center">
          {/* Room Info */}
          <div className="cyber-panel">
            <div className="flex items-center space-x-4">
              <div>
                <span className="text-gray-400 text-sm">Room:</span>
                <div className="text-neon-blue font-mono font-bold">
                  {gameSession.roomCode}
                </div>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Chapter:</span>
                <div className="text-neon-pink">
                  {gameSession.chapterId === 'neon-docks' && 'Neon Docks'}
                  {gameSession.chapterId === 'forest-ladles' && 'Forest of Lost Ladles'}
                  {gameSession.chapterId === 'spooky-museum' && 'Spooky Museum'}
                </div>
              </div>
            </div>
          </div>

          {/* Player Info */}
          <div className="cyber-panel">
            <div className="flex items-center space-x-4">
              <div>
                <span className="text-gray-400 text-sm">Player:</span>
                <div className="text-white font-bold">{gameSession.username}</div>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Health:</span>
                <div className="text-green-400 font-bold">100/100</div>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Level:</span>
                <div className="text-yellow-400 font-bold">1</div>
              </div>
            </div>
          </div>

          {/* Game Controls */}
          <div className="flex space-x-2">
            <button
              onClick={() => setShowInventory(!showInventory)}
              className="btn-secondary px-3 py-2"
            >
              📦
            </button>
            <button
              onClick={() => setShowControls(!showControls)}
              className="btn-secondary px-3 py-2"
            >
              ⌨️
            </button>
            <button
              onClick={onPause}
              className="btn-primary px-3 py-2"
            >
              ⏸️
            </button>
          </div>
        </div>
      </div>

      {/* Bottom HUD */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="flex justify-between items-center">
          {/* Input Status */}
          <div className="cyber-panel">
            <div className="flex space-x-2">
              {currentInput.forward && (
                <div className="w-3 h-3 bg-neon-blue rounded-full animate-pulse"></div>
              )}
              {currentInput.backward && (
                <div className="w-3 h-3 bg-neon-pink rounded-full animate-pulse"></div>
              )}
              {currentInput.left && (
                <div className="w-3 h-3 bg-neon-green rounded-full animate-pulse"></div>
              )}
              {currentInput.right && (
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              )}
              {currentInput.jump && (
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
              )}
              {currentInput.run && (
                <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
              )}
            </div>
          </div>

          {/* Quest Progress */}
          <div className="cyber-panel">
            <div className="text-center">
              <div className="text-sm text-gray-400">Quest Progress</div>
              <div className="text-neon-green">1/3 Objectives</div>
            </div>
          </div>

          {/* Time */}
          <div className="cyber-panel">
            <div className="text-center">
              <div className="text-sm text-gray-400">Time</div>
              <div className="text-white font-mono">00:00</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Overlay */}
      {showControls && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="cyber-panel max-w-2xl mx-auto p-8">
            <h2 className="text-2xl font-cyber text-neon-blue mb-6 text-center">
              Game Controls
            </h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-cyber text-neon-green mb-3">Movement</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Move Forward:</span>
                    <span className="text-neon-blue">W / ↑</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Move Backward:</span>
                    <span className="text-neon-blue">S / ↓</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Move Left:</span>
                    <span className="text-neon-blue">A / ←</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Move Right:</span>
                    <span className="text-neon-blue">D / →</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-cyber text-neon-pink mb-3">Actions</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Jump:</span>
                    <span className="text-neon-blue">Space</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Run:</span>
                    <span className="text-neon-blue">Shift</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dash:</span>
                    <span className="text-neon-blue">Q</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Interact:</span>
                    <span className="text-neon-blue">E</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowControls(false)}
                className="btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Overlay */}
      {showInventory && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="cyber-panel max-w-2xl mx-auto p-8">
            <h2 className="text-2xl font-cyber text-neon-green mb-6 text-center">
              Inventory
            </h2>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              {/* Health Pack */}
              <div className="cyber-panel text-center p-4">
                <div className="text-2xl mb-2">❤️</div>
                <div className="text-sm font-bold text-red-400">Health Pack</div>
                <div className="text-xs text-gray-400">Restore 25 HP</div>
                <div className="text-xs text-neon-blue mt-1">Quantity: 2</div>
              </div>
              
              {/* Jump Boots */}
              <div className="cyber-panel text-center p-4">
                <div className="text-2xl mb-2">👢</div>
                <div className="text-sm font-bold text-green-400">Jump Boots</div>
                <div className="text-xs text-gray-400">Double jump ability</div>
                <div className="text-xs text-neon-blue mt-1">Quantity: 1</div>
              </div>
              
              {/* Clue Scanner */}
              <div className="cyber-panel text-center p-4">
                <div className="text-2xl mb-2">🔍</div>
                <div className="text-sm font-bold text-blue-400">Clue Scanner</div>
                <div className="text-xs text-gray-400">Reveal hidden clues</div>
                <div className="text-xs text-neon-blue mt-1">Quantity: 1</div>
              </div>
            </div>
            
            <div className="text-center">
              <button
                onClick={() => setShowInventory(false)}
                className="btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room Code Display */}
      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-10">
        <div className="cyber-panel text-center p-4">
          <div className="text-sm text-gray-400 mb-2">Room Code</div>
          <div className="text-2xl font-cyber text-neon-blue font-mono tracking-widest">
            {gameSession.roomCode}
          </div>
          <div className="text-xs text-gray-400 mt-1">Share with friends</div>
        </div>
      </div>
    </>
  );
};
