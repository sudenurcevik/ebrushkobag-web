import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { SeasonId } from '@/data/types';
import { fibreTexture } from './Yarn';

/**
 * What each season's halo is made of — all of it yarn, in the same
 * two-strand twisted cord as the spine, so the halo belongs to the same
 * world as the thread it circles. The small extras are what the bags are
 * really made with: pompoms, beads, sequins.
 *
 * - spring: crochet flowers (cord petals round a coiled centre), pompoms,
 *   little balls of yarn and bright beads — every colour of the brand
 * - summer: coiled-cord suns with looped rays, turquoise and coral beads,
 *   pompoms
 * - autumn: yarn leaves (a cord outline and midrib), balls of yarn, pompoms
 *   and wooden beads
 * - winter: yarn snowflakes, pompoms and sequins
 *
 * Every piece is roughly unit-sized, centred on the origin, facing +z.
 */

const white = new THREE.Color('#FFFFFF');
/** The second strand of a cord, a shade darker, so the twist reads in any colour. */
const shade = new THREE.Color('#C9C9C9');

function paint(g: THREE.BufferGeometry, color: THREE.Color) {
  const count = g.attributes.position.count;
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) colors.set([color.r, color.g, color.b], i * 3);
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return g;
}

/** Keeps only the attributes mergeGeometries needs to agree on. */
function clean(g: THREE.BufferGeometry) {
  const out = g.index ? g.toNonIndexed() : g;
  for (const name of Object.keys(out.attributes)) {
    if (!['position', 'normal', 'uv', 'color'].includes(name)) out.deleteAttribute(name);
  }
  return out;
}

function merge(parts: THREE.BufferGeometry[]) {
  const g = mergeGeometries(parts.map(clean))!;
  g.computeVertexNormals();
  return g;
}

/**
 * A two-strand cord along `curve`: two tubes wound round each other, the
 * second a shade darker — the spine's yarn in miniature.
 */
function cord(curve: THREE.Curve<THREE.Vector3>, radius: number, closed = false, segments = 40) {
  const frames = curve.computeFrenetFrames(segments, closed);
  const turns = curve.getLength() / (radius * 7);
  const strands: THREE.Vector3[][] = [[], []];
  // A closed cord must not repeat its first point at the end.
  const count = closed ? segments : segments + 1;
  for (let i = 0; i < count; i++) {
    const t = i / segments;
    const p = curve.getPointAt(t);
    const k = i;
    for (let s = 0; s < 2; s++) {
      const a = t * turns * Math.PI * 2 + s * Math.PI;
      strands[s].push(
        p
          .clone()
          .addScaledVector(frames.normals[k], Math.cos(a) * radius * 0.48)
          .addScaledVector(frames.binormals[k], Math.sin(a) * radius * 0.48),
      );
    }
  }
  return strands.map((pts, s) => {
    const tube = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, closed), segments, radius * 0.6, 5, closed);
    return paint(tube, s === 0 ? white : shade);
  });
}

const v3 = (x: number, y: number, z = 0) => new THREE.Vector3(x, y, z);
const path = (pts: THREE.Vector3[], closed = false) => new THREE.CatmullRomCurve3(pts, closed, 'centripetal');

/** A flat coil of cord, as for a crochet centre or a coiled sun. */
function coil(maxRadius: number, turns: number, radius: number) {
  const pts: THREE.Vector3[] = [];
  const n = Math.round(turns * 16);
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = t * turns * Math.PI * 2;
    const r = 0.02 + t * maxRadius;
    pts.push(v3(Math.cos(a) * r, Math.sin(a) * r, 0.02 * Math.sin(t * Math.PI)));
  }
  return cord(path(pts), radius, false, Math.round(turns * 28));
}

// ── Pieces ─────────────────────────────────────────────────────────────────

/** Crochet flower: looped cord petals, cupped; its centre is a separate piece. */
function crochetPetals(count: number) {
  const parts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const loop = path(
      [v3(0.1, 0.12), v3(0.22, 0.3, 0.05), v3(0.08, 0.5, 0.1), v3(-0.08, 0.5, 0.1), v3(-0.22, 0.3, 0.05), v3(-0.1, 0.12)].map(
        (p) => p.applyAxisAngle(new THREE.Vector3(0, 0, 1), a),
      ),
      true,
    );
    parts.push(...cord(loop, 0.05, true, 36));
  }
  return merge(parts);
}

function crochetCentre() {
  return merge(coil(0.14, 2.6, 0.045));
}

function yarnSun() {
  const parts = coil(0.3, 3.4, 0.05);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const ray = path(
      [v3(0.34, -0.05), v3(0.48, -0.035), v3(0.56, 0), v3(0.48, 0.035), v3(0.34, 0.05)].map((p) =>
        p.applyAxisAngle(new THREE.Vector3(0, 0, 1), a),
      ),
    );
    parts.push(...cord(ray, 0.035, false, 16));
  }
  return merge(parts);
}

function yarnLeaf() {
  const outline = path(
    [v3(0, -0.55), v3(0.3, -0.25, 0.05), v3(0.28, 0.2, 0.08), v3(0, 0.58), v3(-0.28, 0.2, 0.08), v3(-0.3, -0.25, 0.05)],
    true,
  );
  const rib = path([v3(0, -0.72), v3(0, -0.2, 0.06), v3(0, 0.45, 0.04)]);
  const veins = [-1, 1].flatMap((side) =>
    [-0.15, 0.1].map((y) => path([v3(0, y, 0.06), v3(side * 0.12, y + 0.1, 0.07), v3(side * 0.2, y + 0.18, 0.06)])),
  );
  return merge([
    ...cord(outline, 0.05, true, 48),
    ...cord(rib, 0.04, false, 24),
    ...veins.flatMap((v) => cord(v, 0.028, false, 10)),
  ]);
}

function yarnSnowflake() {
  const parts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const turn = (p: THREE.Vector3) => p.applyAxisAngle(new THREE.Vector3(0, 0, 1), a);
    parts.push(...cord(path([v3(0, 0.04), v3(0, 0.3, 0.02), v3(0, 0.55)].map(turn)), 0.04, false, 16));
    for (const [d, l] of [[0.26, 0.14], [0.42, 0.1]] as const) {
      parts.push(...cord(path([v3(-l, d + l), v3(0, d, 0.02), v3(l, d + l)].map(turn)), 0.03, false, 12));
    }
  }
  return merge(parts);
}

function pompom() {
  // A round core with a fine tufted surface — many small bumps, not lumps —
  // and the fibre bump of the yarn material doing the rest.
  const g = new THREE.SphereGeometry(0.5, 48, 36);
  const pos = g.attributes.position;
  const p = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i);
    const n = Math.sin(p.x * 97.3 + p.y * 41.1) * Math.sin(p.y * 83.7 + p.z * 57.9) * Math.sin(p.z * 71.3 + p.x * 33.7);
    p.multiplyScalar(0.97 + 0.045 * n);
    pos.setXYZ(i, p.x, p.y, p.z);
  }
  return merge([paint(g, white)]);
}

function miniBall() {
  const parts: THREE.BufferGeometry[] = [paint(new THREE.SphereGeometry(0.4, 18, 14), shade.clone().lerp(white, 0.5))];
  const tilt = [0.2, 0.9, 1.5, 2.3, 2.8];
  tilt.forEach((t, i) => {
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k < 24; k++) {
      const a = (k / 24) * Math.PI * 2;
      pts.push(v3(Math.cos(a) * 0.42, Math.sin(a) * 0.42, 0).applyAxisAngle(new THREE.Vector3(Math.cos(t), Math.sin(t), 0.4).normalize(), 1.2 + i));
    }
    parts.push(...cord(path(pts, true), 0.055, true, 40));
  });
  return merge(parts);
}

function bead() {
  return merge([paint(new THREE.SphereGeometry(0.5, 16, 12), white)]);
}

function sequin() {
  return merge([paint(new THREE.CylinderGeometry(0.5, 0.5, 0.07, 22).rotateX(Math.PI / 2), white)]);
}

// ── Kits ───────────────────────────────────────────────────────────────────

export interface GarlandExtra {
  /** Drawn with the same placement as its part, in a colour of its own. */
  geometry: THREE.BufferGeometry;
  color: string;
  material: THREE.MeshPhysicalMaterialParameters;
}

export interface GarlandPart {
  geometry: THREE.BufferGeometry;
  /** hero: the cluster's centrepiece · accent: around it · bead: loose */
  role: 'hero' | 'accent' | 'bead';
  colors: string[];
  size: [number, number];
  material: THREE.MeshPhysicalMaterialParameters;
  extras?: GarlandExtra[];
}

export interface GarlandKit {
  parts: GarlandPart[];
  /** Pieces turn every which way, like falling leaves, rather than facing out. */
  tumble?: boolean;
}

/** Soft spun yarn: matt, with a fabric sheen and a fibre bump. */
function yarnMaterial(): THREE.MeshPhysicalMaterialParameters {
  const bump = fibreTexture();
  bump.repeat.set(10, 2);
  return { roughness: 0.82, sheen: 1, sheenColor: new THREE.Color('#FFFFFF'), sheenRoughness: 0.5, bumpMap: bump, bumpScale: 1.6, side: THREE.DoubleSide };
}

const fluffy: THREE.MeshPhysicalMaterialParameters = { roughness: 1, sheen: 1, sheenColor: new THREE.Color('#FFFFFF'), sheenRoughness: 0.35 };
// Glossy without a clearcoat: each extra shader variant costs a long compile.
const glossy: THREE.MeshPhysicalMaterialParameters = { roughness: 0.14 };

const pompomPart = (colors: string[]): GarlandPart => ({
  geometry: pompom(),
  role: 'accent',
  colors,
  size: [0.13, 0.19],
  material: { ...fluffy, bumpMap: fibreTexture(), bumpScale: 3 },
});
const ballPart = (colors: string[]): GarlandPart => ({ geometry: miniBall(), role: 'accent', colors, size: [0.13, 0.17], material: yarnMaterial() });
const beadPart = (colors: string[], material = glossy): GarlandPart => ({ geometry: bead(), role: 'bead', colors, size: [0.05, 0.08], material });

export function garlandKit(season: SeasonId): GarlandKit {
  switch (season) {
    case 'spring':
      return {
        parts: [
          {
            geometry: crochetPetals(5),
            role: 'hero',
            colors: ['#FF68C4', '#FFD84D', '#88ADFE', '#A0DB6B', '#FF8A5C', '#E9429F'],
            size: [0.3, 0.42],
            material: yarnMaterial(),
            extras: [{ geometry: crochetCentre(), color: '#FFE36B', material: yarnMaterial() }],
          },
          pompomPart(['#A0DB6B', '#FF68C4', '#FFD84D', '#88ADFE']),
          ballPart(['#FF8FD3', '#A9C3FE', '#B5E08E']),
          beadPart(['#FF68C4', '#FFD84D', '#5FD3D0', '#88ADFE', '#FF8A5C']),
        ],
      };
    case 'summer':
      return {
        parts: [
          {
            geometry: yarnSun(),
            role: 'hero',
            colors: ['#FFCF2E', '#FFB020', '#FFD84D'],
            size: [0.32, 0.42],
            material: yarnMaterial(),
          },
          pompomPart(['#2FC4D6', '#FF8A5C', '#FFD84D']),
          ballPart(['#E8CD96', '#7FD8E6']),
          beadPart(['#2FC4D6', '#FF8A5C', '#FFFFFF', '#5FD3D0', '#FFB020']),
        ],
      };
    case 'autumn':
      return {
        tumble: true,
        parts: [
          {
            geometry: yarnLeaf(),
            role: 'hero',
            colors: ['#D2692A', '#E8A33D', '#B8472A', '#8E6B2E', '#9C4A6E'],
            size: [0.28, 0.4],
            material: yarnMaterial(),
          },
          pompomPart(['#E8A33D', '#B8472A', '#9C4A6E']),
          ballPart(['#6B4029', '#B8672F', '#D08A4A']),
          beadPart(['#8A5A36', '#B8743F', '#5B3524'], { roughness: 0.35 }),
        ],
      };
    case 'winter':
      return {
        parts: [
          {
            geometry: yarnSnowflake(),
            role: 'hero',
            colors: ['#FFFFFF', '#CFE0FF', '#88ADFE', '#CBB8F5'],
            size: [0.32, 0.44],
            material: { ...yarnMaterial(), emissive: new THREE.Color('#E8EEFF'), emissiveIntensity: 0.15 },
          },
          pompomPart(['#FFFFFF', '#CFE0FF', '#5F8BF5']),
          {
            geometry: sequin(),
            role: 'bead',
            colors: ['#E6E9F0', '#AEB6C6', '#2A2D3A'],
            size: [0.07, 0.1],
            material: { metalness: 0.9, roughness: 0.2, envMapIntensity: 1.8 },
          },
          beadPart(['#FFFFFF', '#DDE6FA']),
        ],
      };
  }
}
