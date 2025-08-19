import React, { useMemo } from 'react';
import { useGame } from '../store/GameStore';

export const PlayersRenderer: React.FC = () => {
  const { gameSnapshot, playerId } = useGame();

  const players = useMemo(() => gameSnapshot?.players ?? [], [gameSnapshot]);

  return (
    <group>
      {players.map((p) => (
        <mesh key={p.id} position={[p.position.x, p.position.y + 0.9, p.position.z]} castShadow>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial color={p.id === playerId ? '#00f3ff' : '#ff00ff'} emissive={p.id === playerId ? '#00f3ff' : '#ff00ff'} emissiveIntensity={0.3} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
};



