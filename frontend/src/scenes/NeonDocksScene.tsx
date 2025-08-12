import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Sky } from '@react-three/drei';
import * as THREE from 'three';

export const NeonDocksScene: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const neonSignsRef = useRef<THREE.Group>(null);
  const waterRef = useRef<THREE.Mesh>(null);

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
      </group>

      {/* Cargo containers */}
      <group>
        {/* Large container */}
        <mesh position={[-8, 1.5, -5]} castShadow receiveShadow>
          <boxGeometry args={[4, 3, 6]} />
          <meshStandardMaterial 
            color="#444444"
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>

        {/* Medium container */}
        <mesh position={[8, 1, -8]} castShadow receiveShadow>
          <boxGeometry args={[3, 2, 4]} />
          <meshStandardMaterial 
            color="#666666"
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>

        {/* Small container */}
        <mesh position={[0, 0.5, -20]} castShadow receiveShadow>
          <boxGeometry args={[2, 1, 3]} />
          <meshStandardMaterial 
            color="#888888"
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>
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
        {Array.from({ length: 10 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              (Math.random() - 0.5) * 80,
              -0.3,
              (Math.random() - 0.5) * 80
            ]}
            rotation={[
              Math.random() * Math.PI,
              Math.random() * Math.PI,
              Math.random() * Math.PI
            ]}
            castShadow
          >
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
        ))}
      </group>

      {/* Atmospheric particles */}
      <group>
        {Array.from({ length: 50 }).map((_, i) => (
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

      {/* Fog */}
      <fog attach="fog" args={['#0a0a0a', 20, 100]} />
    </group>
  );
};
