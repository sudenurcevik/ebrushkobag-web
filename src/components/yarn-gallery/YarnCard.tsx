'use client';

import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { CARD_THEME, type YarnCard as Card } from '@/data/yarn-gallery';
import { reel } from './reel';

/**
 * One step of the helix around the yarn: a pane of frosted glass carrying
 * the photograph and its text (painted by cardFace.ts). The glass takes the
 * season's tint and its edge the season's metal (CARD_THEME).
 *
 * - **Glass.** Milky, half-clear: the reel behind shows through softly. Its
 *   rim catches light as the pane turns (a fresnel edge), a hairline of
 *   champagne outlines it, and a broad soft sheen slides across the surface
 *   as the reel rotates.
 * - **Front and back.** The card facing the viewer is fully present; its
 *   neighbours drop right back into the season's sky — pale and mostly
 *   transparent — so the front card leads.
 * - **Curved.** Bent gently on a cylinder, so it wraps the yarn.
 * - **Responsive.** Under the pointer it tilts a little towards it.
 */

const IMAGE_ASPECT = 1122 / 1402; // the vitrin photographs, width / height
const BEND_RADIUS = 2.4; // × card width: a gentle curve

const vertexShader = /* glsl */ `
  #include <fog_pars_vertex>
  varying vec2 vUv;
  varying vec3 vNormalView;
  varying vec3 vViewDir;
  void main() {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vNormalView = normalize(normalMatrix * normal);
    vViewDir = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

const fragmentShader = /* glsl */ `
  #include <fog_pars_fragment>
  uniform sampler2D uFace;
  uniform sampler2D uMap;
  uniform float uHasFace;
  uniform vec2 uSize;
  uniform float uImageAspect;
  uniform float uPresence; // 1 at the front, falling away with distance
  uniform float uSheen;    // position of the sliding light, -1 → 1
  uniform float uLight;
  uniform float uHover;
  uniform vec3 uGlass;
  uniform vec3 uRim;
  uniform vec3 uPage;
  varying vec2 vUv;
  varying vec3 vNormalView;
  varying vec3 vViewDir;

  float sdRoundBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
  }

  void main() {
    vec2 half_ = uSize * 0.5;
    vec2 p = (vUv - 0.5) * uSize;
    float minSize = min(uSize.x, uSize.y);
    float d = sdRoundBox(p, half_, 0.045 * minSize);
    float aa = fwidth(d) * 1.2;
    float shape = 1.0 - smoothstep(-aa, aa, d);
    if (shape < 0.01) discard;

    vec2 uv = vUv;
    if (!gl_FrontFacing) uv.x = 1.0 - uv.x; // read correctly from behind too

    // Frosted glass: milky, brighter towards the top, its edge catching the
    // light as the pane turns.
    float fresnel = pow(1.0 - abs(dot(normalize(vNormalView), normalize(vViewDir))), 2.2);
    vec3 glass = uGlass * (0.97 + 0.05 * vUv.y);
    // Frosted enough that what passes behind is only a shadow of itself.
    float edge = smoothstep(-0.06 * minSize, 0.0, d);
    float glassAlpha = 0.8 + 0.06 * vUv.y + 0.14 * fresnel - 0.25 * edge;
    // A broad soft sheen sliding across as the reel turns.
    float band = dot((vUv - 0.5) * 2.0, normalize(vec2(1.0, 0.55))) - uSheen * 1.8;
    float sheen = exp(-band * band * 4.0) * 0.28;
    glass += sheen + fresnel * 0.25;
    glassAlpha += sheen * 0.4;

    // What the glass carries: the painted face, or — until the fonts are
    // ready — the photograph alone, set into the pane.
    vec4 face;
    if (uHasFace > 0.5) {
      face = texture2D(uFace, uv);
    } else {
      float inset = 0.06 * minSize;
      vec2 win = half_ - inset;
      vec2 q = (uv - 0.5) * uSize / win * 0.5 + 0.5;
      float winAspect = win.x / win.y;
      vec2 s = winAspect > uImageAspect ? vec2(1.0, uImageAspect / winAspect) : vec2(winAspect / uImageAspect, 1.0);
      float inPhoto = 1.0 - smoothstep(-aa, aa, sdRoundBox(p, win, 0.03 * minSize));
      face = vec4(texture2D(uMap, (q - 0.5) * s + 0.5).rgb, inPhoto);
    }

    vec3 col = mix(glass, face.rgb, face.a);
    float alpha = mix(glassAlpha, 1.0, face.a);

    // A hairline of champagne just inside the edge, and a finer light line
    // along the top as if the glass were bevelled.
    float rimLine = 1.0 - smoothstep(0.0, aa * 1.5, abs(d + 0.006 * minSize) - 0.0022 * minSize);
    float bevel = (1.0 - smoothstep(0.0, aa * 2.0, abs(d + 0.014 * minSize) - 0.0015 * minSize)) * step(0.0, p.y);
    col = mix(col, uRim, rimLine * 0.85);
    col = mix(col, vec3(1.0), bevel * 0.6);
    alpha = max(alpha, rimLine * 0.9);

    col *= uLight + uHover * 0.04;
    if (!gl_FrontFacing) col *= 0.94;

    // Away from the front: it melts into the season's sky — paler and mostly
    // clear, but keeping its colour (never greyed).
    float away = 1.0 - uPresence;
    col = mix(col, uPage, away * 0.55);
    alpha *= mix(0.07, 1.0, uPresence);

    gl_FragColor = vec4(col, alpha * shape);
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

/** A plane bent on a cylinder, its edges curling back round the yarn. */
function bentPlane(width: number, height: number) {
  const geometry = new THREE.PlaneGeometry(width, height, 32, 1);
  const r = width * BEND_RADIUS;
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const phi = pos.getX(i) / r;
    pos.setXYZ(i, r * Math.sin(phi), pos.getY(i), -r * (1 - Math.cos(phi)));
  }
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * How present a card is, by its distance (in steps) from the front of the
 * descent: fully there at the front, about a quarter at the neighbours,
 * almost gone further off.
 */
function presence(steps: number) {
  return 1 - 0.74 * THREE.MathUtils.smoothstep(steps, 0.25, 1) - 0.2 * THREE.MathUtils.smoothstep(steps, 1, 3);
}

const tmpPos = new THREE.Vector3();
const tmpNormal = new THREE.Vector3();
const toCamera = new THREE.Vector3();
const tmpQuat = new THREE.Quaternion();
const tiltQuat = new THREE.Quaternion();
const tiltEuler = new THREE.Euler();

export function YarnCard({
  card,
  texture,
  face,
  pageColor,
  reducedMotion,
  onSelect,
}: {
  card: Card;
  texture: THREE.Texture;
  /** The painted face; null until the fonts are ready. */
  face: THREE.Texture | null;
  /** The sky behind, which far cards fade towards. */
  pageColor: THREE.Color;
  reducedMotion: boolean;
  onSelect: (card: Card) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const hovered = useRef(false);
  const tilt = useRef({ x: 0, y: 0 });
  const camera = useThree((s) => s.camera);

  const baseQuat = useMemo(
    () =>
      new THREE.Quaternion().setFromEuler(new THREE.Euler(card.rotationX, card.rotationY, card.rotationZ, 'YXZ')),
    [card.rotationX, card.rotationY, card.rotationZ],
  );

  const geometry = useMemo(() => bentPlane(card.width, card.height), [card.width, card.height]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: THREE.UniformsUtils.merge([
          THREE.UniformsLib.fog,
          {
            uFace: { value: null },
            uMap: { value: null },
            uHasFace: { value: 0 },
            uSize: { value: new THREE.Vector2(card.width, card.height) },
            uImageAspect: { value: IMAGE_ASPECT },
            uPresence: { value: 0 },
            uSheen: { value: 0 },
            uLight: { value: 1 },
            uHover: { value: 0 },
            uGlass: { value: new THREE.Color(CARD_THEME[card.season].glass) },
            uRim: { value: new THREE.Color(CARD_THEME[card.season].rim) },
            uPage: { value: new THREE.Color('#F7F1EC') },
          },
        ]),
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: false,
        fog: true,
        toneMapped: false,
      }),
    [card.width, card.height, card.season],
  );

  const u = material.uniforms;
  u.uMap.value = texture;
  u.uFace.value = face;
  u.uHasFace.value = face ? 1 : 0;
  u.uPage.value = pageColor;

  useEffect(
    () => () => {
      if (hovered.current) document.body.style.cursor = '';
      material.dispose();
      geometry.dispose();
    },
    [material, geometry],
  );

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const k = reducedMotion ? 1 : 1 - Math.exp(-dt * 6);

    g.getWorldPosition(tmpPos);
    toCamera.subVectors(camera.position, tmpPos).normalize();
    tmpNormal.set(0, 0, 1).applyQuaternion(g.quaternion);
    const facing = Math.max(0, tmpNormal.dot(toCamera));

    const steps = Math.abs(card.index - reel.position);
    const target = presence(steps);
    u.uPresence.value += (target - u.uPresence.value) * k;
    // The sheen slides with the card's place in the turn.
    u.uSheen.value = THREE.MathUtils.clamp(card.index - reel.position, -1.2, 1.2);
    u.uLight.value += (0.9 + 0.12 * facing - u.uLight.value) * k;
    u.uHover.value += ((hovered.current ? 1 : 0) - u.uHover.value) * k;

    // Keeps its place on the helix, tilted a little towards the pointer.
    const t = hovered.current && !reducedMotion ? tilt.current : { x: 0, y: 0 };
    tiltQuat.setFromEuler(tiltEuler.set(t.x, t.y, 0));
    tmpQuat.copy(baseQuat).multiply(tiltQuat);
    g.quaternion.slerp(tmpQuat, k);
    const scale = hovered.current ? 1.012 : 1;
    g.scale.setScalar(g.scale.x + (scale - g.scale.x) * k);
  });

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    hovered.current = true;
    document.body.style.cursor = 'pointer';
  };
  const onMove = (e: ThreeEvent<PointerEvent>) => {
    if (!e.uv) return;
    tilt.current = { x: -(e.uv.y - 0.5) * 0.14, y: (e.uv.x - 0.5) * 0.18 };
  };
  const onOut = () => {
    hovered.current = false;
    document.body.style.cursor = '';
  };

  return (
    <group ref={group} position={card.position} quaternion={baseQuat}>
      <mesh
        geometry={geometry}
        material={material}
        onPointerOver={onOver}
        onPointerMove={onMove}
        onPointerOut={onOut}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(card);
        }}
      />
    </group>
  );
}
