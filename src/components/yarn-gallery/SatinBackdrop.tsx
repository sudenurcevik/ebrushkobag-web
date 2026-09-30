'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { reel } from './reel';

/**
 * A living ground behind everything: satin — the cloth every bag in the
 * collection was photographed on — rendered as a slow, flowing field of
 * folds. The folds catch a soft iridescent sheen in the brand's pink and
 * periwinkle, and the pointer stirs a current through the cloth.
 *
 * Over it, barely there, a knitting chart: a fine grid of small crosses that
 * brightens round the pointer and drifts with the camera — the craft and the
 * screen in one texture.
 *
 * It owns the opening completely, then, once the seasons begin, thins to a
 * veil tinted with the season's sky so their own skies show through.
 */

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    // A full-screen quad at the far plane, whatever the camera does.
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uRes;
  uniform float uOpacity;
  uniform float uDrift;
  uniform float uPixelRatio;
  uniform vec3 uBase;
  uniform vec3 uTint;
  uniform float uTintMix;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; }
    return v;
  }

  void main() {
    float aspect = uRes.x / uRes.y;
    vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
    float t = uTime * 0.045;

    // The pointer stirs a current: the cloth is pulled round it a little.
    vec2 m = uMouse * 0.5 * vec2(aspect, 1.0);
    vec2 toM = p - m;
    float pull = exp(-dot(toM, toM) * 5.0);
    p += vec2(-toM.y, toM.x) * pull * 0.18;

    // Domain-warped folds, drifting slowly.
    vec2 q = p * 1.35 + vec2(uDrift * 0.4, 0.0);
    q += 0.45 * vec2(fbm(q * 0.9 + t), fbm(q * 0.9 - t + 3.7));
    float h = sin(q.x * 3.2 + q.y * 1.4 + fbm(q * 1.6 + t * 0.5) * 2.8 + t * 2.4);
    h = h * 0.5 + 0.5;
    h = h * h * (3.0 - 2.0 * h);

    // Light across the folds.
    vec3 n = normalize(vec3(-dFdx(h) * 90.0, -dFdy(h) * 90.0, 1.0));
    vec3 L = normalize(vec3(-0.45, 0.65, 0.62));
    float light = clamp(0.5 + 0.5 * dot(n, L), 0.0, 1.0);
    vec3 r = reflect(-L, n);
    float sheen = pow(max(r.z, 0.0), 12.0);
    float glow = smoothstep(0.5, 1.0, h) * 0.45;

    // Iridescence in the brand's pastels: pink, periwinkle, a breath of mint.
    float phase = dot(n.xy, vec2(1.4, 0.8)) * 1.3 + h * 0.6 + t * 1.5;
    vec3 irid = 0.5 + 0.5 * cos(6.2831 * (vec3(0.0, 0.3, 0.62) + phase));
    irid = mix(vec3(1.0), mix(vec3(1.0, 0.72, 0.86), vec3(0.72, 0.8, 1.0), irid.y), 0.55);

    // The folds shade into blush-lavender, never grey; the crests go
    // luminous with the iridescent sheen.
    vec3 base = mix(uBase, uTint, uTintMix);
    vec3 shade = mix(base, vec3(0.93, 0.85, 0.92), 0.7);
    vec3 col = mix(shade, base, smoothstep(0.15, 0.85, light));
    col += (sheen * 0.7 + glow * 0.3) * irid;
    col = mix(col, col * irid, 0.15);

    // The knitting chart: a fine cross every few pixels, shifting with the
    // camera, brighter round the pointer.
    float cell = 26.0 * uPixelRatio;
    vec2 g = gl_FragCoord.xy + vec2(uDrift * 260.0 * uPixelRatio, 0.0);
    vec2 c = mod(g, cell) - cell * 0.5;
    float arm = 3.5 * uPixelRatio;
    float line = 0.6 * uPixelRatio;
    float cross = max(step(abs(c.x), line) * step(abs(c.y), arm), step(abs(c.y), line) * step(abs(c.x), arm));
    float near = exp(-dot(toM, toM) * 9.0);
    col = mix(col, vec3(0.62, 0.45, 0.55), cross * (0.06 + near * 0.22));

    // Soft vignette and a whisper of grain, so the gradients never band.
    col *= 1.0 - 0.04 * dot(vUv - 0.5, vUv - 0.5) * 2.0;
    col += (hash(gl_FragCoord.xy + uTime) - 0.5) * 0.018;

    gl_FragColor = vec4(col, uOpacity);
    #include <colorspace_fragment>
    // Drawn first and unblended: the canvas composites premultiplied alpha
    // over the page, so a thinner veil lets the season's sky show through.
    gl_FragColor.rgb *= gl_FragColor.a;
  }
`;

export function SatinBackdrop({ reducedMotion }: { reducedMotion: boolean }) {
  const size = useThree((s) => s.size);
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const mouse = useRef(new THREE.Vector2());

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2() },
          uRes: { value: new THREE.Vector2(1, 1) },
          uOpacity: { value: 1 },
          uDrift: { value: 0 },
          uPixelRatio: { value: 1 },
          uBase: { value: new THREE.Color('#FCF8F4') },
          uTint: { value: new THREE.Color('#F7F2EC') },
          uTintMix: { value: 0 },
        },
        // Opaque, so it is drawn first (renderOrder) rather than after the
        // scene with the transparent things.
        transparent: false,
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  );

  useEffect(() => () => material.dispose(), [material]);

  useFrame((state, dt) => {
    const u = material.uniforms;
    const pr = gl.getPixelRatio();
    u.uRes.value.set(size.width * pr, size.height * pr);
    u.uPixelRatio.value = pr;
    if (!reducedMotion) u.uTime.value += dt;
    mouse.current.lerp(state.pointer, reducedMotion ? 1 : 1 - Math.exp(-dt * 3));
    u.uMouse.value.copy(mouse.current);
    u.uDrift.value = reel.angle * 0.35;
    // Owns the opening; a light veil in the season's colour afterwards.
    const seasons = THREE.MathUtils.smoothstep(reel.intro, 0.55, 0.95);
    // The seasons' own bright skies take over: only a faint sheen remains.
    u.uOpacity.value = THREE.MathUtils.lerp(1, 0.1, seasons);
    u.uTintMix.value = seasons * 0.6;
    if (scene.fog instanceof THREE.Fog) u.uTint.value.copy(scene.fog.color);
  });

  return (
    <mesh material={material} frustumCulled={false} renderOrder={-1000} raycast={() => null}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}
