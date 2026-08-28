import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useJourney } from '../../context/JourneyContext';

// Named camera keyframes across the FULL shared journey progress (0-1).
// The first two live in the hero/city-approach segment (see
// src/lib/journeyMap.js); the rest track the skyscraper as it rises,
// staying wide enough to keep the whole tower in frame instead of
// pushing in close and breaking the composition.
const KEYFRAMES = [
  { p: 0, pos: [0, 9, 30], look: [0, 4, -6], fov: 48, roll: 0 },
  { p: 0.06, pos: [7, 6, 14], look: [0, 4, -8], fov: 45, roll: 0.006 },
  { p: 0.14, pos: [4.5, 3.6, 9], look: [0, 3, -10], fov: 42, roll: 0 }, // foundation/structure begin
  { p: 0.3, pos: [7, 10, 14], look: [0, 9, -10], fov: 44, roll: -0.006 }, // floors rising
  { p: 0.5, pos: [10, 14, 17], look: [0, 14, -10], fov: 45, roll: 0.004 }, // facade
  { p: 0.7, pos: [-8, 17, 15], look: [0, 17, -10], fov: 44, roll: -0.004 }, // windows + light, orbit to the other side
  { p: 0.9, pos: [0, 20, 27], look: [0, 19, -10], fov: 42, roll: 0 }, // systems, pulling back for scale
  { p: 1, pos: [14, 16, 30], look: [0, 16, -10], fov: 40, roll: 0 }, // completed landmark, wide final shot
];

function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

function sampleKeyframes(t) {
  const clamped = THREE.MathUtils.clamp(t, 0, 1);
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    const a = KEYFRAMES[i];
    const b = KEYFRAMES[i + 1];
    if (clamped >= a.p && clamped <= b.p) {
      const eased = smoothstep((clamped - a.p) / (b.p - a.p || 1));
      return {
        pos: a.pos.map((v, idx) => THREE.MathUtils.lerp(v, b.pos[idx], eased)),
        look: a.look.map((v, idx) => THREE.MathUtils.lerp(v, b.look[idx], eased)),
        fov: THREE.MathUtils.lerp(a.fov, b.fov, eased),
        roll: THREE.MathUtils.lerp(a.roll, b.roll, eased),
      };
    }
  }
  const last = KEYFRAMES[KEYFRAMES.length - 1];
  return { pos: last.pos, look: last.look, fov: last.fov, roll: last.roll };
}

export default function CameraRig() {
  const { progressRef } = useJourney();
  const { camera } = useThree();
  const lookTarget = useRef(new THREE.Vector3(0, 4, -6));
  const currentFov = useRef(48);
  const currentRoll = useRef(0);

  useFrame((state, delta) => {
    const { pos, look, fov, roll } = sampleKeyframes(progressRef.current);

    const damp = 3.4;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, pos[0], damp, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, pos[1], damp, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, pos[2], damp, delta);

    lookTarget.current.x = THREE.MathUtils.damp(lookTarget.current.x, look[0], damp, delta);
    lookTarget.current.y = THREE.MathUtils.damp(lookTarget.current.y, look[1], damp, delta);
    lookTarget.current.z = THREE.MathUtils.damp(lookTarget.current.z, look[2], damp, delta);

    currentFov.current = THREE.MathUtils.damp(currentFov.current, fov, damp, delta);
    currentRoll.current = THREE.MathUtils.damp(currentRoll.current, roll, damp, delta);

    // a barely-perceptible handheld drift keeps the shot from feeling like
    // a locked-off render, without reading as shaky-cam
    const driftX = Math.sin(state.clock.elapsedTime * 0.18) * 0.03;
    const driftY = Math.cos(state.clock.elapsedTime * 0.13) * 0.02;

    camera.lookAt(
      lookTarget.current.x + driftX,
      lookTarget.current.y + driftY,
      lookTarget.current.z
    );
    camera.rotation.z = currentRoll.current;

    if (camera.isPerspectiveCamera && Math.abs(camera.fov - currentFov.current) > 0.01) {
      camera.fov = currentFov.current;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
