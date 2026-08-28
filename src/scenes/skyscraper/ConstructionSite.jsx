import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { STAGES, bandT, skeletonHeightT, FOOTPRINT } from './buildingConfig';
import Skeleton from './Skeleton';
import Floors from './Floors';
import Facade from './Facade';
import Windows from './Windows';
import RooftopSystems from './RooftopSystems';
import GhostOutline from './GhostOutline';
import Crane from './Crane';

/**
 * ConstructionSite
 * The focal point of the whole scene and, from Phase 2 on, "THE WEBSITE
 * IS THE BUILDING": a full skyscraper that assembles itself as the
 * visitor scrolls. `reveal` is BUILDING_LOCAL progress (0-1), passed down
 * from Experience.jsx. This component only computes the per-stage
 * progress values (foundation/structure/floors/facade/windows/systems/
 * completion) from that single number and hands them to the specialized
 * sub-components in ./ — it holds no construction geometry itself beyond
 * the platform and hoarding, which is genuinely just the site, not the
 * building.
 */
export default function ConstructionSite({ reveal = 0, lowDetail = false }) {
  const siteLight = useRef();
  const hoardingRef = useRef();
  const entranceGlowRef = useRef();

  const foundationT = bandT(reveal, STAGES.foundation);
  const structureT = bandT(reveal, STAGES.structure);
  const floorsT = bandT(reveal, STAGES.floors);
  const facadeT = bandT(reveal, STAGES.facade);
  const windowsT = bandT(reveal, STAGES.windows);
  const systemsT = bandT(reveal, STAGES.systems);
  const completionT = bandT(reveal, STAGES.completion);
  const heightT = skeletonHeightT(reveal); // frame height, shared by Skeleton/Floors/Windows

  useFrame((_, delta) => {
    if (siteLight.current) {
      // warm site light peaks while the frame is actively rising, then
      // settles once the building has its own elegant lighting (windows)
      const target = 6 + Math.min(1, foundationT + structureT + floorsT) * 20 - windowsT * 8;
      siteLight.current.intensity = THREE.MathUtils.damp(siteLight.current.intensity, Math.max(6, target), 3, delta);
    }
    if (hoardingRef.current) {
      // the fenced lot fades out once real structure is visible — it's a
      // building site becoming a building, not a permanent fixture
      const target = 1 - THREE.MathUtils.clamp(floorsT, 0, 1);
      hoardingRef.current.material.opacity = THREE.MathUtils.damp(
        hoardingRef.current.material.opacity,
        target * 0.9,
        3,
        delta
      );
    }
    if (entranceGlowRef.current) {
      entranceGlowRef.current.intensity = THREE.MathUtils.damp(
        entranceGlowRef.current.intensity,
        completionT * 10,
        3,
        delta
      );
    }
  });

  return (
    <group position={[0, 0, -10]}>
      {/* the warm light that makes this spot the one alive point in a cold city */}
      <pointLight ref={siteLight} position={[0, 9, 0]} intensity={6} color="#f2a93b" distance={45} decay={2} />
      <spotLight
        position={[6, 16, 4]}
        angle={0.5}
        penumbra={0.6}
        intensity={18}
        color="#f7c581"
        distance={40}
        castShadow
      />
      {/* elegant, controlled entrance light — appears only once the
          building is complete, distinct from the site's construction glow */}
      <pointLight
        ref={entranceGlowRef}
        position={[0, 1.4, FOOTPRINT / 2 + 0.5]}
        intensity={0}
        color="#eef0f3"
        distance={8}
        decay={2}
      />

      {/* base platform */}
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <boxGeometry args={[7, 0.3, 7]} />
        <meshStandardMaterial color="#1a1d23" roughness={0.9} />
      </mesh>
      {/* perimeter hoarding — an active-site marker that fades once the tower rises */}
      <mesh ref={hoardingRef} position={[0, 0.6, 0]}>
        <boxGeometry args={[7.6, 0.9, 7.6]} />
        <meshStandardMaterial color="#12151a" roughness={0.95} wireframe transparent opacity={0.9} />
      </mesh>

      <GhostOutline heightT={heightT} completionT={completionT} />
      <Skeleton heightT={heightT} />
      <Floors heightT={heightT} />
      <Facade facadeT={facadeT} />
      <Windows windowsT={windowsT} heightT={heightT} lowDetail={lowDetail} />
      <RooftopSystems systemsT={systemsT} completionT={completionT} />
      <Crane active={foundationT + structureT + floorsT} />
    </group>
  );
}
