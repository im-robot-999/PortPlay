import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { GameSession } from '../App';
import { useGame } from '../store/GameStore';
import { NeonDocksScene } from '../scenes/NeonDocksScene';
import { ForestLadlesScene } from '../scenes/ForestLadlesScene';
import { SpookyMuseumScene } from '../scenes/SpookyMuseumScene';
import { GameHUD } from './GameHUD';
import { InputHandler } from './InputHandler';
import { socket } from '../network/socket';
import { InputSnapshot } from '@portplay/shared';
import { PlayersRenderer } from './PlayersRenderer';

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
    // Subscribe to server snapshots (for future interpolation/remote players)
    const onSnapshot = (snapshot: any) => {
      // Store snapshot for HUD/remote player rendering
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (useGame as any).getState().setGameSnapshot(snapshot);
    };
    socket.on('game_snapshot', onSnapshot);
    
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
      socket.off('game_snapshot', onSnapshot);
    };
  }, [gameSession, setPlayer, setCurrentRoom, setConnectionStatus, setGameRunning, resetInput]);

  // Handle keyboard input
  useEffect(() => {
    let sequence = 0;
    let rafId: number;

    const sendInput = () => {
      sequence += 1;
      const payload: InputSnapshot = {
        sequence,
        playerId: socket.id,
        input: currentInput,
        timestamp: Date.now()
      };
      socket.emit('player_input', payload);
      rafId = requestAnimationFrame(sendInput);
    };

    rafId = requestAnimationFrame(sendInput);

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
        case 'KeyF':
          updateInput({ attack: true });
          break;
        case 'KeyR':
          updateInput({ useItem: true });
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
        case 'KeyF':
          updateInput({ attack: false });
          break;
        case 'KeyR':
          updateInput({ useItem: false });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(rafId);
    };
  }, [updateInput, onPause, currentInput]);

  // Render the appropriate scene based on chapter
  const renderScene = () => {
    switch (gameSession.chapterId) {
      case 'neon-docks':
        return <NeonDocksScene />;
      case 'forest-ladles':
        return <ForestLadlesScene />;
      case 'spooky-museum':
        return <SpookyMuseumScene />;
      default:
        return <NeonDocksScene />; // Fallback to neon docks
    }
  };

  // Get chapter display name
  const getChapterName = () => {
    switch (gameSession.chapterId) {
      case 'neon-docks':
        return 'Neon Docks: A Slippery Start';
      case 'forest-ladles':
        return 'Forest of Lost Ladles';
      case 'spooky-museum':
        return 'Spooky Museum';
      default:
        return 'Unknown Chapter';
    }
  };

  if (!isGameReady) {
    return (
      <div className="min-h-screen bg-cyber-dark flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-neon-pink border-b-transparent rounded-full animate-spin mx-auto" style={{ animationDelay: '-0.5s' }}></div>
          </div>
          <p className="text-gray-300 font-cyber text-lg mb-4">Initializing game world...</p>
          <p className="text-gray-500 text-sm">{getChapterName()}</p>
          <div className="mt-4 flex space-x-2 justify-center">
            <div className="w-2 h-2 bg-neon-blue rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-neon-pink rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
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
        {renderScene()}
        <PlayersRenderer />
        
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

      {/* Input Handler */}
      <InputHandler 
        currentInput={currentInput} 
        onInputChange={updateInput}
      />
    </div>
  );
};
