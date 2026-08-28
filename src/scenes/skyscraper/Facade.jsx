import { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createSeededRandom } from '../../lib/seededRandom';
import { FLOOR_COUNT, FLOOR_HEIGHT, FOOTPRINT } from './buildingConfig';

const SIDES = [
  { axis: 'z', sign: 1 },
  { axis: 'z', sign: -1 },
  { axis: 'x', sign: 1 },
  { axis: 'x', sign: -1 },
];

const PANEL_WIDTH = FOOTPRINT - 0.6;
const PANEL_THICKNESS = 0.08;

function panelTransform(dummy, side, floorIndex) {
  const offset = FOOTPRINT / 2;
  const y = floorIndex * FLOOR_HEIGHT + FLOOR_HEIGHT / 2;
  if (side.axis === 'z') {
    dummy.position.set(0, y, side.sign * offset);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(PANEL_WIDTH, FLOOR_HEIGHT * 0.86, PANEL_THICKNESS);
  } else {
    dummy.position.set(side.sign * offset, y, 0);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(PANEL_THICKNESS, FLOOR_HEIGHT * 0.86, PANEL_WIDTH);
  }
}

/**
 * Facade
 * Stylized "glass" perimeter panels, one InstancedMesh for the whole
 * building (FLOOR_COUNT * 4 sides instances, still a single draw call).
 * Deliberately minimal/flat rather than photoreal glass — a premium
 * digital-studio look, not an architectural render. Reveals bottom-to-top
 * once the frame (Skeleton/Floors) has already passed that height.
 */
export default function Facade({ facadeT }) {
  const meshRef = useRef();
  const count = FLOOR_COUNT * SIDES.length;

  const layout = useMemo(() => {
    const rand = createSeededRandom(555);
    const items = [];
    for (let f = 0; f < FLOOR_COUNT; f++) {
      for (const side of SIDES) {
        items.push({ floor: f, side, shade: 0.85 + rand() * 0.25 });
      }
    }
    return items;
  }, []);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    layout.forEach((p, i) => {
      panelTransform(dummy, p.side, p.floor);
      dummy.scale.multiplyScalar(1); // keep base transform, visibility handled in useFrame
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      color.setRGB(0.55 * p.shade, 0.62 * p.shade, 0.7 * p.shade);
      mesh.setColorAt(i, color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [layout]);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const targetVisible = facadeT * FLOOR_COUNT;
    let changed = false;

    if (!mesh.userData.scales) mesh.userData.scales = new Array(count).fill(0);

    layout.forEach((p, i) => {
      const t = THREE.MathUtils.clamp(targetVisible - p.floor, 0, 1);
      const prevScale = mesh.userData.scales[i];
      const nextScale = THREE.MathUtils.damp(prevScale, t, 5, delta);
      mesh.userData.scales[i] = nextScale;

      panelTransform(dummy, p.side, p.floor);
      // panels grow vertically into place from the floor line up
      dummy.scale.y *= Math.max(0.001, nextScale);
      dummy.position.y = p.floor * FLOOR_HEIGHT + (dummy.scale.y) / 2;
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      if (Math.abs(nextScale - prevScale) > 0.0005) changed = true;
    });

    if (changed) mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.15} metalness={0.4} transparent opacity={0.82} />
    </instancedMesh>
  );
}
