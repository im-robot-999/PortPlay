import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, Sky, Text, Float } from '@react-three/drei';
import * as THREE from 'three';

export const SpookyMuseumScene: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const exhibitsRef = useRef<THREE.Group>(null);
  const ghostRef = useRef<THREE.Group>(null);
  const [puzzleStates] = useState<boolean[]>([false, false, false, false]);

  // Animate museum elements
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Animate ghost movement
    if (ghostRef.current) {
      const ghostX = Math.sin(time * 0.3) * 10;
      const ghostY = 2 + Math.sin(time * 0.5) * 0.5;
      const ghostZ = Math.cos(time * 0.3) * 10;
      
      ghostRef.current.position.set(ghostX, ghostY, ghostZ);
      ghostRef.current.rotation.y = time * 0.2;
    }

    // Animate exhibits
    if (exhibitsRef.current) {
      exhibitsRef.current.children.forEach((exhibit, index) => {
        if (puzzleStates[index]) {
          // Puzzle solved - add glow effect
          if (exhibit instanceof THREE.Mesh && exhibit.material instanceof THREE.MeshStandardMaterial) {
            exhibit.material.emissiveIntensity = 0.5 + 0.3 * Math.sin(time * 2);
          }
        }
      });
    }

    // Animate floating objects
    const floatingObjects = groupRef.current?.children.filter(child => 
      child.userData.isFloating
    );
    
    floatingObjects?.forEach((obj, index) => {
      const floatOffset = Math.sin(time * 0.8 + index * 0.5) * 0.2;
      obj.position.y = obj.position.y + floatOffset * 0.01;
    });
  });

  return (
    <group ref={groupRef}>
      {/* Sky */}
      <Sky 
        sunPosition={[0, 0, 0]}
        rayleigh={0.1}
        turbidity={0.9}
        mieCoefficient={0.01}
        mieDirectionalG={0.9}
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

      {/* Museum floor */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.05, 0]}
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#2a2a2a"
          roughness={0.6}
          metalness={0.3}
        />
      </mesh>

      {/* Museum walls */}
      <group>
        {/* Back wall */}
        <mesh position={[0, 5, -25]} castShadow receiveShadow>
          <boxGeometry args={[50, 10, 0.5]} />
          <meshStandardMaterial 
            color="#3a3a3a"
            roughness={0.7}
            metalness={0.2}
          />
        </mesh>

        {/* Side walls */}
        <mesh position={[-25, 5, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.5, 10, 50]} />
          <meshStandardMaterial 
            color="#3a3a3a"
            roughness={0.7}
            metalness={0.2}
          />
        </mesh>

        <mesh position={[25, 5, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.5, 10, 50]} />
          <meshStandardMaterial 
            color="#3a3a3a"
            roughness={0.7}
            metalness={0.2}
          />
        </mesh>

        {/* Ceiling */}
        <mesh position={[0, 10, 0]} castShadow receiveShadow>
          <boxGeometry args={[50, 0.5, 50]} />
          <meshStandardMaterial 
            color="#2a2a2a"
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      </group>

      {/* Museum exhibits */}
      <group ref={exhibitsRef}>
        {/* Exhibit 1: Ancient Artifact */}
        <group position={[-15, 1, -15]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[1, 1, 2]} />
            <meshStandardMaterial 
              color={puzzleStates[0] ? "#ffd700" : "#8b4513"}
              emissive={puzzleStates[0] ? "#ffd700" : "#000000"}
              emissiveIntensity={puzzleStates[0] ? 0.3 : 0}
              roughness={0.3}
              metalness={0.8}
            />
          </mesh>
          <Text
            position={[0, 2.5, 0]}
            fontSize={0.5}
            color={puzzleStates[0] ? "#ffd700" : "#ffffff"}
            anchorX="center"
            anchorY="middle"
          >
            Ancient Artifact
          </Text>
        </group>

        {/* Exhibit 2: Mysterious Painting */}
        <group position={[15, 1, -15]}>
          <mesh castShadow receiveShadow>
            <planeGeometry args={[3, 2]} />
            <meshStandardMaterial 
              color={puzzleStates[1] ? "#ff69b4" : "#4a4a4a"}
              emissive={puzzleStates[1] ? "#ff69b4" : "#000000"}
              emissiveIntensity={puzzleStates[1] ? 0.3 : 0}
              roughness={0.5}
              metalness={0.1}
            />
          </mesh>
          <Text
            position={[0, 2.5, 0]}
            fontSize={0.5}
            color={puzzleStates[1] ? "#ff69b4" : "#ffffff"}
            anchorX="center"
            anchorY="middle"
          >
            Mysterious Painting
          </Text>
        </group>

        {/* Exhibit 3: Crystal Display */}
        <group position={[-15, 1, 15]}>
          <mesh castShadow receiveShadow>
            <octahedronGeometry args={[1]} />
            <meshStandardMaterial 
              color={puzzleStates[2] ? "#00ffff" : "#666666"}
              emissive={puzzleStates[2] ? "#00ffff" : "#000000"}
              emissiveIntensity={puzzleStates[2] ? 0.3 : 0}
              roughness={0.1}
              metalness={0.9}
              transparent
              opacity={0.8}
            />
          </mesh>
          <Text
            position={[0, 2.5, 0]}
            fontSize={0.5}
            color={puzzleStates[2] ? "#00ffff" : "#ffffff"}
            anchorX="center"
            anchorY="middle"
          >
            Crystal Display
          </Text>
        </group>

        {/* Exhibit 4: Ancient Scroll */}
        <group position={[15, 1, 15]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.5, 0.5, 0.1]} />
            <meshStandardMaterial 
              color={puzzleStates[3] ? "#32cd32" : "#8b7355"}
              emissive={puzzleStates[3] ? "#32cd32" : "#000000"}
              emissiveIntensity={puzzleStates[3] ? 0.3 : 0}
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>
          <Text
            position={[0, 2.5, 0]}
            fontSize={0.5}
            color={puzzleStates[3] ? "#32cd32" : "#ffffff"}
            anchorX="center"
            anchorY="middle"
          >
            Ancient Scroll
          </Text>
        </group>
      </group>

      {/* Curator Ghost */}
      <group ref={ghostRef} position={[0, 2, 0]}>
        {/* Ghost body */}
        <mesh castShadow>
          <cylinderGeometry args={[0.8, 1.2, 3]} />
          <meshStandardMaterial 
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.2}
            transparent
            opacity={0.7}
            roughness={0.1}
            metalness={0.1}
          />
        </mesh>

        {/* Ghost head */}
        <mesh position={[0, 2, 0]} castShadow>
          <sphereGeometry args={[0.6]} />
          <meshStandardMaterial 
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.2}
            transparent
            opacity={0.7}
            roughness={0.1}
            metalness={0.1}
          />
        </mesh>

        {/* Ghost eyes */}
        <mesh position={[-0.2, 2.1, 0.4]} castShadow>
          <sphereGeometry args={[0.1]} />
          <meshStandardMaterial 
            color="#ff0000"
            emissive="#ff0000"
            emissiveIntensity={0.5}
          />
        </mesh>

        <mesh position={[0.2, 2.1, 0.4]} castShadow>
          <sphereGeometry args={[0.1]} />
          <meshStandardMaterial 
            color="#ff0000"
            emissive="#ff0000"
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Ghost name */}
        <Text
          position={[0, 3.5, 0]}
          fontSize={0.8}
          color="#ff0000"
          anchorX="center"
          anchorY="middle"
        >
          Curator Ghost
        </Text>
      </group>

      {/* Puzzle elements */}
      <group>
        {/* Floating orbs */}
        {Array.from({ length: 8 }).map((_, i) => (
          <Float
            key={i}
            speed={1}
            rotationIntensity={1}
            floatIntensity={0.5}
            position={[
              Math.sin(i * 0.8) * 20,
              3 + Math.random() * 2,
              Math.cos(i * 0.8) * 20
            ]}
          >
            <mesh castShadow userData={{ isFloating: true }}>
              <sphereGeometry args={[0.3]} />
              <meshStandardMaterial 
                color="#ff69b4"
                emissive="#ff69b4"
                emissiveIntensity={0.3}
                transparent
                opacity={0.8}
              />
            </mesh>
          </Float>
        ))}

        {/* Memory fragments */}
        {Array.from({ length: 6 }).map((_, i) => (
          <Float
            key={i}
            speed={0.8}
            rotationIntensity={0.5}
            floatIntensity={0.3}
            position={[
              (Math.random() - 0.5) * 30,
              1 + Math.random() * 2,
              (Math.random() - 0.5) * 30
            ]}
          >
            <mesh castShadow>
              <planeGeometry args={[1, 1]} />
              <meshStandardMaterial 
                color="#87ceeb"
                emissive="#87ceeb"
                emissiveIntensity={0.2}
                transparent
                opacity={0.6}
              />
            </mesh>
          </Float>
        ))}
      </group>

      {/* Atmospheric elements */}
      <group>
        {/* Floating dust particles */}
        {Array.from({ length: 100 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              (Math.random() - 0.5) * 80,
              Math.random() * 15,
              (Math.random() - 0.5) * 80
            ]}
          >
            <sphereGeometry args={[0.02]} />
            <meshStandardMaterial 
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.1}
              transparent
              opacity={0.3}
            />
          </mesh>
        ))}

        {/* Eerie lights */}
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              Math.sin(i * 1.2) * 20,
              8,
              Math.cos(i * 1.2) * 20
            ]}
          >
            <sphereGeometry args={[0.5]} />
            <meshStandardMaterial 
              color="#ff69b4"
              emissive="#ff69b4"
              emissiveIntensity={0.5}
              transparent
              opacity={0.6}
            />
          </mesh>
        ))}
      </group>

      {/* Museum decorations */}
      <group>
        {/* Display cases */}
        {Array.from({ length: 4 }).map((_, i) => (
          <group
            key={i}
            position={[
              Math.sin(i * 1.5) * 12,
              0.5,
              Math.cos(i * 1.5) * 12
            ]}
          >
            <mesh castShadow receiveShadow>
              <boxGeometry args={[2, 1, 2]} />
              <meshStandardMaterial 
                color="#4a4a4a"
                roughness={0.6}
                metalness={0.8}
              />
            </mesh>
            <mesh position={[0, 0.6, 0]} castShadow>
              <boxGeometry args={[1.8, 0.1, 1.8]} />
              <meshStandardMaterial 
                color="#87ceeb"
                transparent
                opacity={0.3}
                roughness={0.1}
                metalness={0.9}
              />
            </mesh>
          </group>
        ))}

        {/* Museum pillars */}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              Math.sin(i * 0.8) * 18,
              5,
              Math.cos(i * 0.8) * 18
            ]}
            castShadow
            receiveShadow
          >
            <cylinderGeometry args={[0.8, 0.8, 10]} />
            <meshStandardMaterial 
              color="#5a5a5a"
              roughness={0.7}
              metalness={0.3}
            />
          </mesh>
        ))}
      </group>

      {/* Fog */}
      <fog attach="fog" args={['#1a1a1a', 15, 80]} />
    </group>
  );
};
