import { Canvas } from '@react-three/fiber';
import { Suspense, useMemo } from 'react';
import { useJourney } from '../../context/JourneyContext';
import { buildingLocal } from '../../lib/journeyMap';
import { isLowDetailDevice } from '../../lib/device';
import CityScene from '../../scenes/city/CityScene';
import ConstructionSite from '../../scenes/skyscraper/ConstructionSite';
import CameraRig from './CameraRig';
import AtmosphereDust from './AtmosphereDust';

/**
 * Experience
 * The single WebGL canvas for the whole site, fixed behind the scrollable
 * HTML content. Phase 2 renders the city + a fully constructible
 * skyscraper (see scenes/skyscraper/ConstructionSite and buildingConfig);
 * later phases add scenes/space and scenes/moon without touching this
 * assembly point.
 */
export default function Experience() {
  const { progress } = useJourney();
  const lowDetail = useMemo(() => isLowDetailDevice(), []);

  // BUILDING_LOCAL: 0 = empty site, 1 = finished skyscraper. See
  // src/lib/journeyMap.js for how this is derived from shared progress.
  const reveal = buildingLocal(progress);

  return (
    <div className="experience-canvas" aria-hidden="true">
      <Canvas
        shadows={!lowDetail}
        camera={{ position: [0, 9, 30], fov: 45, near: 0.1, far: 300 }}
        dpr={lowDetail ? [1, 1] : [1, 1.75]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#050710']} />
        <fog attach="fog" args={['#0d1219', 18, 110]} />
        <Suspense fallback={null}>
          <CityScene lowDetail={lowDetail} />
          <ConstructionSite reveal={reveal} lowDetail={lowDetail} />
          <AtmosphereDust lowDetail={lowDetail} />
        </Suspense>
        <CameraRig />
      </Canvas>
    </div>
  );
}
