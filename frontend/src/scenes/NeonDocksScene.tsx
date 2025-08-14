import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, Sky, Text, Float } from '@react-three/drei';
import * as THREE from 'three';

export const NeonDocksScene: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const neonSignsRef = useRef<THREE.Group>(null);
  const waterRef = useRef<THREE.Mesh>(null);
  const [collectedItems] = useState<Set<number>>(new Set());
  const [crateFound] = useState(false);
  const [manifestFound] = useState(false);

  // Animate neon signs and water
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Animate neon signs
    if (neonSignsRef.current) {
      neonSignsRef.current.children.forEach((child, index) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          // Pulse neon intensity
          const intensity = 0.5 + 0.5 * Math.sin(time * 2 + index * 0.5);
          child.material.emissiveIntensity = intensity;
        }
      });
    }
    
    // Animate water
    if (waterRef.current) {
      waterRef.current.position.y = Math.sin(time * 0.5) * 0.1;
    }

    // Animate floating collectibles
    const collectibles = groupRef.current?.children.filter(child => 
      child.userData.isCollectible
    );
    
    collectibles?.forEach((collectible, index) => {
      const floatOffset = Math.sin(time * 1.2 + index * 0.3) * 0.3;
      collectible.position.y = collectible.position.y + floatOffset * 0.01;
      collectible.rotation.y = time * 0.5 + index * 0.2;
    });
  });

  return (
    <group ref={groupRef}>
      {/* Sky */}
      <Sky 
        sunPosition={[100, 20, 100]}
        rayleigh={0.3}
        turbidity={0.8}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />

      {/* Environment lighting */}
      <Environment preset="night" />

      {/* Ground */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.1, 0]}
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#1a1a1a"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Dock platforms */}
      <group position={[0, 0, 0]}>
        {/* Main platform */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[20, 0.5, 30]} />
          <meshStandardMaterial 
            color="#2a2a2a"
            roughness={0.7}
            metalness={0.3}
          />
        </mesh>

        {/* Side platforms */}
        <mesh position={[-15, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[10, 0.5, 20]} />
          <meshStandardMaterial 
            color="#2a2a2a"
            roughness={0.7}
            metalness={0.3}
          />
        </mesh>

        <mesh position={[15, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[10, 0.5, 20]} />
          <meshStandardMaterial 
            color="#2a2a2a"
            roughness={0.7}
            metalness={0.3}
          />
        </mesh>
      </group>

      {/* Neon signs and lights */}
      <group ref={neonSignsRef}>
        {/* Main neon sign */}
        <mesh position={[0, 8, -15]} castShadow>
          <boxGeometry args={[8, 1, 0.2]} />
          <meshStandardMaterial 
            color="#00f3ff"
            emissive="#00f3ff"
            emissiveIntensity={1}
            toneMapped={false}
          />
        </mesh>

        {/* Side neon lights */}
        <mesh position={[-12, 6, -10]} castShadow>
          <boxGeometry args={[0.2, 1, 4]} />
          <meshStandardMaterial 
            color="#ff00ff"
            emissive="#ff00ff"
            emissiveIntensity={0.8}
            toneMapped={false}
          />
        </mesh>

        <mesh position={[12, 6, -10]} castShadow>
          <boxGeometry args={[0.2, 1, 4]} />
          <meshStandardMaterial 
            color="#00ff00"
            emissive="#00ff00"
            emissiveIntensity={0.8}
            toneMapped={false}
          />
        </mesh>

        {/* Additional neon decorations */}
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh 
            key={i}
            position={[
              Math.sin(i * 1) * 18,
              4 + Math.random() * 3,
              Math.cos(i * 1) * 18
            ]} 
            castShadow
          >
            <boxGeometry args={[0.1, 0.1, 2]} />
            <meshStandardMaterial 
              color={i % 3 === 0 ? "#00f3ff" : i % 3 === 1 ? "#ff00ff" : "#00ff00"}
              emissive={i % 3 === 0 ? "#00f3ff" : i % 3 === 1 ? "#ff00ff" : "#00ff00"}
              emissiveIntensity={0.6}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>

      {/* Cargo containers */}
      <group>
        {/* Large container - Main objective */}
        <group position={[-8, 1.5, -5]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[4, 3, 6]} />
            <meshStandardMaterial 
              color={crateFound ? "#ffd700" : "#444444"}
              emissive={crateFound ? "#ffd700" : "#000000"}
              emissiveIntensity={crateFound ? 0.3 : 0}
              roughness={0.8}
              metalness={0.2}
            />
          </mesh>
          <Text
            position={[0, 2.5, 0]}
            fontSize={0.8}
            color={crateFound ? "#ffd700" : "#ffffff"}
            anchorX="center"
            anchorY="middle"
          >
            {crateFound ? "Crate Found!" : "Mysterious Crate"}
          </Text>
        </group>

        {/* Medium container */}
        <mesh position={[8, 1, -8]} castShadow receiveShadow>
          <boxGeometry args={[3, 2, 4]} />
          <meshStandardMaterial 
            color="#666666"
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>

        {/* Small container - Manifest */}
        <group position={[0, 0.5, -20]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2, 1, 3]} />
            <meshStandardMaterial 
              color={manifestFound ? "#32cd32" : "#888888"}
              emissive={manifestFound ? "#32cd32" : "#000000"}
              emissiveIntensity={manifestFound ? 0.3 : 0}
              roughness={0.8}
              metalness={0.2}
            />
          </mesh>
          <Text
            position={[0, 1.5, 0]}
            fontSize={0.6}
            color={manifestFound ? "#32cd32" : "#ffffff"}
            anchorX="center"
            anchorY="middle"
          >
            {manifestFound ? "Manifest Found!" : "Manifest"}
          </Text>
        </group>
      </group>

      {/* Crane structure */}
      <group position={[0, 5, 10]}>
        {/* Vertical support */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1, 10, 1]} />
          <meshStandardMaterial 
            color="#333333"
            roughness={0.6}
            metalness={0.8}
          />
        </mesh>

        {/* Horizontal arm */}
        <mesh position={[0, 5, -5]} castShadow receiveShadow>
          <boxGeometry args={[1, 1, 20]} />
          <meshStandardMaterial 
            color="#333333"
            roughness={0.6}
            metalness={0.8}
          />
        </mesh>

        {/* Hook */}
        <mesh position={[0, 2, -5]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 2]} />
          <meshStandardMaterial 
            color="#666666"
            roughness={0.6}
            metalness={0.8}
          />
        </mesh>
      </group>

      {/* Collectible items */}
      <group>
        {Array.from({ length: 8 }).map((_, i) => (
          <Float
            key={i}
            speed={1.5}
            rotationIntensity={1}
            floatIntensity={0.5}
            position={[
              (Math.random() - 0.5) * 30,
              1 + Math.random() * 2,
              (Math.random() - 0.5) * 30
            ]}
          >
            <group userData={{ isCollectible: true, id: i }}>
              {/* Collectible object */}
              <mesh castShadow>
                <sphereGeometry args={[0.3]} />
                <meshStandardMaterial 
                  color={collectedItems.has(i) ? "#ffd700" : "#00f3ff"}
                  emissive={collectedItems.has(i) ? "#ffd700" : "#00f3ff"}
                  emissiveIntensity={collectedItems.has(i) ? 0.5 : 0.3}
                  transparent
                  opacity={collectedItems.has(i) ? 0.5 : 0.8}
                />
              </mesh>
              
              {/* Collectible label */}
              <Text
                position={[0, 0.8, 0]}
                fontSize={0.3}
                color={collectedItems.has(i) ? "#ffd700" : "#00f3ff"}
                anchorX="center"
                anchorY="middle"
              >
                {collectedItems.has(i) ? "Collected!" : `Item ${i + 1}`}
              </Text>
            </group>
          </Float>
        ))}
      </group>

      {/* Conveyor belts */}
      <group>
        {Array.from({ length: 3 }).map((_, i) => (
          <group
            key={i}
            position={[
              Math.sin(i * 1.2) * 12,
              0.3,
              Math.cos(i * 1.2) * 12
            ]}
          >
            {/* Belt surface */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[6, 0.1, 1]} />
              <meshStandardMaterial 
                color="#555555"
                roughness={0.9}
                metalness={0.1}
              />
            </mesh>

            {/* Belt rollers */}
            {Array.from({ length: 4 }).map((_, j) => (
              <mesh
                key={j}
                position={[j * 1.5 - 2.25, 0.2, 0]}
                castShadow
              >
                <cylinderGeometry args={[0.2, 0.2, 1.2]} />
                <meshStandardMaterial 
                  color="#333333"
                  roughness={0.6}
                  metalness={0.8}
                />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* Water */}
      <mesh 
        ref={waterRef}
        position={[0, -0.5, 0]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial 
          color="#0066cc"
          transparent
          opacity={0.6}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Floating debris */}
      <group>
        {Array.from({ length: 15 }).map((_, i) => (
          <Float
            key={i}
            speed={0.5}
            rotationIntensity={0.5}
            floatIntensity={0.3}
            position={[
              (Math.random() - 0.5) * 80,
              -0.3,
              (Math.random() - 0.5) * 80
            ]}
          >
            <mesh castShadow>
              <boxGeometry args={[
                Math.random() * 0.5 + 0.2,
                Math.random() * 0.5 + 0.2,
                Math.random() * 0.5 + 0.2
              ]} />
              <meshStandardMaterial 
                color="#444444"
                roughness={0.9}
                metalness={0.1}
              />
            </mesh>
          </Float>
        ))}
      </group>

      {/* Atmospheric particles */}
      <group>
        {Array.from({ length: 80 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              (Math.random() - 0.5) * 100,
              Math.random() * 20,
              (Math.random() - 0.5) * 100
            ]}
          >
            <sphereGeometry args={[0.02]} />
            <meshStandardMaterial 
              color="#00f3ff"
              emissive="#00f3ff"
              emissiveIntensity={0.5}
              transparent
              opacity={0.3}
            />
          </mesh>
        ))}
      </group>

      {/* Objective markers */}
      <group>
        {/* Crate objective */}
        <Text
          position={[-8, 5, -5]}
          fontSize={1}
          color="#ffd700"
          anchorX="center"
          anchorY="middle"
        >
          Find the Misplaced Crate
        </Text>

        {/* Manifest objective */}
        <Text
          position={[0, 3, -20]}
          fontSize={0.8}
          color="#32cd32"
          anchorX="center"
          anchorY="middle"
        >
          Locate the Manifest
        </Text>

        {/* Container objective */}
        <Text
          position={[0, 4, 0]}
          fontSize={0.8}
          color="#ff69b4"
          anchorX="center"
          anchorY="middle"
        >
          Identify Suspicious Container
        </Text>
      </group>

      {/* Fog */}
      <fog attach="fog" args={['#0a0a0a', 20, 100]} />
    </group>
  );
};
