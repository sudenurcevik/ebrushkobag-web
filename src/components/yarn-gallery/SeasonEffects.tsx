'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { SeasonId } from '@/data/types';
import {
  CARD_COUNT,
  YARN_SEASONS,
  cardY,
  helixRadius,
  seasonBoundary,
  seasonTop,
  spine,
} from '@/data/yarn-gallery';
import { reel } from './reel';
import { garlandKit } from './seasonShapes';

/**
 * Three ways the seasons announce themselves around the reel:
 *
 * - **SeasonRing** — a soft halo circling the model at the height of the
 *   descent, tilted towards the camera: no hoop or wire, just the season's
 *   pieces gathered in loose clusters and scattered through a band
 *   (cherry blossoms with buds and young leaves; pearls and gold sunburst
 *   charms; a fall of leaves; ice crystals and frosted beads). Crossing a
 *   knot, the pieces give way to the next season's in a wave round the ring.
 * - **SeasonGates** — at each knot, a much larger halo of the season to
 *   come, wide enough to encircle the whole installation; the camera passes
 *   through it on the way down. A blossom crown hangs above the start.
 * - **SeasonSwirl** — loose petals, motes of sunlight, leaves and snow drifting
 *   round the yarn along its whole length, each in its own season's stretch,
 *   spinning faster while you scroll.
 */

// ── Shared helpers ─────────────────────────────────────────────────────────

const smooth = (e0: number, e1: number, x: number) => THREE.MathUtils.smoothstep(x, e0, e1);

/** How present each season is at a point of the descent (0–1). */
function seasonWeight(s: number, position: number) {
  const width = 0.75;
  const fadeIn = s === 0 ? 1 : smooth(seasonBoundary(s) - width, seasonBoundary(s) + width, position);
  const fadeOut =
    s === YARN_SEASONS.length - 1 ? 0 : smooth(seasonBoundary(s + 1) - width, seasonBoundary(s + 1) + width, position);
  return fadeIn * (1 - fadeOut);
}

/** Deterministic random. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

interface Placement {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  scale: number;
  /** 0–1 around the ring; drives the wave of a season change. */
  around: number;
}


/**
 * Lays a season's pieces through a soft band round a circle of `radius` in
 * the xz plane: `clusters` loose knots of a centrepiece and its accents,
 * with more pieces scattered between them, thinning towards the band's
 * edges so it has no hard line. Tumbling seasons (autumn's leaves) turn
 * every which way; the others face outwards.
 */
function garlandLayout(season: SeasonId, radius: number, clusters: number, scale: number, seed: number) {
  const kit = garlandKit(season);
  const rand = seeded(seed);
  const perPart: Placement[][] = kit.parts.map(() => []);
  const heroes = kit.parts.map((p, i) => (p.role === 'hero' ? i : -1)).filter((i) => i >= 0);
  const accents = kit.parts.map((p, i) => (p.role === 'accent' ? i : -1)).filter((i) => i >= 0);
  const beads = kit.parts.map((p, i) => (p.role === 'bead' ? i : -1)).filter((i) => i >= 0);

  const onHoop = (angle: number, lift: number, out: number) =>
    new THREE.Vector3(Math.sin(angle) * (radius + out), lift, Math.cos(angle) * (radius + out));
  /** A soft spread: most pieces near the middle of the band, a few further out. */
  const soft = () => (rand() + rand() + rand() - 1.5) / 1.5;

  /** Faces a piece outwards, turned and tipped a little — or tumbling. */
  const facing = (angle: number, spread: number) => {
    if (kit.tumble) {
      return new THREE.Quaternion().setFromEuler(
        new THREE.Euler(rand() * Math.PI * 2, rand() * Math.PI * 2, rand() * Math.PI * 2),
      );
    }
    const outward = new THREE.Vector3(Math.sin(angle), (rand() - 0.3) * spread, Math.cos(angle)).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), outward);
    return q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), rand() * Math.PI * 2));
  };

  const place = (part: number, angle: number, lift: number, out: number, spread: number, grow = 1) => {
    perPart[part].push({
      position: onHoop(angle, lift, out),
      quaternion: facing(angle, spread),
      scale: scale * grow,
      around: ((angle / (Math.PI * 2)) % 1 + 1) % 1,
    });
  };

  const band = 0.55 * scale;
  const step = (Math.PI * 2) / clusters;
  for (let c = 0; c < clusters; c++) {
    const at = c * step + (rand() - 0.5) * step * 0.4;
    const lift = soft() * band * 0.5;
    // A centrepiece, sometimes two.
    const count = rand() < 0.35 ? 2 : 1;
    for (let h = 0; h < count; h++) {
      place(heroes[Math.floor(rand() * heroes.length)], at + (h - (count - 1) / 2) * step * 0.2, lift + soft() * 0.12 * scale, soft() * 0.2 * scale, 0.6);
    }
    // Accents gathered round it.
    for (let a = 0; a < (accents.length ? 3 + Math.floor(rand() * 3) : 0); a++) {
      place(
        accents[Math.floor(rand() * accents.length)],
        at + soft() * step * 0.35,
        lift + soft() * 0.35 * scale,
        soft() * 0.3 * scale,
        1.4,
        0.8 + rand() * 0.4,
      );
    }
  }
  // Loose pieces between the clusters, softening the band into a halo.
  const pool = [...heroes, ...accents, ...beads];
  for (let i = 0; i < clusters * 3; i++) {
    const part = pool[Math.floor(rand() * pool.length)];
    const hero = kit.parts[part].role === 'hero';
    place(part, rand() * Math.PI * 2, soft() * band, soft() * band * 0.7, 1.4, hero ? 0.55 + rand() * 0.3 : 0.7 + rand() * 0.4);
  }

  return { kit, perPart };
}

/** A season's halo as instanced meshes, scaled by `presence`. */
function useGarland(season: SeasonId, radius: number, clusters: number, scale: number, seed: number) {
  const { kit, perPart } = useMemo(
    () => garlandLayout(season, radius, clusters, scale, seed),
    [season, radius, clusters, scale, seed],
  );

  const meshes = useMemo(() => {
    const rand = seeded(seed * 7 + 1);
    return kit.parts.map((part, p) => {
      const placements = perPart[p];
      const material = new THREE.MeshPhysicalMaterial({ ...part.material, vertexColors: true });
      const mesh = new THREE.InstancedMesh(part.geometry, material, Math.max(1, placements.length));
      mesh.frustumCulled = false;
      const color = new THREE.Color();
      const sizes = placements.map(() => THREE.MathUtils.lerp(part.size[0], part.size[1], rand()));
      placements.forEach((_, i) => mesh.setColorAt(i, color.set(part.colors[Math.floor(rand() * part.colors.length)])));
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      // Extras (a flower's coiled centre) share the placements, in their own colour.
      const extras = (part.extras ?? []).map((extra) => {
        const m = new THREE.InstancedMesh(
          extra.geometry,
          new THREE.MeshPhysicalMaterial({ ...extra.material, color: extra.color, vertexColors: true }),
          Math.max(1, placements.length),
        );
        m.frustumCulled = false;
        return m;
      });
      return { mesh, extras, placements, sizes };
    });
  }, [kit, perPart, seed]);

  /** Everything to put in the scene. */
  const objects = useMemo(() => meshes.flatMap(({ mesh, extras }) => [mesh, ...extras]), [meshes]);

  useEffect(
    () => () => {
      objects.forEach((mesh) => {
        const material = mesh.material as THREE.MeshPhysicalMaterial;
        material.bumpMap?.dispose();
        material.dispose();
        mesh.dispose();
      });
      kit.parts.forEach((part) => {
        part.geometry.dispose();
        part.extras?.forEach((extra) => extra.geometry.dispose());
      });
    },
    [objects, kit],
  );

  const matrix = useMemo(() => new THREE.Matrix4(), []);
  const size = useMemo(() => new THREE.Vector3(), []);

  /**
   * Scales the pieces by how far the season's wave has reached them:
   * `presence` 0 → nothing, 1 → all; in between they appear (or leave) in
   * order of their place round the ring.
   */
  const write = (presence: number) => {
    for (const { mesh, extras, placements, sizes } of meshes) {
      const visible = presence > 0.001;
      mesh.visible = visible;
      extras.forEach((e) => (e.visible = visible));
      if (!visible) continue;
      placements.forEach((pl, i) => {
        const local = THREE.MathUtils.clamp(presence * 1.5 - pl.around * 0.5, 0, 1);
        const s = sizes[i] * pl.scale * local * local * (3 - 2 * local);
        matrix.compose(pl.position, pl.quaternion, size.setScalar(Math.max(s, 1e-5)));
        mesh.setMatrixAt(i, matrix);
        extras.forEach((e) => e.setMatrixAt(i, matrix));
      });
      mesh.instanceMatrix.needsUpdate = true;
      extras.forEach((e) => (e.instanceMatrix.needsUpdate = true));
    }
  };

  return { objects, write };
}

// ── Ring ───────────────────────────────────────────────────────────────────

function RingSeason({ season, index, radius, compact }: { season: SeasonId; index: number; radius: number; compact: boolean }) {
  const garland = useGarland(season, radius, compact ? 12 : 18, compact ? 1.3 : 1.7, 11 + index);
  const last = useRef(-1);
  useFrame(() => {
    const presence = seasonWeight(index, reel.position) * THREE.MathUtils.smoothstep(reel.intro, 0.5, 1);
    // Only rewrite matrices while the wave is moving.
    if (Math.abs(presence - last.current) < 0.002) return;
    last.current = presence;
    garland.write(presence);
  });
  return (
    <>
      {garland.objects.map((mesh, i) => (
        <primitive key={i} object={mesh} />
      ))}
    </>
  );
}

export function SeasonRing({ compact, reducedMotion }: { compact: boolean; reducedMotion: boolean }) {
  const outer = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const radius = helixRadius(compact) + (compact ? 1.2 : 1.7);

  useFrame((_, dt) => {
    const g = outer.current;
    if (!g) return;
    const k = reducedMotion ? 1 : 1 - Math.exp(-Math.min(dt, 0.1) * 5);
    const y = reel.y - (compact ? 1.3 : 0.45);
    const [sx, , sz] = spine(y);
    g.position.x += (sx - g.position.x) * k;
    g.position.y += (y - g.position.y) * k;
    g.position.z += (sz - g.position.z) * k;
    // Tilt towards the camera: the near side dips under the front card.
    g.rotation.y = reel.angle;
    if (spin.current && !reducedMotion) spin.current.rotation.y += dt * (0.05 + Math.abs(reel.speed) * 0.2);
  });

  return (
    <group ref={outer}>
      <group rotation-x={0.26}>
        <group ref={spin}>
          {YARN_SEASONS.map((season, i) => (
            <RingSeason key={season} season={season} index={i} radius={radius} compact={compact} />
          ))}
        </group>
      </group>
    </group>
  );
}

// ── Gates ──────────────────────────────────────────────────────────────────

function Gate({
  season,
  y,
  radius,
  compact,
  seed,
  reducedMotion,
}: {
  season: SeasonId;
  y: number;
  radius: number;
  compact: boolean;
  seed: number;
  reducedMotion: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const garland = useGarland(season, radius, compact ? 26 : 40, compact ? 2.2 : 2.6, seed);
  const [sx, , sz] = spine(y);

  // The opening belongs to the name: the gates (the blossom crown above the
  // start among them) appear as the ball comes down.
  const last = useRef(-1);
  useFrame(() => {
    const presence = THREE.MathUtils.smoothstep(reel.intro, 0.4, 0.9);
    if (Math.abs(presence - last.current) < 0.002) return;
    last.current = presence;
    garland.write(presence);
  });

  useFrame((_, dt) => {
    if (group.current && !reducedMotion) group.current.rotation.y += dt * 0.025;
  });

  return (
    <group ref={group} position={[sx, y, sz]}>
      {garland.objects.map((mesh, i) => (
        <primitive key={i} object={mesh} />
      ))}
    </group>
  );
}

export function SeasonGates({ compact, reducedMotion }: { compact: boolean; reducedMotion: boolean }) {
  // Wider than the camera's circle, so the camera passes inside the wreath.
  const radius = compact ? 11.2 : 13.4;
  return (
    <>
      <Gate season="spring" y={cardY(0) + 3} radius={radius} compact={compact} seed={3} reducedMotion={reducedMotion} />
      {YARN_SEASONS.slice(1).map((season, i) => (
        <Gate
          key={season}
          season={season}
          y={seasonTop(i + 1)}
          radius={radius}
          compact={compact}
          seed={10 + i}
          reducedMotion={reducedMotion}
        />
      ))}
    </>
  );
}

// ── Swirl ──────────────────────────────────────────────────────────────────

const swirlVertex = /* glsl */ `
  #include <fog_pars_vertex>
  uniform float uTime;
  uniform float uSpin;
  uniform float uScale;
  attribute vec4 aOrbit;   // base angle, radius, angular speed, size
  attribute float aSeason;
  attribute float aSeed;
  varying float vSeason;
  varying float vSeed;
  varying float vTurn;
  void main() {
    float a = aOrbit.x + uTime * aOrbit.z + uSpin;
    vec3 p = position;
    p.x += sin(a) * aOrbit.y;
    p.z += cos(a) * aOrbit.y;
    // Everything drifts gently up and down as it circles.
    p.y += sin(uTime * 0.5 + aSeed * 12.0) * 0.35;
    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = aOrbit.w * uScale / -mvPosition.z;
    vSeason = aSeason;
    vSeed = aSeed;
    vTurn = uTime * (0.4 + aSeed) + aSeed * 6.28;
    #include <fog_vertex>
  }
`;

const swirlFragment = /* glsl */ `
  #include <fog_pars_fragment>
  uniform float uOpacity;
  varying float vSeason;
  varying float vSeed;
  varying float vTurn;

  vec2 rot(vec2 p, float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c) * p; }

  void main() {
    vec2 p = gl_PointCoord * 2.0 - 1.0;
    float alpha;
    vec3 col;
    if (vSeason < 0.5) {
      // Spring: a petal, turning as it falls.
      vec2 q = rot(p, vTurn);
      float d = length(vec2(q.x * 1.9, q.y * 1.1 + 0.12 * q.x * q.x));
      alpha = 1.0 - smoothstep(0.75, 0.9, d);
      // Petals in every colour of spring's yarn.
      float pick = fract(vSeed * 7.0);
      col = pick < 0.25 ? vec3(1.0, 0.41, 0.77) : pick < 0.5 ? vec3(1.0, 0.85, 0.3) : pick < 0.75 ? vec3(0.63, 0.86, 0.42) : vec3(0.53, 0.68, 1.0);
    } else if (vSeason < 1.5) {
      // Summer: warm motes of sunlight, softly breathing.
      float r = length(p);
      alpha = (1.0 - smoothstep(0.05, 0.95, r)) * (0.45 + 0.35 * sin(vTurn * 2.0));
      col = mix(vec3(1.0, 0.81, 0.18), vec3(0.18, 0.77, 0.84), step(0.65, fract(vSeed * 5.0)));
    } else if (vSeason < 2.5) {
      // Autumn: a small leaf with a midrib.
      vec2 q = rot(p, vTurn * 0.6);
      float d = length(vec2(q.x * 1.7, q.y)) + abs(q.x) * 0.25;
      alpha = 1.0 - smoothstep(0.78, 0.9, d);
      alpha *= 1.0 - (1.0 - smoothstep(0.0, 0.06, abs(q.x))) * 0.35;
      col = mix(vec3(0.82, 0.41, 0.16), vec3(0.91, 0.64, 0.24), fract(vSeed * 3.0));
    } else {
      // Winter: a soft snowflake.
      float r = length(p);
      alpha = 1.0 - smoothstep(0.35, 0.9, r);
      col = mix(vec3(1.0), vec3(0.62, 0.72, 1.0), step(0.7, fract(vSeed * 3.0)));
    }
    if (alpha < 0.02) discard;
    gl_FragColor = vec4(col, alpha * 0.7 * uOpacity);
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

export function SeasonSwirl({ compact, reducedMotion }: { compact: boolean; reducedMotion: boolean }) {
  const count = compact ? 700 : 1600;
  const spin = useRef(0);

  const { geometry, material } = useMemo(() => {
    const rand = seeded(97);
    const top = cardY(0) + 4;
    const bottom = cardY(CARD_COUNT - 1) - 4;
    const positions = new Float32Array(count * 3);
    const orbit = new Float32Array(count * 4);
    const seasonAttr = new Float32Array(count);
    const seedAttr = new Float32Array(count);
    const outer = helixRadius(compact) + 2.4;
    for (let i = 0; i < count; i++) {
      const y = THREE.MathUtils.lerp(top, bottom, rand());
      const [sx, , sz] = spine(y);
      positions.set([sx, y, sz], i * 3);
      const season = THREE.MathUtils.clamp(Math.floor(-y / (seasonTop(0) - seasonTop(1))), 0, YARN_SEASONS.length - 1);
      const radius = THREE.MathUtils.lerp(0.9, outer, Math.sqrt(rand()));
      // Following the helix: all turn the same way, the inner ones faster.
      const speed = (0.12 + rand() * 0.1) * (2.2 / (radius + 0.6));
      // Last component: size in scene units.
      orbit.set([rand() * Math.PI * 2, radius, speed, (compact ? 0.16 : 0.13) * (0.6 + rand() * 0.8)], i * 4);
      seasonAttr[i] = season;
      seedAttr[i] = rand();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('aOrbit', new THREE.BufferAttribute(orbit, 4));
    g.setAttribute('aSeason', new THREE.BufferAttribute(seasonAttr, 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seedAttr, 1));
    const m = new THREE.ShaderMaterial({
      vertexShader: swirlVertex,
      fragmentShader: swirlFragment,
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib.fog,
        { uTime: { value: 0 }, uSpin: { value: 0 }, uScale: { value: 1 }, uOpacity: { value: 0 } },
      ]),
      transparent: true,
      depthWrite: false,
      fog: true,
    });
    return { geometry: g, material: m };
  }, [count, compact]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((state, dt) => {
    const u = material.uniforms;
    // Pixels per scene unit at distance 1, so sizes stay true to the scene.
    const fov = (state.camera as THREE.PerspectiveCamera).fov ?? 40;
    u.uScale.value = (state.size.height * state.gl.getPixelRatio()) / (2 * Math.tan((fov * Math.PI) / 360));
    u.uOpacity.value = THREE.MathUtils.smoothstep(reel.intro, 0.4, 0.9);
    if (reducedMotion) return;
    u.uTime.value += dt;
    // Scrolling winds the swirl on, in the direction of the descent.
    spin.current += reel.speed * dt * 0.35;
    u.uSpin.value = spin.current;
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
