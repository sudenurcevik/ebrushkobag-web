'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { reel } from './reel';

/**
 * The blur behind a season's chapter, done here rather than by the browser.
 *
 * A CSS backdrop blur over a WebGL canvas has to blur the whole screen again
 * every frame, and it cost the change of season a third of its frame rate.
 * Instead, inside the chapter's circle the scene is drawn at half size,
 * its mipmaps made (each level an even average of the one before — no
 * shimmer or dot grid, however small the detail), and a level a sixteenth
 * the size of the screen is spread back up with a soft tent filter. While
 * the circle covers the screen that half-size draw is all there is, so the
 * chapter is cheaper than an ordinary frame; only while it opens and closes
 * is the sharp scene drawn as well, outside the circle.
 *
 * The circle follows the chapter's CSS keyframes (the veil, the name and the
 * sky open and close with it): see `chapter-iris` in the module CSS.
 */

/** cubic-bezier(x1, y1, x2, y2) as CSS evaluates it: progress at time x. */
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const at = (a: number, b: number, t: number) => 3 * a * (1 - t) ** 2 * t + 3 * b * (1 - t) * t * t + t ** 3;
  return (x: number) => {
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (at(x1, x2, mid) < x) lo = mid;
      else hi = mid;
    }
    return at(y1, y2, (lo + hi) / 2);
  };
}

const ease = cubicBezier(0.65, 0, 0.35, 1);
/** The circle's radius, as a share of its full 78% (chapter-iris). */
function iris(t: number) {
  if (t < 0 || t >= 1) return 0;
  if (t < 0.325) return ease(t / 0.325);
  if (t < 0.725) return 1;
  return 1 - ease((t - 0.725) / 0.275);
}

/** Matches the CSS circle: `circle(78% at 50% 46%)`. */
const FULL = 0.78;
const CENTRE_Y = 0.46;
const SCALE = 2;
/** The mip level read: 2^3 smaller again than the half-size image. */
const LOD = 3;
const centre = new THREE.Vector2();

const vertexShader = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

/** The blurred scene onto the screen, inside the chapter's circle only. */
const blurShader = /* glsl */ `
  uniform sampler2D uImage;
  uniform float uLod;
  uniform vec2 uTexel; // one texel of that mip level
  uniform vec2 uResolution;
  uniform vec2 uCentre;
  uniform float uRadius;
  void main() {
    if (length(gl_FragCoord.xy - uCentre) > uRadius) discard;
    vec2 uv = gl_FragCoord.xy / uResolution;
    // A 3 × 3 tent over the mip level, so its texels never show as blocks.
    vec4 c = vec4(0.0);
    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        float w = (2.0 - abs(float(x))) * (2.0 - abs(float(y)));
        c += textureLod(uImage, uv + vec2(float(x), float(y)) * uTexel, uLod) * w;
      }
    }
    c /= 16.0;
    // The image holds premultiplied, linear colour: tone-map and encode it
    // as the scene's own materials would, then premultiply again.
    gl_FragColor = vec4(c.a > 0.0001 ? c.rgb / c.a : vec3(0.0), c.a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    gl_FragColor.rgb *= gl_FragColor.a;
  }
`;

const pass = (fragmentShader: string, uniforms: Record<string, THREE.IUniform>) => {
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    blending: THREE.NoBlending,
    depthTest: false,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  mesh.frustumCulled = false;
  const scene = new THREE.Scene();
  scene.add(mesh);
  return { scene, material, mesh };
};

export function ChapterBlur() {
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);

  // The scene at half size, with its mipmaps.
  const target = useMemo(() => {
    const t = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, depthBuffer: true });
    t.texture.generateMipmaps = true;
    t.texture.minFilter = THREE.LinearMipmapLinearFilter;
    t.texture.magFilter = THREE.LinearFilter;
    return t;
  }, []);
  useEffect(() => {
    target.setSize(Math.max(1, Math.round((size.width * dpr) / SCALE)), Math.max(1, Math.round((size.height * dpr) / SCALE)));
  }, [target, size, dpr]);

  const blur = useMemo(
    () => ({
      camera: new THREE.Camera(),
      ...pass(blurShader, {
        uImage: { value: target.texture },
        uLod: { value: LOD },
        uTexel: { value: new THREE.Vector2() },
        uResolution: { value: new THREE.Vector2() },
        uCentre: { value: new THREE.Vector2() },
        uRadius: { value: 0 },
      }),
    }),
    [target],
  );

  // Ready before the first chapter, behind the loader: the target allocated
  // and the shader compiled by drawing it once (all discarded, at radius 0).
  useEffect(() => {
    gl.setRenderTarget(target);
    gl.clear();
    gl.setRenderTarget(null);
    const autoClear = gl.autoClear;
    gl.autoClear = false;
    gl.render(blur.scene, blur.camera);
    gl.autoClear = autoClear;
  }, [gl, target, blur]);

  useEffect(
    () => () => {
      target.dispose();
      blur.material.dispose();
      blur.mesh.geometry.dispose();
    },
    [target, blur],
  );

  const buffer = useMemo(() => new THREE.Vector2(), []);

  // Priority 1: this takes over drawing the frame.
  useFrame(({ scene, camera }) => {
    const t = reel.chapterStart < 0 ? -1 : (performance.now() - reel.chapterStart) / 1000 / reel.chapterLength;
    const open = iris(t);
    if (open <= 0) {
      gl.render(scene, camera);
      return;
    }
    gl.getDrawingBufferSize(buffer);
    const W = buffer.x;
    const H = buffer.y;
    const radius = (open * FULL * Math.hypot(W, H)) / Math.SQRT2;
    centre.set(W / 2, H * (1 - CENTRE_Y));
    const farthest = Math.hypot(W / 2, Math.max(centre.y, H - centre.y));

    // The scene at half size (its mipmaps are made as the draw ends).
    gl.setRenderTarget(target);
    gl.clear();
    gl.render(scene, camera);
    gl.setRenderTarget(null);

    // The sharp scene, only where the circle leaves it showing.
    if (radius < farthest) gl.render(scene, camera);
    else gl.clear();

    // Blurred, onto the screen inside the circle.
    const u = blur.material.uniforms;
    u.uTexel.value.set(2 ** LOD / target.width, 2 ** LOD / target.height);
    u.uResolution.value.set(W, H);
    u.uCentre.value.copy(centre);
    u.uRadius.value = radius;
    const autoClear = gl.autoClear;
    gl.autoClear = false;
    gl.render(blur.scene, blur.camera);
    gl.autoClear = autoClear;
  }, 1);

  return null;
}
