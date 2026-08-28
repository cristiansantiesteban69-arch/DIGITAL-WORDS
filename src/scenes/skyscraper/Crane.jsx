import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { FOOTPRINT } from './buildingConfig';

/**
 * Crane
 * Carried over from Phase 1, unchanged in spirit: a lightweight
 * procedural tower crane, no physics simulation. `active` (0-1) scales
 * how lively its idle sway is — near-still while there's little to do,
 * a bit more animated while the building is actively rising — so it
 * reads as "participating" without any new complexity.
 */
export default function Crane({ active = 1 }) {
  const craneJib = useRef();
  const warningLight = useRef();
  const mastHeight = 16;
  const offset = FOOTPRINT / 2 + 2.4;

  useFrame((state) => {
    if (craneJib.current) {
      craneJib.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.15 * Math.max(0.3, active);
    }
    if (warningLight.current) {
      const pulse = 0.4 + Math.abs(Math.sin(state.clock.elapsedTime * 2)) * 0.9;
      warningLight.current.material.emissiveIntensity = pulse;
    }
  });

  return (
    <group position={[offset, 0, -1.5]}>
      <mesh position={[0, mastHeight / 2, 0]} castShadow>
        <boxGeometry args={[0.35, mastHeight, 0.35]} />
        <meshStandardMaterial color="#f2a93b" roughness={0.5} metalness={0.3} />
      </mesh>
      <group ref={craneJib} position={[0, mastHeight - 0.2, 0]}>
        <mesh position={[3.4, 0, 0]}>
          <boxGeometry args={[7, 0.28, 0.28]} />
          <meshStandardMaterial color="#f2a93b" roughness={0.5} metalness={0.3} />
        </mesh>
        <mesh position={[-1.5, 0, 0]}>
          <boxGeometry args={[2.2, 0.28, 0.28]} />
          <meshStandardMaterial color="#8b8d93" roughness={0.6} />
        </mesh>
        <mesh position={[6.2, -2.2, 0]}>
          <boxGeometry args={[0.08, 4.2, 0.08]} />
          <meshStandardMaterial color="#5c5e64" />
        </mesh>
        <mesh ref={warningLight} position={[0, 0.4, 0]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#e24b4a" emissive="#e24b4a" emissiveIntensity={0.4} />
        </mesh>
      </group>
    </group>
  );
}
