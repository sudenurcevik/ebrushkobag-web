'use client';

import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { CARD_THEME, type YarnCard as Card } from '@/data/yarn-gallery';
import { PANEL } from './cardFace';
import { reel } from './reel';

/**
 * One step of the helix around the yarn: the photograph full bleed, with its
 * text on a pane of frosted glass laid over it (type and HUD painted by
 * cardFace.ts), in the season's colours (CARD_THEME).
 *
 * - **Photograph and glass.** The panel frosts the photograph behind it and
 *   washes it with the season's glass colour, with the backdrop's knitting
 *   chart faint across it. The card's top-right corner is cut away; its rim
 *   is an iridescent line of the season's two colours flowing slowly round,
 *   and a broad sheen slides across as the reel turns.
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
  uniform float uTime;
  uniform vec4 uPanel;     // glass panel in card UV: x0, y0, x1, y1
  uniform vec3 uGlass;
  uniform vec3 uRim;
  uniform vec3 uAccent;
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

    // Outline: a rounded rectangle with its top-right corner cut away.
    float cut = 0.1 * minSize;
    float dRect = sdRoundBox(p, half_, 0.035 * minSize);
    float dCut = (p.x + p.y - (half_.x + half_.y - cut)) * 0.70711;
    float d = max(dRect, dCut);
    float aa = fwidth(d) * 1.2;
    float shape = 1.0 - smoothstep(-aa, aa, d);
    if (shape < 0.01) discard;

    vec2 uv = vUv;
    if (!gl_FrontFacing) uv.x = 1.0 - uv.x; // read correctly from behind too

    // The photograph, whole and uncropped: full height down the left of a
    // wide card, full width across the top of a tall one. The rest of the
    // card is its colour — the same photograph enlarged and blurred right
    // out — into which it dissolves, and over which the glass panel sits.
    float cardAspect = uSize.x / uSize.y;
    bool wide = cardAspect > 1.0;
    vec2 cover = cardAspect > uImageAspect ? vec2(1.0, uImageAspect / cardAspect) : vec2(cardAspect / uImageAspect, 1.0);
    vec2 photoUv = (uv - 0.5) * cover + 0.5;
    float extent = wide ? (uSize.y * uImageAspect) / uSize.x : min(1.0, (uSize.x / uImageAspect) / uSize.y);
    vec2 sharpUv = wide ? vec2(uv.x / extent, uv.y) : vec2(uv.x, (uv.y - (1.0 - extent)) / extent);
    float along = wide ? uv.x / extent : 1.0 - (uv.y - (1.0 - extent)) / extent;
    float inPhoto = 1.0 - smoothstep(0.86, 1.0, along);
    vec3 sharp = texture2D(uMap, clamp(sharpUv, 0.0, 1.0)).rgb;
    vec3 bleed = vec3(0.0);
    for (int i = 0; i < 10; i++) {
      float fi = float(i);
      float a = fi * 2.39996;
      float r = 0.08 + 0.14 * sqrt(fi / 10.0);
      bleed += texture2D(uMap, (uv - 0.5) * cover * 0.6 + 0.5 + vec2(cos(a), sin(a)) * r * cover).rgb;
    }
    bleed = mix(bleed / 10.0, uGlass, 0.25);
    vec3 photo = mix(bleed, sharp, inPhoto);

    // The glass panel: the photograph behind it, frosted (a spiral of taps),
    // washed with the season's glass colour, with a faint knitting chart.
    vec2 pc = (uPanel.xy + uPanel.zw) * 0.5;
    vec2 ph = (uPanel.zw - uPanel.xy) * 0.5;
    float dPanel = sdRoundBox((uv - pc) * uSize, ph * uSize, 0.03 * minSize);
    float inPanel = 1.0 - smoothstep(-aa, aa, dPanel);
    vec3 frost = vec3(0.0);
    for (int i = 0; i < 14; i++) {
      float fi = float(i);
      float a = fi * 2.39996;
      float r = 0.012 + 0.055 * sqrt(fi / 14.0);
      frost += texture2D(uMap, photoUv + vec2(cos(a), sin(a)) * r * cover).rgb;
    }
    frost /= 14.0;
    vec3 glass = mix(frost, uGlass, 0.66) + 0.05;
    vec2 cell = mod(p / (0.055 * minSize), 1.0) - 0.5;
    float chart = max(step(abs(cell.x), 0.035) * step(abs(cell.y), 0.16), step(abs(cell.y), 0.035) * step(abs(cell.x), 0.16));
    glass = mix(glass, uRim, chart * 0.1);
    // Panel edge: a fine line of light.
    float edge = 1.0 - smoothstep(0.0, aa * 1.5, abs(dPanel) - 0.0015 * minSize);

    // The photograph darkens a touch towards the panel, so the glass reads.
    float towards = smoothstep(0.35, 0.0, max(dPanel, 0.0) / minSize);
    vec3 col = mix(photo * (1.0 - 0.18 * towards), glass, inPanel);
    col = mix(col, vec3(1.0), edge * 0.7);

    // What the glass carries: type and HUD (painted by cardFace.ts).
    if (uHasFace > 0.5) {
      vec4 face = texture2D(uFace, uv);
      col = mix(col, face.rgb, face.a);
    }

    // The rim: an iridescent line in the season's colours, flowing round.
    float rimBand = 1.0 - smoothstep(0.0, aa * 1.8, abs(d + 0.006 * minSize) - 0.005 * minSize);
    float ang = atan(p.y, p.x);
    vec3 rimCol = mix(uRim, uAccent, 0.5 + 0.5 * sin(ang * 2.0 + uTime * 0.8));
    rimCol = mix(rimCol, vec3(1.0), pow(max(0.0, sin(ang * 3.0 - uTime * 1.3)), 8.0) * 0.8);
    col = mix(col, rimCol, rimBand);

    // A broad soft sheen sliding across as the reel turns, and the edge
    // catching light as the card turns.
    float band = dot((vUv - 0.5) * 2.0, normalize(vec2(1.0, 0.55))) - uSheen * 1.8;
    col += exp(-band * band * 4.0) * 0.08;
    float fresnel = pow(1.0 - abs(dot(normalize(vNormalView), normalize(vViewDir))), 2.2);
    col += fresnel * 0.12;

    col *= uLight + uHover * 0.04;
    if (!gl_FrontFacing) col *= 0.94;

    // Away from the front: it melts into the season's sky — paler and mostly
    // clear, but keeping its colour (never greyed).
    float away = 1.0 - uPresence;
    col = mix(col, uPage, away * 0.55);

    gl_FragColor = vec4(col, shape * mix(0.07, 1.0, uPresence));
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
            uAccent: { value: new THREE.Color(CARD_THEME[card.season].accent) },
            uTime: { value: 0 },
            uPanel: {
              value: new THREE.Vector4(...(card.width > card.height ? PANEL.landscape : PANEL.portrait)),
            },
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
    u.uTime.value += dt;
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
