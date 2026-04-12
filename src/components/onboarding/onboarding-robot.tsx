"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function RobotModel() {
  const rightArmRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Group>(null);
  const heartRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Roka māj (waving animation)
    if (rightArmRef.current) {
      rightArmRef.current.rotation.z = -0.3 + Math.sin(time * 6) * 0.4;
    }
    
    // Galva nedaudz kustas un seko pelei
    if (headRef.current) {
      const baseX = Math.sin(time * 2) * 0.05;
      const baseY = Math.sin(time * 1.5) * 0.1;
      const targetX = -state.pointer.y * 0.5;
      const targetY = state.pointer.x * 0.5;
      
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, targetX + baseX, 0.1);
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetY + baseY, 0.1);
    }
    
    // Sirds pulsē
    if (heartRef.current) {
      const scale = 1 + Math.sin(time * 8) * 0.15;
      heartRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group position={[0, -0.3, 0]}>
      <pointLight position={[0, 2, 2]} intensity={2} color="#ffffff" />
      
      {/* Galva un tās detaļas */}
      <group ref={headRef}>
        {/* Galvas pamats - plata, mīlīga kapsula */}
        <mesh position={[0, 1.3, 0]} castShadow>
          <capsuleGeometry args={[0.4, 0.3, 32, 32]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
        </mesh>
        
        {/* Seja (melns ekrāns) */}
        <mesh position={[0, 1.3, 0.35]} castShadow>
          <boxGeometry args={[0.6, 0.4, 0.15]} />
          <meshStandardMaterial color="#111111" roughness={0.4} />
        </mesh>

        {/* Lielas, mīlīgas acis (mirdzošas) */}
        <mesh position={[-0.15, 1.35, 0.43]}>
          <capsuleGeometry args={[0.06, 0.05, 16, 16]} />
          <meshBasicMaterial color="#00ffff" />
        </mesh>
        <mesh position={[0.15, 1.35, 0.43]}>
          <capsuleGeometry args={[0.06, 0.05, 16, 16]} />
          <meshBasicMaterial color="#00ffff" />
        </mesh>

        {/* Maza actiņu gaisma */}
        <pointLight position={[0, 1.35, 0.6]} intensity={1} color="#00ffff" distance={1} />
        
        {/* Gudrā "Halo" antena */}
        <mesh position={[0, 2.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.15, 0.02, 16, 100]} />
          <meshBasicMaterial color="#00ffff" />
        </mesh>
      </group>

      {/* Ķermenis - noapaļots */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <capsuleGeometry args={[0.45, 0.6, 32, 32]} />
        <meshStandardMaterial color="#f0f4f8" roughness={0.3} metalness={0.1} />
      </mesh>
      
      {/* Rokas */}
      <mesh ref={rightArmRef} position={[-0.6, 0.6, 0]} rotation={[0, 0, 0.3]} castShadow>
        <capsuleGeometry args={[0.1, 0.5, 16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </mesh>
      <mesh position={[0.6, 0.4, 0]} rotation={[0, 0, -0.2]} castShadow>
        <capsuleGeometry args={[0.1, 0.5, 16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </mesh>
      
      {/* Peldošas kājiņas */}
      <mesh position={[-0.2, -0.4, 0]} castShadow>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial color="#aaaaaa" roughness={0.5} />
      </mesh>
      <mesh position={[0.2, -0.4, 0]} castShadow>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial color="#aaaaaa" roughness={0.5} />
      </mesh>
      
      {/* Mirdzoša Sirds / Kodols */}
      <mesh ref={heartRef} position={[0, 0.5, 0.43]}>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshBasicMaterial color="#ff3366" />
        <pointLight intensity={2} color="#ff3366" distance={2} />
      </mesh>
    </group>
  );
}

export function OnboardingRobotCanvas({ onLoad }: { onLoad?: () => void }) {
  return (
    <Canvas 
      camera={{ position: [0, 0.8, 5], fov: 50 }}
      resize={{ offsetSize: true }}
      gl={{ preserveDrawingBuffer: true, powerPreference: "default" }}
      onCreated={() => {
        if (onLoad) onLoad();
      }}
    >
      <ambientLight intensity={1.5} />
      <directionalLight position={[5, 10, 5]} intensity={2.5} />
      
      <Float speed={3} rotationIntensity={0.5} floatIntensity={1}>
        <RobotModel />
      </Float>
    </Canvas>
  );
}
