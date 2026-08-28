import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FLOOR_COUNT, FLOOR_HEIGHT, FINAL_HEIGHT, FOOTPRINT } from './buildingConfig';

const CORNER_OFFSET = FOOTPRINT / 2 - 0.3;
const CORNERS = [
  [CORNER_OFFSET, CORNER_OFFSET],
  [-CORNER_OFFSET, CORNER_OFFSET],
  [CORNER_OFFSET, -CORNER_OFFSET],
  [-CORNER_OFFSET, -CORNER_OFFSET],
];

/**
 * Skeleton
 * The structural frame: 4 corner columns + a central core, all rising
 * together (physical scale/position growth, not opacity), plus a ring
 * beam at every floor level that fades in once the frame reaches that
 * height. `heightT` (0-1) is the shared skeleton-rise progress from
 * buildingConfig.skeletonHeightT — Foundation and Structure are really
 * the same rising frame at different heights, not separate objects.
 */
export default function Skeleton({ heightT }) {
  const columnsRef = useRef();
  const coreRef = useRef();
  const beamsRef = useRef();

  useFrame((_, delta) => {
    const targetHeight = Math.max(0.15, heightT * FINAL_HEIGHT);

    if (columnsRef.current) {
      columnsRef.current.children.forEach((col) => {
        col.scale.y = THREE.MathUtils.damp(col.scale.y, targetHeight, 4, delta);
        col.position.y = col.scale.y / 2;
      });
    }
    if (coreRef.current) {
      const coreHeight = Math.max(0.15, targetHeight * 0.98);
      coreRef.current.scale.y = THREE.MathUtils.damp(coreRef.current.scale.y, coreHeight, 4, delta);
      coreRef.current.position.y = coreRef.current.scale.y / 2;
    }
    if (beamsRef.current) {
      beamsRef.current.children.forEach((beam, i) => {
        const floorHeight = i * FLOOR_HEIGHT;
        const t = THREE.MathUtils.clamp((targetHeight - floorHeight) / FLOOR_HEIGHT, 0, 1);
        const s = Math.max(0.02, t);
        if (Math.abs(beam.scale.x - s) > 0.001) beam.scale.set(s, 1, s);
      });
    }
  });

  return (
    <group>
      <group ref={columnsRef}>
        {CORNERS.map(([x, z], i) => (
          <mesh key={i} position={[x, 0.1, z]} scale={[1, 0.15, 1]} castShadow>
            <boxGeometry args={[0.45, 1, 0.45]} />
            <meshStandardMaterial color="#c7c9ce" roughness={0.35} metalness={0.65} />
          </mesh>
        ))}
      </group>

      <mesh ref={coreRef} position={[0, 0.1, 0]} scale={[1, 0.15, 1]}>
        <boxGeometry args={[1.6, 1, 1.6]} />
        <meshStandardMaterial color="#3a3d44" roughness={0.6} metalness={0.4} />
      </mesh>

      {/* per-floor ring beams, faded in as the frame passes each level */}
      <group ref={beamsRef}>
        {Array.from({ length: FLOOR_COUNT }).map((_, i) => (
          <mesh key={i} position={[0, i * FLOOR_HEIGHT, 0]} scale={[0.02, 1, 0.02]}>
            <boxGeometry args={[FOOTPRINT - 0.4, 0.12, FOOTPRINT - 0.4]} />
            <meshStandardMaterial color="#8b8d93" roughness={0.5} metalness={0.5} wireframe />
          </mesh>
        ))}
      </group>
    </group>
  );
}
