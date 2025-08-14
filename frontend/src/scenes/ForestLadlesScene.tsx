import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, Sky, Float } from '@react-three/drei';
import * as THREE from 'three';

export const ForestLadlesScene: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const treesRef = useRef<THREE.Group>(null);
  const platformsRef = useRef<THREE.Group>(null);
  const [swingingLogs, setSwingingLogs] = useState<THREE.Group[]>([]);

  // Animate forest elements
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Animate swinging logs
    swingingLogs.forEach((log, index) => {
      if (log) {
        const swingAngle = Math.sin(time * 1.5 + index * 0.5) * 0.3;
        log.rotation.z = swingAngle;
      }
    });

    // Animate tree swaying
    if (treesRef.current) {
      treesRef.current.children.forEach((tree, index) => {
        const swayAngle = Math.sin(time * 0.5 + index * 0.2) * 0.1;
        tree.rotation.z = swayAngle;
      });
    }

    // Animate floating platforms
    if (platformsRef.current) {
      platformsRef.current.children.forEach((platform, index) => {
        const floatOffset = Math.sin(time * 0.8 + index * 0.3) * 0.2;
        platform.position.y = platform.position.y + floatOffset * 0.01;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {/* Sky */}
      <Sky 
        sunPosition={[50, 50, 50]}
        rayleigh={0.5}
        turbidity={0.3}
        mieCoefficient={0.003}
        mieDirectionalG={0.7}
      />

      {/* Environment lighting */}
      <Environment preset="forest" />

      {/* Ground */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.1, 0]}
        receiveShadow
      >
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial 
          color="#2d5016"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Forest floor texture */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.05, 0]}
      >
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial 
          color="#1a3d0f"
          roughness={1}
          metalness={0}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Trees */}
      <group ref={treesRef}>
        {Array.from({ length: 30 }).map((_, i) => (
          <group
            key={i}
            position={[
              (Math.random() - 0.5) * 180,
              0,
              (Math.random() - 0.5) * 180
            ]}
          >
            {/* Tree trunk */}
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.5, 0.8, 8 + Math.random() * 4]} />
              <meshStandardMaterial 
                color="#4a2f1b"
                roughness={0.8}
                metalness={0.1}
              />
            </mesh>

            {/* Tree foliage */}
            <mesh position={[0, 6 + Math.random() * 2, 0]} castShadow>
              <sphereGeometry args={[3 + Math.random() * 2]} />
              <meshStandardMaterial 
                color="#2d5016"
                roughness={0.9}
                metalness={0.1}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* Wooden pathways */}
      <group>
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              Math.sin(i * 0.8) * 20,
              0.5,
              Math.cos(i * 0.8) * 20
            ]}
            rotation={[0, i * 0.5, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[4, 0.3, 8]} />
            <meshStandardMaterial 
              color="#8b4513"
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>
        ))}
      </group>

      {/* Swinging platforms */}
      <group ref={platformsRef}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Float
            key={i}
            speed={1.5}
            rotationIntensity={0.5}
            floatIntensity={0.5}
            position={[
              Math.sin(i * 1.2) * 15,
              3 + i * 2,
              Math.cos(i * 1.2) * 15
            ]}
          >
            <mesh castShadow receiveShadow>
              <boxGeometry args={[3, 0.2, 3]} />
              <meshStandardMaterial 
                color="#a0522d"
                roughness={0.6}
                metalness={0.2}
              />
            </mesh>
          </Float>
        ))}
      </group>

      {/* Swinging logs */}
      <group>
        {Array.from({ length: 5 }).map((_, i) => {
          const logRef = useRef<THREE.Group>(null);
          if (logRef.current && !swingingLogs.includes(logRef.current)) {
            setSwingingLogs(prev => [...prev, logRef.current!]);
          }

          return (
            <group
              key={i}
              ref={logRef}
              position={[
                Math.sin(i * 1.5) * 12,
                4 + i * 1.5,
                Math.cos(i * 1.5) * 12
              ]}
            >
              {/* Rope */}
              <mesh position={[0, 2, 0]} castShadow>
                <cylinderGeometry args={[0.1, 0.1, 4]} />
                <meshStandardMaterial 
                  color="#654321"
                  roughness={0.9}
                  metalness={0.1}
                />
              </mesh>

              {/* Log */}
              <mesh position={[0, 0, 0]} castShadow>
                <cylinderGeometry args={[0.8, 0.8, 4]} />
                <meshStandardMaterial 
                  color="#8b4513"
                  roughness={0.8}
                  metalness={0.1}
                />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Collectible ladles */}
      <group>
        {Array.from({ length: 10 }).map((_, i) => (
          <Float
            key={i}
            speed={2}
            rotationIntensity={1}
            floatIntensity={0.5}
            position={[
              (Math.random() - 0.5) * 40,
              1 + Math.random() * 3,
              (Math.random() - 0.5) * 40
            ]}
          >
            <group>
              {/* Ladle handle */}
              <mesh castShadow>
                <cylinderGeometry args={[0.05, 0.05, 1.5]} />
                <meshStandardMaterial 
                  color="#cd7f32"
                  roughness={0.3}
                  metalness={0.8}
                />
              </mesh>

              {/* Ladle bowl */}
              <mesh position={[0, -0.5, 0]} castShadow>
                <sphereGeometry args={[0.3, 8, 6, 0, Math.PI]} />
                <meshStandardMaterial 
                  color="#cd7f32"
                  roughness={0.3}
                  metalness={0.8}
                />
              </mesh>
            </group>
          </Float>
        ))}
      </group>

      {/* NPC Chef */}
      <group position={[0, 1, -20]}>
        {/* Chef body */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.8, 0.8, 2]} />
          <meshStandardMaterial 
            color="#ff6b6b"
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>

        {/* Chef hat */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <cylinderGeometry args={[1, 0.5, 0.8]} />
          <meshStandardMaterial 
            color="#ffffff"
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>

        {/* Chef face */}
        <mesh position={[0, 0.8, 0.7]} castShadow>
          <sphereGeometry args={[0.3]} />
          <meshStandardMaterial 
            color="#ffdbac"
            roughness={0.6}
            metalness={0.1}
          />
        </mesh>
      </group>

      {/* Map fragments */}
      <group>
        {Array.from({ length: 5 }).map((_, i) => (
          <Float
            key={i}
            speed={1}
            rotationIntensity={0.5}
            floatIntensity={0.3}
            position={[
              Math.sin(i * 1.2) * 8,
              0.5,
              Math.cos(i * 1.2) * 8
            ]}
          >
            <mesh castShadow>
              <planeGeometry args={[1, 1]} />
              <meshStandardMaterial 
                color="#f4a460"
                roughness={0.5}
                metalness={0.1}
                transparent
                opacity={0.8}
              />
            </mesh>
          </Float>
        ))}
      </group>

      {/* Atmospheric elements */}
      <group>
        {/* Fireflies */}
        {Array.from({ length: 30 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              (Math.random() - 0.5) * 100,
              Math.random() * 10,
              (Math.random() - 0.5) * 100
            ]}
          >
            <sphereGeometry args={[0.05]} />
            <meshStandardMaterial 
              color="#ffff00"
              emissive="#ffff00"
              emissiveIntensity={0.8}
              transparent
              opacity={0.6}
            />
          </mesh>
        ))}

        {/* Floating leaves */}
        {Array.from({ length: 50 }).map((_, i) => (
          <Float
            key={i}
            speed={0.5}
            rotationIntensity={1}
            floatIntensity={0.5}
            position={[
              (Math.random() - 0.5) * 150,
              Math.random() * 15,
              (Math.random() - 0.5) * 150
            ]}
          >
            <mesh>
              <planeGeometry args={[0.3, 0.3]} />
              <meshStandardMaterial 
                color="#228b22"
                roughness={0.8}
                metalness={0.1}
                transparent
                opacity={0.7}
              />
            </mesh>
          </Float>
        ))}
      </group>

      {/* Fog */}
      <fog attach="fog" args={['#87ceeb', 30, 150]} />
    </group>
  );
};
