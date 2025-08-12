import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { GameSession } from '../App';
import { useGame } from '../store/GameStore';
import { NeonDocksScene } from '../scenes/NeonDocksScene';
import { GameHUD } from './GameHUD';
import { InputHandler } from './InputHandler';

interface GameScreenProps {
  gameSession: GameSession;
  onPause: () => void;
  onReturnToLobby: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ 
  gameSession, 
  onPause, 
  onReturnToLobby 
}) => {
  const { 
    setPlayer, 
    setCurrentRoom, 
    setConnectionStatus, 
    setGameRunning,
    currentInput,
    updateInput,
    resetInput
  } = useGame();
  
  const [isGameReady, setIsGameReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Initialize game state
    setPlayer(gameSession.playerId, gameSession.username);
    setCurrentRoom(gameSession.roomId);
    setConnectionStatus(true);
    setGameRunning(true);
    
    // Simulate connection delay
    setTimeout(() => {
      setIsGameReady(true);
    }, 1000);

    // Cleanup on unmount
    return () => {
      setConnectionStatus(false);
      setGameRunning(false);
      setCurrentRoom(null);
      resetInput();
    };
  }, [gameSession, setPlayer, setCurrentRoom, setConnectionStatus, setGameRunning, resetInput]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          updateInput({ forward: true });
          break;
        case 'KeyS':
        case 'ArrowDown':
          updateInput({ backward: true });
          break;
        case 'KeyA':
        case 'ArrowLeft':
          updateInput({ left: true });
          break;
        case 'KeyD':
        case 'ArrowRight':
          updateInput({ right: true });
          break;
        case 'Space':
          updateInput({ jump: true });
          break;
        case 'ShiftLeft':
          updateInput({ run: true });
          break;
        case 'KeyE':
          updateInput({ interact: true });
          break;
        case 'KeyQ':
          updateInput({ dash: true });
          break;
        case 'Escape':
          onPause();
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          updateInput({ forward: false });
          break;
        case 'KeyS':
        case 'ArrowDown':
          updateInput({ backward: false });
          break;
        case 'KeyA':
        case 'ArrowLeft':
          updateInput({ left: false });
          break;
        case 'KeyD':
        case 'ArrowRight':
          updateInput({ right: false });
          break;
        case 'Space':
          updateInput({ jump: false });
          break;
        case 'ShiftLeft':
          updateInput({ run: false });
          break;
        case 'KeyE':
          updateInput({ interact: false });
          break;
        case 'KeyQ':
          updateInput({ dash: false });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [updateInput, onPause]);

  if (!isGameReady) {
    return (
      <div className="min-h-screen bg-cyber-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-blue mx-auto mb-4"></div>
          <p className="text-gray-400">Initializing game world...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-cyber-dark">
      {/* 3D Canvas */}
      <Canvas
        ref={canvasRef}
        camera={{ 
          position: [0, 5, 10], 
          fov: 75,
          near: 0.1,
          far: 1000
        }}
        gl={{ 
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance'
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#0a0a0a');
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = 2; // PCFSoftShadowMap
        }}
      >
        {/* Scene */}
        {gameSession.chapterId === 'neon-docks' && <NeonDocksScene />}
        
        {/* Camera Controls */}
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={0}
          maxDistance={50}
          minDistance={2}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        {/* Stats (development only) */}
        {import.meta.env.DEV && <Stats />}
      </Canvas>

      {/* Game HUD */}
      <GameHUD 
        gameSession={gameSession}
        currentInput={currentInput}
        onPause={onPause}
        onReturnToLobby={onReturnToLobby}
      />

      {/* Input Handler (for debugging) */}
      {import.meta.env.DEV && (
        <InputHandler 
          currentInput={currentInput}
          onInputChange={updateInput}
        />
      )}
    </div>
  );
};
