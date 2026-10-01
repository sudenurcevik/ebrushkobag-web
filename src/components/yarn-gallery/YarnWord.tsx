'use client';

import { useProgress } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { YARN_PRESETS, YARN_TOP } from '@/data/yarn-gallery';
import {
  PLY_COUNT,
  PLY_OFFSET,
  PLY_RADIUS,
  PLY_TWIST,
  STRAND_OFFSET,
  STRAND_TWIST,
  fibreTexture,
  forkTips,
  yarnLine,
} from './Yarn';
import { reel } from './reel';

/**
 * The opening: "ebrushkobag" written in one unbroken line of the same
 * two-strand cord the spine is made of, laid down behind the tip of a crochet
 * hook, one letter per beat. The g ends in a free curl.
 *
 * Scrolling then winds it up: from the e onwards the cord is drawn into a
 * ball of yarn, layer over layer, while the brand pink and periwinkle turn
 * into spring's fuchsia and green, and the fine cord of the letters thickens
 * to the spine's own. The finished ball rolls down onto the top of the spine
 * and settles over it, so the spine comes straight out of the ball — the
 * whole descent unwinds from it, with no join to see. Scrolling back unwinds
 * the ball and writes the name again.
 *
 * Where the cord leads out of the ball to the spine, its two strands part
 * and meet the spine's own parted strands (the fork at the top of the spine,
 * in Yarn), so the two join strand to strand.
 *
 * The hook stays with the cord throughout: after writing it rests at the
 * end of the curl, as if about to go on; as the name is wound up it works
 * round the ball, tucking in each wrap; and when the ball drops onto the
 * spine it lifts away.
 *
 * The cord is drawn by the GPU. Its centre line lives in a small data
 * texture (position, normal, binormal and running length per sample); every
 * vertex of the six plies places itself on it in the vertex shader. So the
 * morph costs one texture upload per frame, not a rebuilt mesh.
 */

/** Where the camera looks during the opening, and from how far. */
export const WORD_VIEW = {
  lookY: 12.2,
  wide: { distance: 16, lift: 0.7 },
  compact: { distance: 15, lift: 0.6 },
};

const BASELINE = 11.3;
/** How long the hook takes to write the name — brisk, but still a hand. */
const WRITE_SECONDS = 6.2;
/** Cord laid per stitch: the hook dips and turns once per stitch. */
const STITCH = 0.16;
/** The share of the opening scroll spent winding the ball, before it drops. */
const WIND_SHARE = 0.62;
/**
 * The last stretch of cord leads out of the ball down to the top of the
 * spine — the same yarn, the same thickness — and shortens to nothing inside
 * the ball once it comes to rest there.
 */
const TUCKED_END = 0.03;
/** The share of the cord, at its end, over which its strands part to meet the spine's fork. */
const SPLIT = TUCKED_END * 0.55;
/**
 * The name is written in a finer cord (finer still on phones, where the
 * letters are smaller), which thickens to the spine's as it unravels.
 */
const writtenThickness = (compact: boolean) => (compact ? 0.34 : 0.5);

type Pt = [number, number];

/**
 * A monoline script, one letter at a time, in x-heights: each starts where
 * the last one left off (near the baseline, or higher after o and b) and
 * reaches its width `w` at the join.
 */
const ASCENDER: Pt[] = [
  [0.25, 0.7],
  [0.42, 1.45],
  [0.45, 1.95],
  [0.33, 2.15],
  [0.2, 1.95],
  [0.14, 1.3],
  [0.12, 0.6],
];

const LETTERS: Record<string, { w: number; pts: Pt[] }> = {
  e: {
    w: 0.75,
    pts: [[0, 0.2], [0.3, 0.42], [0.55, 0.62], [0.52, 0.92], [0.3, 0.98], [0.1, 0.75], [0.08, 0.35], [0.25, 0.05], [0.5, 0], [0.75, 0.2]],
  },
  b: {
    w: 0.8,
    pts: [[0, 0.2], ...ASCENDER, [0.14, 0.1], [0.32, 0], [0.55, 0.2], [0.6, 0.6], [0.45, 0.8], [0.35, 0.62], [0.55, 0.55], [0.8, 0.6]],
  },
  r: {
    w: 0.7,
    pts: [[0, 0.6], [0.15, 0.85], [0.22, 0.98], [0.35, 0.82], [0.48, 0.9], [0.52, 0.6], [0.45, 0.2], [0.5, 0.02], [0.7, 0.2]],
  },
  u: {
    w: 0.9,
    pts: [[0, 0.2], [0.1, 0.6], [0.16, 0.95], [0.12, 0.4], [0.2, 0.05], [0.38, 0.02], [0.55, 0.35], [0.62, 0.95], [0.6, 0.4], [0.62, 0.08], [0.75, 0], [0.9, 0.2]],
  },
  s: {
    w: 0.7,
    pts: [[0, 0.2], [0.2, 0.6], [0.32, 1.0], [0.42, 0.7], [0.55, 0.35], [0.5, 0.08], [0.3, 0], [0.15, 0.1], [0.35, 0.12], [0.55, 0.1], [0.7, 0.2]],
  },
  h: {
    w: 0.9,
    pts: [[0, 0.2], ...ASCENDER, [0.1, 0], [0.2, 0.55], [0.38, 0.9], [0.55, 0.8], [0.58, 0.4], [0.6, 0.08], [0.72, 0], [0.9, 0.2]],
  },
  k: {
    w: 0.9,
    pts: [[0, 0.2], ...ASCENDER, [0.1, 0], [0.2, 0.55], [0.42, 0.95], [0.6, 0.85], [0.5, 0.62], [0.25, 0.5], [0.45, 0.4], [0.6, 0.08], [0.72, 0], [0.9, 0.2]],
  },
  o: {
    w: 0.85,
    pts: [[0, 0.2], [0.12, 0.55], [0.3, 0.92], [0.5, 0.98], [0.62, 0.7], [0.55, 0.25], [0.38, 0.02], [0.2, 0.1], [0.2, 0.5], [0.4, 0.9], [0.6, 0.85], [0.85, 0.8]],
  },
  // b straight after o: joins from high up.
  B: {
    w: 0.8,
    pts: [[0, 0.8], [0.25, 1.2], [0.42, 1.6], [0.45, 1.95], [0.33, 2.15], [0.2, 1.95], [0.14, 1.3], [0.12, 0.6], [0.14, 0.1], [0.32, 0], [0.55, 0.2], [0.6, 0.6], [0.45, 0.8], [0.35, 0.62], [0.55, 0.55], [0.8, 0.6]],
  },
  a: {
    w: 0.9,
    pts: [[0, 0.6], [0.35, 0.85], [0.55, 0.95], [0.35, 1.0], [0.12, 0.8], [0.05, 0.4], [0.15, 0.05], [0.35, 0.05], [0.52, 0.4], [0.6, 0.95], [0.58, 0.4], [0.62, 0.08], [0.75, 0], [0.9, 0.2]],
  },
  g: {
    w: 0.8,
    pts: [[0, 0.2], [0.3, 0.75], [0.55, 0.95], [0.35, 1.0], [0.12, 0.8], [0.05, 0.4], [0.15, 0.05], [0.35, 0.05], [0.52, 0.4], [0.6, 0.95], [0.58, 0.3], [0.55, -0.4], [0.45, -0.85], [0.28, -1.0], [0.12, -0.85], [0.2, -0.5], [0.5, -0.25], [0.8, -0.1]],
  },
};

const SPELLING = ['e', 'b', 'r', 'u', 's', 'h', 'k', 'o', 'B', 'a', 'g'];

/**
 * The written name, from a lead-in stroke to the curl after the g, sampled
 * evenly along its length. `beats` are the sample indices where each letter
 * begins (and where the curl begins), so the hook can give every letter the
 * same time however long its stroke.
 */
function writtenPath(xHeight: number, samples: number) {
  const gap = 0.13;
  const width = SPELLING.reduce((sum, l) => sum + LETTERS[l].w + gap, 0);
  const x0 = -(width * xHeight) / 2;
  const pts: THREE.Vector3[] = [];
  const put = (x: number, y: number) => {
    const wx = x0 + x * xHeight;
    // A gentle wave in depth, so the name is a thing in space, not a decal.
    pts.push(new THREE.Vector3(wx, BASELINE + y * xHeight, 0.22 * Math.sin(wx * 0.9)));
  };
  put(-0.45, -0.1);
  put(-0.2, 0.05);
  const marks: THREE.Vector3[] = [];
  let cursor = 0;
  for (const l of SPELLING) {
    marks.push(new THREE.Vector3(x0 + (cursor + LETTERS[l].pts[0][0]) * xHeight, BASELINE + LETTERS[l].pts[0][1] * xHeight, 0));
    for (const [x, y] of LETTERS[l].pts) put(cursor + x, y);
    cursor += LETTERS[l].w + gap;
  }
  // A free curl after the g: the end of the yarn, loose.
  const end = pts[pts.length - 1];
  marks.push(end.clone());
  put(cursor + 0.2, -0.05);
  put(cursor + 0.5, 0.25);
  put(cursor + 0.42, 0.55);
  put(cursor + 0.25, 0.4);

  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  const points = curve.getSpacedPoints(samples - 1);

  // Nearest sample to each mark, searching forward so marks stay in order.
  const beats = [0];
  let from = 0;
  for (const mark of marks.slice(1)) {
    let best = from;
    let bestD = Infinity;
    for (let i = from; i < Math.min(points.length, from + samples / 4); i++) {
      const d = (points[i].x - mark.x) ** 2 + (points[i].y - mark.y) ** 2;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    beats.push(best);
    from = best + 1;
  }
  beats.push(points.length - 1);
  return { points, beats };
}

/** Parallel-transported frames and running length along a list of points. */
function frames(points: THREE.Vector3[], out: Float32Array) {
  const n = points.length;
  let normal = new THREE.Vector3(0, 0, 1);
  const t = new THREE.Vector3();
  const b = new THREE.Vector3();
  let length = 0;
  for (let i = 0; i < n; i++) {
    t.subVectors(points[Math.min(i + 1, n - 1)], points[Math.max(i - 1, 0)]).normalize();
    if (i === 0) normal.addScaledVector(t, -normal.dot(t)).normalize();
    else normal = normal.addScaledVector(t, -normal.dot(t)).normalize();
    b.crossVectors(t, normal).normalize();
    if (i > 0) length += points[i].distanceTo(points[i - 1]);
    const p = points[i];
    out.set([p.x, p.y, p.z, length], i * 4);
    out.set([normal.x, normal.y, normal.z, 0], (n + i) * 4);
    out.set([b.x, b.y, b.z, 0], (2 * n + i) * 4);
  }
  return length;
}

const TAU = Math.PI * 2;

const ROLL_AXIS = new THREE.Vector3(1, 0, 0.3).normalize();
const centre = new THREE.Vector3();
const roll = new THREE.Quaternion();
const target = new THREE.Vector3();
const from = new THREE.Vector3();
const spineTop = yarnLine(YARN_TOP);

const HOLD = new THREE.Vector3(0.35, 0.75, 0.6);
const REST_AXIS = new THREE.Vector3(0.05, 1, 0.45).normalize();
/** The spine's fork tips, from the top of the spine. */
const FORK_OFFSETS = forkTips().map((tip) => tip.sub(spineTop));
const endNormal = new THREE.Vector3();
const endBinormal = new THREE.Vector3();
const onBall = new THREE.Vector3();
const outward = new THREE.Vector3();
const wrap = new THREE.Vector3();
const tipAxis = new THREE.Vector3();
const tangent = new THREE.Vector3();
const axis = new THREE.Vector3();
const side = new THREE.Vector3();
const forward = new THREE.Vector3();
const awayDir = new THREE.Vector3();
const basis = new THREE.Matrix4();
const targetQuat = new THREE.Quaternion();

/** One mesh holding all six plies; the vertex shader puts them on the path. */
function cordGeometry(segments: number, radial: number) {
  const plies = 2 * PLY_COUNT;
  const perPly = (segments + 1) * (radial + 1);
  const count = plies * perPly;
  const aS = new Float32Array(count);
  const aTheta = new Float32Array(count);
  const aPly = new Float32Array(count);
  const uv = new Float32Array(count * 2);
  const index: number[] = [];
  let v = 0;
  for (let p = 0; p < plies; p++) {
    for (let i = 0; i <= segments; i++) {
      for (let j = 0; j <= radial; j++, v++) {
        aS[v] = i / segments;
        aTheta[v] = (j / radial) * TAU;
        aPly[v] = p;
        uv[v * 2] = (i / segments) * 260;
        uv[v * 2 + 1] = j / radial;
      }
    }
    const base = p * perPly;
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < radial; j++) {
        const a = base + i * (radial + 1) + j;
        const c = a + radial + 1;
        index.push(a, c, a + 1, c, c + 1, a + 1);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  // Positions come from the shader; this attribute only sizes the draw.
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setAttribute('aS', new THREE.BufferAttribute(aS, 1));
  g.setAttribute('aTheta', new THREE.BufferAttribute(aTheta, 1));
  g.setAttribute('aPly', new THREE.BufferAttribute(aPly, 1));
  g.setIndex(index);
  return g;
}

const VERTEX_DECLS = /* glsl */ `
  uniform sampler2D uPath;
  uniform float uCount;
  uniform float uReveal;
  uniform float uThickness;
  uniform float uTime;
  uniform float uIdle;
  uniform float uFork;
  uniform float uArcEnd;
  uniform float uLayFix;
  uniform vec3 uForkA;
  uniform vec3 uForkB;
  attribute float aS;
  attribute float aTheta;
  attribute float aPly;
  varying float vS;
  varying float vPly;

  vec4 pathRow(float row, float f) {
    float i0 = floor(f);
    float i1 = min(i0 + 1.0, uCount - 1.0);
    float v = (row + 0.5) / 3.0;
    vec4 a = texture2D(uPath, vec2((i0 + 0.5) / uCount, v));
    vec4 b = texture2D(uPath, vec2((i1 + 0.5) / uCount, v));
    return mix(a, b, f - i0);
  }
`;

const VERTEX_CORD = /* glsl */ `
  float f = aS * (uCount - 1.0);
  vec4 c = pathRow(0.0, f);
  vec3 N = normalize(pathRow(1.0, f).xyz);
  vec3 B = normalize(pathRow(2.0, f).xyz);
  float arc = c.w;
  // Once written, the cord is alive: a slow wave travels along it.
  c.xyz += vec3(0.0, sin(arc * 0.7 - uTime * 1.3) * 0.05, sin(arc * 0.9 - uTime * 1.6) * 0.16) * uIdle;
  float strand = floor(aPly / ${PLY_COUNT}.0);
  float ply = aPly - strand * ${PLY_COUNT}.0;
  // Towards the spine the lay stops turning and swings round so each strand
  // lines up with its own tip of the spine's fork; then the strands part to
  // those tips.
  float layStill = uFork * smoothstep(1.0 - ${(SPLIT * 2.4).toFixed(5)}, 1.0 - ${SPLIT.toFixed(5)}, aS);
  float sa = mix(arc, uArcEnd, layStill) * ${STRAND_TWIST.toFixed(4)} * 6.2831853 + strand * 3.1415927 + uLayFix * layStill;
  vec3 strandCentre = c.xyz + (N * cos(sa) + B * sin(sa)) * ${STRAND_OFFSET.toFixed(4)} * uThickness;
  float parted = uFork * smoothstep(1.0 - ${SPLIT.toFixed(5)}, 1.0, aS);
  strandCentre = mix(strandCentre, c.xyz + (strand < 0.5 ? uForkA : uForkB) * parted, parted);
  float pa = arc * ${PLY_TWIST.toFixed(4)} * 6.2831853 + ply * 2.0943951;
  vec3 plyCentre = strandCentre + (N * cos(pa) + B * sin(pa)) * ${PLY_OFFSET.toFixed(4)} * uThickness;
  vec3 radial = N * cos(aTheta) + B * sin(aTheta);
  // Tapered at the very start, and at the tip still being written — but not
  // where it joins the spine.
  float taper = smoothstep(0.0, 0.004, aS) * max(clamp((uReveal - aS) / 0.006, 0.0, 1.0), uFork);
  vec3 cordPosition = plyCentre + radial * ${PLY_RADIUS.toFixed(4)} * uThickness * taper;
  vS = aS;
  vPly = aPly;
  vec3 objectNormal = radial;
  #ifdef USE_TANGENT
    vec3 objectTangent = vec3( tangent.xyz );
  #endif
`;

const FRAGMENT_DECLS = /* glsl */ `
  uniform float uReveal;
  uniform float uColorMix;
  uniform vec3 uBrand[6];
  uniform vec3 uSpring[6];
  varying float vS;
  varying float vPly;
`;

const FRAGMENT_COLOUR = /* glsl */ `
  vec4 diffuseColor = vec4( diffuse, opacity );
  if (vS > uReveal) discard;
  int plyIndex = int(vPly + 0.5);
  // Spring's colours travel up the cord from the spine end like dye soaking
  // in — each stretch is one set of colours or the other, never a muddy mix.
  float dyed = smoothstep(1.0 - uColorMix * 1.12, 1.0 - uColorMix * 1.12 + 0.06, vS);
  diffuseColor.rgb = mix(uBrand[plyIndex], uSpring[plyIndex], dyed);
`;

/** Pink and periwinkle, the logo's two colours, as the two strands. */
const BRAND_PLIES = ['#FF68C4', '#FF8FD3', '#E9429F', '#88ADFE', '#A9C3FE', '#5F8BF5'];

// ── The crochet hook ───────────────────────────────────────────────────────

/**
 * A crochet hook, built along +y with its head at the origin and the throat
 * facing +x. A working loop of the same cord sits round the shaft just above
 * the throat, as it would in the hand; the cord being written runs out of
 * the throat.
 */
function Hook({ tipRef, poseRef }: { tipRef: React.RefObject<THREE.Group | null>; poseRef: React.RefObject<THREE.Group | null> }) {
  const hook = useMemo(() => {
    const head = new THREE.SphereGeometry(0.036, 14, 10).scale(1, 1.4, 1).translate(0, 0.02, 0);
    // The throat: a notch cut back into the shaft, drawn as a curled lip.
    const throat = new THREE.TorusGeometry(0.028, 0.011, 8, 16, Math.PI * 1.15).rotateZ(-Math.PI * 0.1).translate(0.018, 0.075, 0);
    const neck = new THREE.CylinderGeometry(0.03, 0.022, 0.16, 14).translate(0, 0.12, 0);
    const shaft = new THREE.CylinderGeometry(0.032, 0.03, 1.3, 16).translate(0, 0.85, 0);
    const thumb = new THREE.CylinderGeometry(0.05, 0.036, 0.24, 16).scale(1, 1, 0.5).translate(0, 1.55, 0);
    const handle = new THREE.CapsuleGeometry(0.078, 0.9, 6, 16).translate(0, 2.2, 0);
    const band = new THREE.TorusGeometry(0.081, 0.01, 8, 24).rotateX(Math.PI / 2).translate(0, 1.7, 0);
    // The working loop round the shaft, tipped as a loop hangs.
    const loop = new THREE.TorusGeometry(0.07, 0.024, 10, 28).rotateX(Math.PI / 2 - 0.35).translate(-0.01, 0.3, 0);
    return { head, throat, neck, shaft, thumb, handle, band, loop };
  }, []);

  useEffect(
    () => () => Object.values(hook).forEach((g) => g.dispose()),
    [hook],
  );

  return (
    <group ref={tipRef} visible={false}>
      <group ref={poseRef}>
        {[hook.head, hook.throat, hook.neck, hook.shaft, hook.thumb].map((g, i) => (
          <mesh key={i} geometry={g}>
            <meshStandardMaterial color="#DCC7A4" metalness={1} roughness={0.2} envMapIntensity={1.5} />
          </mesh>
        ))}
        <mesh geometry={hook.handle}>
          <meshPhysicalMaterial color="#F7B8D8" roughness={0.5} sheen={0.7} sheenColor="#FFE6F3" clearcoat={0.4} />
        </mesh>
        <mesh geometry={hook.band}>
          <meshStandardMaterial color="#D8B878" metalness={1} roughness={0.25} />
        </mesh>
        <mesh geometry={hook.loop}>
          <meshPhysicalMaterial color="#FF7FCB" roughness={0.8} sheen={1} sheenColor="#FFE6F4" />
        </mesh>
      </group>
    </group>
  );
}

// ── The word ───────────────────────────────────────────────────────────────

export function YarnWord({
  compact,
  reducedMotion,
  onWritten,
}: {
  compact: boolean;
  reducedMotion: boolean;
  onWritten: () => void;
}) {
  const samples = compact ? 520 : 760;
  const xHeight = compact ? 0.5 : 1.2;
  const { points: written, beats } = useMemo(() => writtenPath(xHeight, samples), [xHeight, samples]);

  const lengths = useMemo(() => {
    const out = [0];
    for (let i = 1; i < written.length; i++) out.push(out[i - 1] + written[i].distanceTo(written[i - 1]));
    return out;
  }, [written]);

  // The ball: where each stretch of cord lies once wound, in the ball's own
  // space. The cord goes round and round in a plane that slowly precesses,
  // so the wraps cross each other like a real ball, building from a small
  // core outwards.
  const ball = useMemo(() => {
    // Big enough for spine-thick cord, wound from a small core outwards.
    const radius = compact ? 0.75 : 1.05;
    const turns = compact ? 9 : 11;
    const tilt = new THREE.Vector3(0.35, 1, 0.55).normalize();
    const q = new THREE.Quaternion();
    const total = lengths[lengths.length - 1];
    const local = lengths.map((l) => {
      const t = Math.min(1, l / total / (1 - TUCKED_END));
      const a = t * turns * Math.PI * 2;
      q.setFromAxisAngle(tilt, t * Math.PI * 2.4);
      const u = new THREE.Vector3(1, 0, 0).applyQuaternion(q);
      const v = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
      const r = radius * (0.35 + 0.65 * Math.sqrt(t));
      return u.multiplyScalar(Math.cos(a) * r).addScaledVector(v, Math.sin(a) * r);
    });
    return {
      radius,
      local,
      // Where it forms: in front of the name. Where it comes to rest: over
      // the top of the spine, whose end then sits hidden inside the ball.
      start: new THREE.Vector3(0, BASELINE + 0.55 * xHeight, 0.4),
      rest: yarnLine(YARN_TOP + radius * 0.35),
    };
  }, [lengths, compact, xHeight]);

  const data = useMemo(() => new Float32Array(samples * 3 * 4), [samples]);
  const texture = useMemo(() => {
    const t = new THREE.DataTexture(data, samples, 3, THREE.RGBAFormat, THREE.FloatType);
    t.minFilter = t.magFilter = THREE.NearestFilter;
    t.needsUpdate = true;
    return t;
  }, [data, samples]);

  const geometry = useMemo(() => cordGeometry(compact ? 900 : 1500, compact ? 6 : 8), [compact]);

  const uniforms = useMemo(
    () => ({
      uPath: { value: texture },
      uCount: { value: samples },
      uReveal: { value: reducedMotion ? 1 : 0 },
      uThickness: { value: writtenThickness(compact) },
      uTime: { value: 0 },
      uIdle: { value: 0 },
      uColorMix: { value: 0 },
      uFork: { value: 0 },
      uArcEnd: { value: 0 },
      uLayFix: { value: 0 },
      uForkA: { value: FORK_OFFSETS[0].clone() },
      uForkB: { value: FORK_OFFSETS[1].clone() },
      uBrand: { value: BRAND_PLIES.map((c) => new THREE.Color(c)) },
      uSpring: { value: YARN_PRESETS.spring.strands.flat().map((c) => new THREE.Color(c)) },
    }),
    [texture, samples, reducedMotion, compact],
  );

  const material = useMemo(() => {
    const bump = fibreTexture();
    const m = new THREE.MeshPhysicalMaterial({
      roughness: 0.78,
      sheen: 1,
      sheenColor: new THREE.Color('#FFE6F4'),
      sheenRoughness: 0.55,
      bumpMap: bump,
      bumpScale: 2.4,
    });
    m.fog = false; // the name stays crisp against the sky
    m.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>\n${VERTEX_DECLS}`)
        .replace('#include <beginnormal_vertex>', VERTEX_CORD)
        .replace('#include <begin_vertex>', 'vec3 transformed = cordPosition;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>\n${FRAGMENT_DECLS}`)
        .replace('vec4 diffuseColor = vec4( diffuse, opacity );', FRAGMENT_COLOUR);
    };
    m.customProgramCacheKey = () => 'yarn-word-cord';
    return m;
  }, [uniforms]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.bumpMap?.dispose();
      material.dispose();
      texture.dispose();
    },
    [geometry, material, texture],
  );

  const hookRef = useRef<THREE.Group>(null);
  const poseRef = useRef<THREE.Group>(null);
  const writing = useRef({ started: -1, done: reducedMotion ? 1 : 0, lastIntro: -1, told: false, idle: 0, layFix: 0 });
  // Where the hook is working on the ball, eased so it glides from wrap to wrap.
  const onBallAt = useRef({ position: new THREE.Vector3(), axis: new THREE.Vector3(0, 1, 0), set: false });
  const group = useRef<THREE.Group>(null);
  const points = useMemo(() => written.map((p) => p.clone()), [written]);

  useFrame((state, dt) => {
    const w = writing.current;
    const m = reel.intro;

    // Writing: the hook lays the cord down at an even hand's pace, starting
    // once everything has loaded. A scroll before it finishes completes it.
    const loading = useProgress.getState();
    if (w.started < 0 && !loading.active && loading.progress === 100) w.started = state.clock.elapsedTime + 0.6;
    const elapsed = w.started < 0 ? 0 : state.clock.elapsedTime - w.started;
    // Every letter gets the same beat, however long its stroke; the closing
    // curl gets half a beat.
    const beatsTotal = beats.length - 2 + 0.5;
    const clock = THREE.MathUtils.clamp(elapsed / WRITE_SECONDS, 0, 1) * beatsTotal;
    const k = Math.min(beats.length - 2, Math.floor(clock));
    const within = k === beats.length - 2 ? Math.min(1, (clock - k) / 0.5) : clock - k;
    let reveal = reducedMotion ? 1 : (beats[k] + (beats[k + 1] - beats[k]) * within) / (written.length - 1);
    if (m > 0.02) w.done = Math.min(1, w.done + dt * 2);
    reveal = Math.max(reveal, w.done);
    uniforms.uReveal.value = reveal;

    // Written: tell the page (the cue to scroll appears), and let the name
    // come alive — a gentle float and sway, fading out once winding begins.
    if (reveal >= 1 && !w.told) {
      w.told = true;
      onWritten();
    }
    const alive = reveal >= 1 && !reducedMotion ? 1 - THREE.MathUtils.smoothstep(m, 0, 0.12) : 0;
    w.idle += (alive - w.idle) * (1 - Math.exp(-dt * 1.5));
    uniforms.uIdle.value = w.idle;
    uniforms.uTime.value = state.clock.elapsedTime;
    if (group.current) {
      const t = state.clock.elapsedTime;
      group.current.position.y = Math.sin(t * 0.8) * 0.14 * w.idle;
      group.current.rotation.y = Math.sin(t * 0.35) * 0.1 * w.idle;
      group.current.rotation.x = Math.sin(t * 0.5 + 1) * 0.04 * w.idle;
    }
    const wind = THREE.MathUtils.clamp(m / WIND_SHARE, 0, 1);
    const drop = THREE.MathUtils.smootherstep(m, WIND_SHARE - 0.04, 1);
    // The ball keeps the brand's pink and periwinkle while it winds; only as
    // it drops onto the spine do spring's colours climb up into it.
    uniforms.uColorMix.value = THREE.MathUtils.smoothstep(m, WIND_SHARE + 0.05, 1);
    // The cord thickens to the spine's as it is wound, so the ball is made of
    // the very yarn that comes out of it.
    uniforms.uThickness.value = THREE.MathUtils.lerp(writtenThickness(compact), 1, THREE.MathUtils.smoothstep(m, 0.15, WIND_SHARE));

    if (Math.abs(m - w.lastIntro) > 1e-4) {
      w.lastIntro = m;
      const total = lengths[lengths.length - 1];
      // The ball rolls as it comes down to the spine.
      centre.lerpVectors(ball.start, ball.rest, drop);
      roll.setFromAxisAngle(ROLL_AXIS, drop * Math.PI * 2.2);

      for (let i = 0; i < points.length; i++) {
        const s = lengths[i] / total;
        // Wound from the e onwards: each stretch is drawn in, in turn.
        const u = THREE.MathUtils.smootherstep(wind, s * 0.55, s * 0.55 + 0.45);
        if (s <= 1 - TUCKED_END) {
          target.copy(ball.local[i]).applyQuaternion(roll).add(centre);
        } else {
          // From the underside of the ball, hanging a little slack, to the
          // top of the spine.
          const f = (s - (1 - TUCKED_END)) / TUCKED_END;
          from.copy(centre).y -= ball.radius * 0.85;
          target.lerpVectors(from, spineTop, f);
          target.x += Math.sin(f * Math.PI) * 0.25 * (1 - drop);
        }
        points[i].lerpVectors(written[i], target, u);
        // A little slack as each stretch is pulled free of the letters.
        points[i].z += Math.sin(u * Math.PI) * 0.3;
      }
      frames(points, data);
      texture.needsUpdate = true;

      // Once the cord has reached the spine, its strands swing round to meet
      // the fork: the turn that brings strand 0 onto the first tip, taken
      // the short way from last frame's (so it never jumps a whole turn).
      uniforms.uFork.value = THREE.MathUtils.smoothstep(wind, 0.6, 1);
      const n = samples;
      const last = n - 1;
      const arcEnd = data[last * 4 + 3];
      endNormal.fromArray(data, (n + last) * 4);
      endBinormal.fromArray(data, (2 * n + last) * 4);
      const want = Math.atan2(FORK_OFFSETS[0].dot(endBinormal), FORK_OFFSETS[0].dot(endNormal));
      let fix = want - arcEnd * STRAND_TWIST * TAU;
      fix = w.layFix + THREE.MathUtils.euclideanModulo(fix - w.layFix + Math.PI, TAU) - Math.PI;
      w.layFix = fix;
      uniforms.uArcEnd.value = arcEnd;
      uniforms.uLayFix.value = fix;
    }

    // The hook works at the tip of the cord: held like a pen, trailing the
    // direction of writing, its throat facing the way the cord comes from.
    // Each stitch of cord laid, it dips in and turns — a yarn-over. When the
    // name is done it rests there at the end of the curl, as if to go on.
    // Winding, it moves onto the ball and works round it, at the wrap being
    // drawn in; as the ball drops onto the spine it lifts away.
    const hook = hookRef.current;
    const pose = poseRef.current;
    if (hook && pose) {
      const gather = THREE.MathUtils.smoothstep(m, 0.004, 0.07);
      const leave = THREE.MathUtils.smoothstep(m, WIND_SHARE - 0.04, WIND_SHARE + 0.14);
      hook.visible = !reducedMotion && reveal > 0 && leave < 1;
      if (hook.visible) {
        const n = points.length - 1;
        const t = state.clock.elapsedTime;

        // At the tip of the cord (riding the name's slow wave once written).
        const i = Math.min(n, Math.floor(reveal * n));
        tangent.subVectors(points[Math.min(n, i + 2)], points[Math.max(0, i - 2)]).normalize();
        target.copy(points[i]);
        target.y += Math.sin(lengths[i] * 0.7 - t * 1.3) * 0.05 * w.idle;
        target.z += Math.sin(lengths[i] * 0.9 - t * 1.6) * 0.16 * w.idle;
        // Up the handle: back along the writing, up, and out towards the viewer.
        tipAxis.copy(tangent).multiplyScalar(-0.5).add(HOLD).normalize();
        // Resting, it stands more upright, clear of the edge of the screen.
        if (reveal >= 1) tipAxis.lerp(REST_AXIS, 0.6).normalize();
        const stitch = (lengths[i] / STITCH) % 1;
        const writingNow = reveal < 1 ? 1 : 0;

        // On the ball, over the wrap arriving now — kept to the side facing
        // the viewer, where the work can be seen — the handle pointing up
        // and out of it, as held.
        const s = THREE.MathUtils.clamp((wind - 0.3) / 0.55, 0, 1 - TUCKED_END);
        const j = Math.min(n - 1, Math.max(1, Math.round(s * n)));
        outward.copy(ball.local[j]).applyQuaternion(roll);
        const reach = outward.length();
        outward.normalize();
        outward.z = 0.45 + 0.55 * Math.abs(outward.z);
        outward.normalize();
        onBall.copy(centre).addScaledVector(outward, reach + 0.04);
        wrap.subVectors(ball.local[j + 1], ball.local[j - 1]).applyQuaternion(roll).normalize();
        const at = onBallAt.current;
        const ease = at.set ? 1 - Math.exp(-dt * 9) : 1;
        at.set = true;
        at.position.lerp(onBall, ease);
        at.axis.lerp(outward.multiplyScalar(0.6).add(HOLD).normalize(), ease).normalize();

        hook.position.lerpVectors(target, at.position, gather);
        axis.lerpVectors(tipAxis, at.axis, gather).normalize();
        tangent.lerp(wrap, gather).normalize();
        side.copy(tangent).multiplyScalar(-1).addScaledVector(axis, tangent.dot(axis)).normalize();
        forward.crossVectors(side, axis);
        basis.makeBasis(side, axis, forward);
        targetQuat.setFromRotationMatrix(basis);
        hook.quaternion.slerp(targetQuat, 1 - Math.exp(-dt * 8));

        // Dipping in: once per stitch while writing, once per tuck while winding.
        const tuck = (wind * 34) % 1;
        const dip = THREE.MathUtils.lerp(Math.sin(stitch * TAU) * writingNow, Math.sin(tuck * TAU), gather);
        hook.position.addScaledVector(axis, 0.02 - 0.05 * Math.max(0, dip));
        hook.position.add(awayDir.set(1.6, 1.3, 1).multiplyScalar(leave * leave * 2));
        hook.scale.setScalar((compact ? 1 : 1.35) * (1 - leave * leave));
        // The yarn-over: a quick turn of the hook about its own length; at
        // rest, a small idle turn, as a hand holds it.
        const writingTurn = writingNow ? Math.sin(stitch * TAU) * 0.55 : Math.sin(t * 1.1) * 0.14;
        pose.rotation.y = THREE.MathUtils.lerp(writingTurn, Math.sin(tuck * TAU) * 0.55, gather);
      }
    }
  });

  return (
    <>
      <group ref={group}>
        <mesh geometry={geometry} material={material} frustumCulled={false} />
        {/* In the same group, so it floats with the name it rests on. */}
        <Hook tipRef={hookRef} poseRef={poseRef} />
      </group>
    </>
  );
}
