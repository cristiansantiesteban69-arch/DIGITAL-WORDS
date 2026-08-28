import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * SkyDome
 * A single large inward-facing sphere with a two-color vertical gradient
 * (cheap custom ShaderMaterial, no textures) standing in for a night sky.
 * One extra draw call, but it reads as real depth/atmosphere behind the
 * fog instead of a flat clear color.
 */
export default function SkyDome() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          topColor: { value: new THREE.Color('#050710') },
          bottomColor: { value: new THREE.Color('#141a26') },
          offset: { value: 20 },
          exponent: { value: 0.7 },
        },
        vertexShader: `
          varying vec3 vWorldPosition;
          void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 topColor;
          uniform vec3 bottomColor;
          uniform float offset;
          uniform float exponent;
          varying vec3 vWorldPosition;
          void main() {
            float h = normalize(vWorldPosition + offset).y;
            gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
          }
        `,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    []
  );

  return (
    <mesh material={material} renderOrder={-1}>
      <sphereGeometry args={[180, 24, 16]} />
    </mesh>
  );
}
