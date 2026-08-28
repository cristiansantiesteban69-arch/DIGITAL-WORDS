import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FINAL_HEIGHT, FOOTPRINT } from './buildingConfig';

/**
 * RooftopSystems
 * Small "the building is coming alive" details for the systems +
 * completion stages: a construction hoist that climbs the facade once
 * (systems stage), and a rooftop antenna with a beacon light that
 * appears and turns steady as the tower nears completion. Kept to two
 * extra meshes — no new geometry categories, no particle systems.
 */
export default function RooftopSystems({ systemsT, completionT }) {
  const hoistRef = useRef();
  const antennaRef = useRef();
  const beaconRef = useRef();

  useFrame((state, delta) => {
    if (hoistRef.current) {
      // one climb from ground to roof over the systems stage, then it
      // stays parked at the top — reads as "delivering the final loads"
      const travel = THREE.MathUtils.clamp(systemsT, 0, 1);
      const y = THREE.MathUtils.lerp(1, FINAL_HEIGHT - 2, travel);
      hoistRef.current.position.y = THREE.MathUtils.damp(hoistRef.current.position.y, y, 4, delta);
      hoistRef.current.visible = systemsT > 0.02;
    }
    if (antennaRef.current) {
      const scale = THREE.MathUtils.damp(antennaRef.current.scale.y, Math.max(0.02, completionT), 3, delta);
      antennaRef.current.scale.set(1, scale, 1);
      antennaRef.current.position.y = FINAL_HEIGHT + (scale * 2.4) / 2;
    }
    if (beaconRef.current) {
      const pulse = completionT > 0.85 ? 1 : 0.5 + Math.abs(Math.sin(state.clock.elapsedTime * 1.6)) * 0.6;
      beaconRef.current.material.emissiveIntensity = pulse * completionT;
      beaconRef.current.position.y = FINAL_HEIGHT + completionT * 2.4;
    }
  });

  return (
    <group>
      <mesh ref={hoistRef} position={[FOOTPRINT / 2 + 0.3, 1, 0]}>
        <boxGeometry args={[0.5, 0.4, 0.5]} />
        <meshStandardMaterial color="#f2a93b" roughness={0.5} metalness={0.4} />
      </mesh>

      <mesh ref={antennaRef} position={[0, FINAL_HEIGHT, 0]} scale={[1, 0.02, 1]}>
        <cylinderGeometry args={[0.05, 0.08, 2.4, 8]} />
        <meshStandardMaterial color="#c7c9ce" roughness={0.4} metalness={0.7} />
      </mesh>

      <mesh ref={beaconRef} position={[0, FINAL_HEIGHT, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#e24b4a" emissive="#e24b4a" emissiveIntensity={0} />
      </mesh>
    </group>
  );
}
