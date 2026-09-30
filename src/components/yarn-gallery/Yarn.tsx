'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { SeasonId } from '@/data/types';
import {
  YARN_BOTTOM,
  YARN_PRESETS,
  YARN_SEASONS,
  YARN_TOP,
  seasonTop,
  spine,
} from '@/data/yarn-gallery';

/**
 * The yarn: a two-strand cord (see STRAND_OFFSET below), short fibres
 * standing off its surface and — in winter — a scatter of sequins. It hangs the way real yarn
 * does rather than as a rod: it wanders and kinks around the gentle S the
 * camera follows, springs into a coil once a season and throws a slack loop
 * once a season. Where one season hands over to the next it ties a knot-like
 * loop, which both tells the story and hides the change of fibre.
 *
 * Built once from a dense list of samples: the path, parallel-transported
 * frames along it (so the twist never flips), and index ranges per season.
 */

/**
 * A cord, built the way real ones are: two strands laid round each other in
 * a long twist, each strand three plies spun the opposite way, so the two
 * twists lock and the surface reads as knitted rather than as one rope.
 */
export const STRAND_OFFSET = 0.13;
/** Strand turns (the lay) per scene unit of yarn. */
export const STRAND_TWIST = 0.42;
export const PLY_COUNT = 3;
export const PLY_OFFSET = 0.056;
export const PLY_RADIUS = 0.072;
const STRAND_RADIUS = PLY_OFFSET + PLY_RADIUS;
/** Ply turns per scene unit, against the lay. */
export const PLY_TWIST = -1.6;
const STEP = 0.1;

/**
 * The top of the spine forks: over its last FORK_LENGTH the two strands
 * stop laying round each other and part, like an unplied end, reaching up
 * into the ball of yarn. The cord from the ball splits the same way where it
 * comes down to meet them (see YarnWord), so the ball and the spine join
 * strand to strand — an opening in the yarn, not a seam.
 */
const FORK_LENGTH = 2.2;
const FORK_SPLAY = 0.34;
/** How far open the fork is `arc` down from the top: 1 at the top, 0 below the fork. */
const forkOpen = (arc: number) => (1 - THREE.MathUtils.smoothstep(arc, 0, FORK_LENGTH)) ** 2;
/**
 * Length along which the lay turns: slowing to a stop towards the top, so
 * the parting strands fan straight out rather than spiralling. Continuous
 * in value and rate with the plain lay below the fork.
 */
const layArc = (arc: number) => (arc >= FORK_LENGTH ? arc : FORK_LENGTH / 2 + (arc * arc) / (2 * FORK_LENGTH));

/** Where the spine's two strands end, at the top of the fork (strand 0, then strand 1). */
export function forkTips(): [THREE.Vector3, THREE.Vector3] {
  // The yarn's first frame, as framesAlong makes it.
  const top = yarnLine(YARN_TOP);
  const t = yarnLine(YARN_TOP - STEP).sub(top).normalize();
  const n = new THREE.Vector3(1, 0, 0).addScaledVector(t, -t.x).normalize();
  const b = new THREE.Vector3().crossVectors(t, n).normalize();
  const offset = STRAND_OFFSET + FORK_SPLAY;
  const lay = layArc(0) * STRAND_TWIST * Math.PI * 2;
  return [0, Math.PI].map((phase) =>
    top
      .clone()
      .addScaledVector(n, Math.cos(lay + phase) * offset)
      .addScaledVector(b, Math.sin(lay + phase) * offset),
  ) as [THREE.Vector3, THREE.Vector3];
}

/**
 * Where the yarn itself lies: the camera's S plus a slow wander and a
 * faster, smaller kink, so it never runs quite straight.
 */
export function yarnLine(y: number) {
  const [x, , z] = spine(y);
  return new THREE.Vector3(
    x + 0.42 * Math.sin(y * 0.53 + 0.7) + 0.16 * Math.sin(y * 1.7 + 0.4),
    y,
    z + 0.38 * Math.cos(y * 0.41) + 0.14 * Math.sin(y * 1.3 + 2),
  );
}

type Flourish = {
  y: number;
  /** knot: season change · coil: a sprung curl · loop: a slack side loop */
  kind: 'knot' | 'coil' | 'loop';
  turn: number;
};

/** Every flourish, top to bottom. Each season gets one coil and one loop. */
function flourishes(): Flourish[] {
  const list: Flourish[] = [];
  YARN_SEASONS.forEach((_, s) => {
    const top = seasonTop(s);
    if (s > 0) list.push({ y: top, kind: 'knot', turn: 0.45 });
    list.push({ y: top - (s % 2 ? 6.8 : 3.4), kind: 'coil', turn: s * 0.9 });
    list.push({ y: top - (s % 2 ? 3.2 : 7.4), kind: 'loop', turn: s % 2 ? -1.1 : 1.2 });
  });
  return list.sort((a, b) => b.y - a.y);
}

/**
 * Offsets from the yarn line for one flourish, as `along` runs 0 → 1, plus
 * how far the line drops over it. Coils and loops fade in and out of zero so
 * the yarn enters and leaves them smoothly.
 */
function flourish(kind: Flourish['kind'], along: number, turn: THREE.Matrix4) {
  const ease = Math.sin(Math.PI * along) ** 0.6;
  switch (kind) {
    case 'knot': {
      // A full circle facing the camera, bulging towards it so the yarn
      // never passes through itself.
      const a = along * Math.PI * 2;
      const r = 0.6;
      return new THREE.Vector3(r * Math.sin(a), r * (Math.cos(a) - 1), 0.62 * Math.sin(a / 2)).applyMatrix4(turn);
    }
    case 'coil': {
      // Three turns of a spring around the line, like a relaxed pigtail.
      const a = along * Math.PI * 6;
      const r = 0.36 * ease;
      return new THREE.Vector3(r * Math.cos(a) - r, 0, r * Math.sin(a)).applyMatrix4(turn);
    }
    case 'loop': {
      // One lazy loop swinging out to the side and back.
      const a = along * Math.PI * 2;
      const r = 0.46;
      return new THREE.Vector3(r * Math.sin(a) * 1.3, r * (Math.cos(a) - 1) * 0.8, 0.55 * Math.sin(a / 2)).applyMatrix4(turn);
    }
  }
}

// Coil pitch (drop / 3 turns) stays wider than the yarn so turns never touch.
const FLOURISH_DROP: Record<Flourish['kind'], number> = { knot: 0.65, coil: 1.9, loop: 0.75 };
const FLOURISH_SAMPLES: Record<Flourish['kind'], number> = { knot: 46, coil: 150, loop: 52 };

interface Path {
  points: THREE.Vector3[];
  tangents: THREE.Vector3[];
  normals: THREE.Vector3[];
  binormals: THREE.Vector3[];
  lengths: number[];
  /** Index range of each season's stretch, overlapping by one sample. */
  ranges: [number, number][];
}

function buildPath(): Path {
  const points: THREE.Vector3[] = [];
  const cuts: number[] = [];
  const list = flourishes();

  let y = YARN_TOP;
  let next = 0;
  while (y > YARN_BOTTOM) {
    points.push(yarnLine(y));
    const f = list[next];
    if (f && y - STEP <= f.y) {
      const turn = new THREE.Matrix4().makeRotationY(f.turn);
      const drop = FLOURISH_DROP[f.kind];
      const samples = FLOURISH_SAMPLES[f.kind];
      for (let k = 1; k <= samples; k++) {
        const along = k / samples;
        points.push(yarnLine(f.y - drop * along).add(flourish(f.kind, along, turn)));
        // The season changes halfway round a knot.
        if (f.kind === 'knot' && k === samples / 2) cuts.push(points.length - 1);
      }
      y = f.y - drop;
      next++;
    } else {
      y -= STEP;
    }
  }

  const bounds = [0, ...cuts, points.length - 1];
  const ranges = YARN_SEASONS.map((_, i) => [bounds[i], bounds[i + 1]] as [number, number]);
  return { ...framesAlong(points), ranges };
}

/** Parallel-transported frames and running length along a list of points. */
function framesAlong(points: THREE.Vector3[]): Omit<Path, 'ranges'> {
  const n = points.length;
  const tangents = points.map((_, i) =>
    new THREE.Vector3().subVectors(points[Math.min(i + 1, n - 1)], points[Math.max(i - 1, 0)]).normalize(),
  );
  const normals: THREE.Vector3[] = [];
  const binormals: THREE.Vector3[] = [];
  let normal = new THREE.Vector3(1, 0, 0);
  normal.addScaledVector(tangents[0], -normal.dot(tangents[0])).normalize();
  for (let i = 0; i < n; i++) {
    const t = tangents[i];
    normal = normal.clone().addScaledVector(t, -normal.dot(t)).normalize();
    normals.push(normal);
    binormals.push(new THREE.Vector3().crossVectors(t, normal).normalize());
  }
  const lengths = [0];
  for (let i = 1; i < n; i++) lengths.push(lengths[i - 1] + points[i].distanceTo(points[i - 1]));
  return { points, tangents, normals, binormals, lengths };
}

/** Points wound round `path` at `offset`, `twist` turns per unit, from `phase`. */
function wind(path: Omit<Path, 'ranges'>, offset: number, twist: number, phase: number, from = 0, to = path.points.length - 1) {
  const out: THREE.Vector3[] = [];
  for (let i = from; i <= to; i++) {
    const angle = path.lengths[i] * twist * Math.PI * 2 + phase;
    out.push(
      path.points[i]
        .clone()
        .addScaledVector(path.normals[i], Math.cos(angle) * offset)
        .addScaledVector(path.binormals[i], Math.sin(angle) * offset),
    );
  }
  return out;
}

/** One strand's centre line: the lay round the yarn's path, parting at the fork. */
function windStrand(path: Omit<Path, 'ranges'>, phase: number) {
  return path.points.map((point, i) => {
    const arc = path.lengths[i];
    const angle = layArc(arc) * STRAND_TWIST * Math.PI * 2 + phase;
    const offset = STRAND_OFFSET + FORK_SPLAY * forkOpen(arc);
    return point
      .clone()
      .addScaledVector(path.normals[i], Math.cos(angle) * offset)
      .addScaledVector(path.binormals[i], Math.sin(angle) * offset);
  });
}

/** Diagonal fibre lines, used as a bump map so each ply reads as spun fibre. */
export function fibreTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 128, 128);
  for (let i = -128; i < 256; i += 5) {
    const shade = 90 + Math.floor(Math.random() * 110);
    ctx.strokeStyle = `rgb(${shade},${shade},${shade})`;
    ctx.lineWidth = 1 + Math.random() * 2;
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 70, 128);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Length of ply over which one season's colours run into the next's —
 * reaching well beyond the knot on both sides (a ply is about twice as long
 * as the yarn it winds round).
 */
const DYE_RUN = 7;

/**
 * Colours a ply by vertex: its own season's colour, running into the
 * neighbouring season's near each end — space-dyed, with a flicker of both
 * colours through the run — so the change of season has no cut. At the cut
 * itself both sides meet at the same half-and-half colour.
 */
function dyeAcrossSeasons(
  geometry: THREE.TubeGeometry,
  season: number,
  ply: number,
  length: number,
  segments: number,
  radial: number,
) {
  const colourOf = (s: number) => new THREE.Color(YARN_PRESETS[YARN_SEASONS[s]].strands.flat()[ply]);
  const own = colourOf(season);
  const before = season > 0 ? colourOf(season - 1) : own;
  const after = season < YARN_SEASONS.length - 1 ? colourOf(season + 1) : own;
  const colors = new Float32Array(geometry.attributes.position.count * 3);
  const c = new THREE.Color();
  // The flicker fades out at both ends of the run: at the cut the two sides
  // must meet exactly.
  const bell = (x: number) => 4 * x * (1 - x);
  for (let i = 0; i <= segments; i++) {
    const arc = (i / segments) * length;
    const fromEnd = length - arc;
    // Space-dyed: the blend flickers a little along the run.
    const flicker = 0.18 * Math.sin(arc * 7.3) * Math.sin(arc * 2.1 + ply);
    c.copy(own);
    if (arc < DYE_RUN && season > 0) {
      const t = THREE.MathUtils.clamp(0.5 + 0.5 * THREE.MathUtils.smoothstep(arc, 0, DYE_RUN) + flicker * bell(arc / DYE_RUN), 0, 1);
      c.copy(before).lerp(own, t);
    } else if (fromEnd < DYE_RUN && season < YARN_SEASONS.length - 1) {
      const t = THREE.MathUtils.clamp(0.5 + 0.5 * THREE.MathUtils.smoothstep(fromEnd, 0, DYE_RUN) + flicker * bell(fromEnd / DYE_RUN), 0, 1);
      c.copy(after).lerp(own, t);
    }
    for (let j = 0; j <= radial; j++) colors.set([c.r, c.g, c.b], (i * (radial + 1) + j) * 3);
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
}

/** Deterministic random so the fibres don't reshuffle between renders. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function Yarn({ compact, reducedMotion }: { compact: boolean; reducedMotion: boolean }) {
  const path = useMemo(buildPath, []);
  const fibre = useMemo(fibreTexture, []);
  const fuzzRef = useRef<THREE.InstancedMesh>(null);
  // A fibre is a thin tapered stalk with its base at the origin, scaled to length.
  const fibreGeometry = useMemo(() => new THREE.CylinderGeometry(0.0028, 0.0012, 1, 3, 1).translate(0, 0.5, 0), []);
  const sequinRef = useRef<THREE.InstancedMesh>(null);

  // The two strands' centre lines, wound round the yarn's path for its whole
  // length (so the lay runs unbroken through the seasons), with their own frames.
  const strands = useMemo(
    () => [0, Math.PI].map((phase) => framesAlong(windStrand(path, phase))),
    [path],
  );

  // ── Plies: per season, per strand, per ply ──────────────────────────────
  const plies = useMemo(() => {
    const out: { key: string; season: SeasonId; geometry: THREE.TubeGeometry }[] = [];
    YARN_SEASONS.forEach((season, s) => {
      const [a, b] = path.ranges[s];
      strands.forEach((strand, st) => {
        for (let k = 0; k < PLY_COUNT; k++) {
          const pts = wind(strand, PLY_OFFSET, PLY_TWIST, (k / PLY_COUNT) * Math.PI * 2, a, b);
          const curve = new THREE.CatmullRomCurve3(pts);
          const segments = Math.round((b - a) * (compact ? 2.2 : 3.2));
          const radial = compact ? 6 : 7;
          const geometry = new THREE.TubeGeometry(curve, segments, PLY_RADIUS, radial, false);
          dyeAcrossSeasons(geometry, s, st * PLY_COUNT + k, curve.getLength(), segments, radial);
          out.push({ key: `${season}-${st}-${k}`, season, geometry });
        }
      });
    });
    return out;
  }, [path, strands, compact]);

  // One material per season (its fibre: roughness, sheen, metal); the
  // colours are in the vertices, so they can run from season to season.
  const materials = useMemo(() => {
    const map = {} as Record<SeasonId, THREE.MeshPhysicalMaterial>;
    YARN_SEASONS.forEach((season, s) => {
      const preset = YARN_PRESETS[season];
      const [a, b] = path.ranges[s];
      const length = path.lengths[b] - path.lengths[a];
      const bump = fibre.clone();
      bump.needsUpdate = true;
      bump.repeat.set(length * 9, 1);
      map[season] = new THREE.MeshPhysicalMaterial({
        vertexColors: true,
        roughness: preset.roughness,
        metalness: preset.metalness,
        sheen: preset.sheen,
        sheenColor: new THREE.Color(preset.sheenColor),
        sheenRoughness: 0.55,
        bumpMap: bump,
        bumpScale: 2.4,
      });
    });
    return map;
  }, [path, fibre]);

  // ── Fibres (fuzz) and sequins ────────────────────────────────────────────
  const fuzzCount = compact ? 3500 : 9000;
  const sequinCount = compact ? 160 : 360;

  useEffect(() => {
    const fuzz = fuzzRef.current;
    const sequins = sequinRef.current;
    if (!fuzz || !sequins) return;
    const rand = seeded(7);
    const matrix = new THREE.Matrix4();
    const quat = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    const color = new THREE.Color();

    // Share the fibres out by each season's density and length.
    const weights = YARN_SEASONS.map((season, s) => {
      const [a, b] = path.ranges[s];
      return YARN_PRESETS[season].fuzzDensity * (b - a);
    });
    const total = weights.reduce((x, y) => x + y, 0);

    let written = 0;
    YARN_SEASONS.forEach((season, s) => {
      const [a, b] = path.ranges[s];
      const count = s === YARN_SEASONS.length - 1 ? fuzzCount - written : Math.round((weights[s] / total) * fuzzCount);
      const preset = YARN_PRESETS[season];
      for (let j = 0; j < count; j++, written++) {
        const i = a + Math.floor(rand() * (b - a));
        const strand = strands[Math.floor(rand() * strands.length)];
        const phi = rand() * Math.PI * 2;
        const radial = new THREE.Vector3()
          .addScaledVector(strand.normals[i], Math.cos(phi))
          .addScaledVector(strand.binormals[i], Math.sin(phi));
        // Fibres lie mostly along the strand, lifting only a little off it —
        // a halo of fuzz rather than bristles.
        const dir = radial
          .clone()
          .multiplyScalar(0.25 + rand() * 0.45)
          .addScaledVector(strand.tangents[i], rand() < 0.5 ? -1 : 1)
          .addScaledVector(strand.normals[i], (rand() - 0.5) * 0.5)
          .normalize();
        const length = 0.03 + rand() * rand() * 0.1;
        const pos = strand.points[i].clone().addScaledVector(radial, STRAND_RADIUS * (0.85 + rand() * 0.2));
        quat.setFromUnitVectors(up, dir);
        matrix.compose(pos, quat, new THREE.Vector3(1, length, 1));
        fuzz.setMatrixAt(written, matrix);
        color.set(preset.fuzz).offsetHSL(0, (rand() - 0.5) * 0.08, (rand() - 0.5) * 0.12);
        fuzz.setColorAt(written, color);
      }
    });
    fuzz.instanceMatrix.needsUpdate = true;
    if (fuzz.instanceColor) fuzz.instanceColor.needsUpdate = true;

    const w = YARN_SEASONS.indexOf('winter');
    const [a, b] = path.ranges[w];
    const z = new THREE.Vector3(0, 0, 1);
    for (let j = 0; j < sequinCount; j++) {
      const i = a + Math.floor(rand() * (b - a));
      const strand = strands[Math.floor(rand() * strands.length)];
      const phi = rand() * Math.PI * 2;
      const radial = new THREE.Vector3()
        .addScaledVector(strand.normals[i], Math.cos(phi))
        .addScaledVector(strand.binormals[i], Math.sin(phi));
      const pos = strand.points[i].clone().addScaledVector(radial, STRAND_RADIUS * 0.95);
      quat.setFromUnitVectors(z, radial.clone().addScaledVector(strand.tangents[i], rand() - 0.5).normalize());
      const size = 0.7 + rand() * 0.6;
      matrix.compose(pos, quat, new THREE.Vector3(size, size, size));
      sequins.setMatrixAt(j, matrix);
    }
    sequins.instanceMatrix.needsUpdate = true;
  }, [path, strands, fuzzCount, sequinCount]);

  // Let the fibre lines creep along the plies: the yarn seems to turn slowly.
  useFrame((_, dt) => {
    if (reducedMotion) return;
    for (const season of YARN_SEASONS) {
      const bump = materials[season].bumpMap;
      if (bump) bump.offset.x -= dt * 0.03;
    }
  });

  useEffect(
    () => () => {
      plies.forEach((p) => p.geometry.dispose());
    },
    [plies],
  );

  return (
    <group>
      {plies.map((ply) => (
        <mesh key={ply.key} geometry={ply.geometry} material={materials[ply.season]} />
      ))}
      <instancedMesh
        key={`fuzz-${fuzzCount}`}
        ref={fuzzRef}
        args={[fibreGeometry, undefined, fuzzCount]}
        frustumCulled={false}
      >
        <meshStandardMaterial roughness={1} />
      </instancedMesh>
      <instancedMesh
        key={`sequins-${sequinCount}`}
        ref={sequinRef}
        args={[undefined, undefined, sequinCount]}
        frustumCulled={false}
      >
        <circleGeometry args={[0.03, 10]} />
        <meshStandardMaterial
          color={YARN_PRESETS.winter.sequins}
          metalness={0.75}
          roughness={0.28}
          envMapIntensity={1.8}
          side={THREE.DoubleSide}
        />
      </instancedMesh>
    </group>
  );
}
