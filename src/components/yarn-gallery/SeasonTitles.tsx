'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { SeasonId } from '@/data/types';
import {
  CARD_COUNT,
  CARD_THEME,
  CHAPTER,
  SEASON_NAME,
  YARN_SEASONS,
  cardAngle,
  cardY,
  seasonBoundary,
  seasonOfCard,
  spine,
} from '@/data/yarn-gallery';
import { cardFonts } from './cardFace';
import { reel } from './reel';

/**
 * Chapter titles. Crossing into a new season is a small scene of its own,
 * timed from the moment the page changes the sky (the front card entering
 * the season, or the opening ending) — while the page holds the scroll:
 *
 * 1. As the new sky opens, the season's name appears in front of
 *    everything, large and readable — its number, its name in hollow
 *    letters washed with its colours, its Turkish name.
 * 2. It holds there a moment, then glides back into depth and settles
 *    behind the spine, where the yarn passes in front of it.
 * 3. It stays there, drifting a little, until the descent moves on.
 */



const TURKISH: Record<SeasonId, string> = {
  spring: 'İlkbahar',
  summer: 'Yaz',
  autumn: 'Sonbahar',
  winter: 'Kış',
};

/** A colour for the fill of the hollow letters: the season's yarn, faint. */
const FILL: Record<SeasonId, [string, string]> = {
  spring: ['#FF68C4', '#A0DB6B'],
  summer: ['#FFCF2E', '#2FC4D6'],
  autumn: ['#D2692A', '#9C4A6E'],
  winter: ['#88ADFE', '#CBB8F5'],
};

function paintTitle(season: SeasonId, index: number, fonts: { display: string; sans: string }) {
  const W = 2400;
  const H = 640;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const rim = CARD_THEME[season].rim;
  const name = SEASON_NAME[season];

  // The name: wide, light, hollow — an outline with a faint wash of colour.
  const size = H * 0.5;
  ctx.font = `300 ${size}px ${fonts.display}`;
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${size * 0.08}px`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const wash = ctx.createLinearGradient(W * 0.2, 0, W * 0.8, 0);
  wash.addColorStop(0, `${FILL[season][0]}66`);
  wash.addColorStop(1, `${FILL[season][1]}66`);
  // A soft white glow lifts the letters off whatever lies behind them.
  ctx.save();
  ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
  ctx.shadowBlur = H * 0.06;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fillText(name, W / 2, H * 0.52);
  ctx.restore();
  ctx.fillStyle = wash;
  ctx.fillText(name, W / 2, H * 0.52);
  ctx.lineWidth = H * 0.009;
  ctx.strokeStyle = rim;
  ctx.strokeText(name, W / 2, H * 0.52);

  // Number and Turkish name, small, in the season's colour.
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${H * 0.012}px`;
  ctx.fillStyle = rim;
  ctx.font = `500 ${H * 0.06}px ${fonts.display}`;
  ctx.textAlign = 'left';
  ctx.fillText(`${String(index + 1).padStart(2, '0')} / ${String(YARN_SEASONS.length).padStart(2, '0')}`, W * 0.08, H * 0.12);
  ctx.textAlign = 'right';
  ctx.fillText(TURKISH[season].toLocaleUpperCase('tr-TR'), W * 0.92, H * 0.92);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

const right = new THREE.Vector3();
const behind = new THREE.Vector3();
const inFront = new THREE.Vector3();
const ahead = new THREE.Vector3();
const facing = new THREE.Quaternion();
const UP = new THREE.Vector3(0, 1, 0);
/** How far in front of the camera the title appears before gliding back. */
const FRONT_DISTANCE = 6;

function Title({ season, index, texture, compact }: { season: SeasonId; index: number; texture: THREE.Texture; compact: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        fog: false,
        toneMapped: false,
      }),
    [texture],
  );
  useEffect(() => () => material.dispose(), [material]);

  // Where it stands: at the knot (or just above the first card, for
  // spring), behind the spine as seen from where the camera will be.
  const at = index === 0 ? 0 : seasonBoundary(index);
  const angle = cardAngle(at);
  const y = cardY(at) + (index === 0 ? 0.9 : 0.4);
  const [sx, , sz] = spine(y);
  const back = compact ? 2.6 : 3.4;
  const width = compact ? 7 : 12.5;

  const since = useRef(-1);
  const shown = useRef(0);
  const camera = useThree((s) => s.camera);

  useFrame((state, dt) => {
    const m = mesh.current;
    if (!m) return;
    const delta = reel.position - at;
    const now = state.clock.elapsedTime;

    // Has the page changed the sky to this season? The same test the page
    // uses: the front card's season, and the opening over.
    const front = Math.min(CARD_COUNT - 1, Math.max(0, Math.round(reel.position)));
    const here = seasonOfCard(front) === index && reel.intro >= 0.75;
    if (here && since.current < 0) since.current = now;
    if (!here) since.current = -1;

    const t = since.current < 0 ? -1 : now - since.current;
    const appear = t < 0 ? 0 : THREE.MathUtils.smoothstep(t, CHAPTER.appear, CHAPTER.shown);
    // 0 while it holds in front of the camera, 1 once it has settled behind the spine.
    const settle = t < 0 ? 1 : THREE.MathUtils.smootherstep(t, CHAPTER.leave, CHAPTER.settled);
    const onward = index === 0 ? reel.position : delta;
    const stay = 1 - THREE.MathUtils.smoothstep(onward, 0.55, 1.2);
    const target = appear * (settle < 1 ? 1 : stay);
    shown.current += (target - shown.current) * (1 - Math.exp(-dt * (target > shown.current ? 4 : 5)));
    const presence = shown.current;
    material.opacity = presence;
    m.visible = presence > 0.005;

    // Behind the spine, drifting a little as you scroll through the knot.
    right.set(Math.cos(angle), 0, -Math.sin(angle));
    behind.set(sx - Math.sin(angle) * back, y, sz - Math.cos(angle) * back).addScaledVector(right, -delta * 1.2);
    // In front: a few units ahead of the camera, square to it.
    camera.getWorldDirection(ahead);
    inFront.copy(camera.position).addScaledVector(ahead, FRONT_DISTANCE);
    m.position.lerpVectors(inFront, behind, settle);
    facing.setFromAxisAngle(UP, angle);
    m.quaternion.copy(camera.quaternion).slerp(facing, settle);
    m.scale.setScalar(THREE.MathUtils.lerp(compact ? 0.34 : 0.46, 1, settle));
    // Drawn over everything while it is in front; among the yarn once it is behind.
    const infront = settle < 0.5;
    material.depthTest = !infront;
    m.renderOrder = infront ? 1000 : -10;
  });

  return (
    <mesh ref={mesh} rotation-y={angle} material={material} renderOrder={-10} raycast={() => null}>
      <planeGeometry args={[width, width * (640 / 2400)]} />
    </mesh>
  );
}

export function SeasonTitles({ compact }: { compact: boolean }) {
  const [textures, setTextures] = useState<THREE.Texture[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    let made: THREE.Texture[] = [];
    cardFonts().then((fonts) => {
      if (cancelled) return;
      made = YARN_SEASONS.map((season, i) => paintTitle(season, i, fonts));
      setTextures(made);
    });
    return () => {
      cancelled = true;
      made.forEach((t) => t.dispose());
    };
  }, []);

  if (!textures) return null;
  return (
    <>
      {YARN_SEASONS.map((season, i) => (
        <Title key={season} season={season} index={i} texture={textures[i]} compact={compact} />
      ))}
    </>
  );
}
