'use client';

import { Environment, Lightformer, useProgress, useTexture } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import {
  CARD_THEME,
  SEASON_BACKDROP,
  YARN_PHOTOS,
  buildCards,
  cardSize,
  type YarnCard as Card,
} from '@/data/yarn-gallery';
import { CameraRig } from './CameraRig';
import { cardFonts, paintCardFace } from './cardFace';
import { SatinBackdrop } from './SatinBackdrop';
import { SeasonGates, SeasonRing, SeasonSwirl } from './SeasonEffects';
import { SeasonTitles } from './SeasonTitles';
import { Yarn } from './Yarn';
import { YarnCard } from './YarnCard';
import { WORD_VIEW, YarnWord } from './YarnWord';
import styles from './yarn-gallery.module.css';

/**
 * The WebGL half of /yarnGallery, loaded only on the client (three.js never
 * reaches the server or any other route). The canvas is transparent: the
 * seasonal backdrop is plain DOM behind it, and the fog shares its colours so
 * the far side of the helix melts into the page.
 */

const PHOTO_URLS = YARN_PHOTOS.map((p) => p.image);
const faceKey = (card: Card) => `${card.photo.id}|${card.season}`;
useTexture.preload(PHOTO_URLS);

function Cards({
  compact,
  reducedMotion,
  onSelect,
}: {
  compact: boolean;
  reducedMotion: boolean;
  onSelect: (card: Card) => void;
}) {
  const cards = useMemo(() => buildCards(compact), [compact]);
  const textures = useTexture(PHOTO_URLS);
  // The fog colour follows the season's sky; far cards fade towards it too.
  const fog = useThree((s) => s.scene.fog);
  const pageColor = useMemo(() => (fog instanceof THREE.Fog ? fog.color : new THREE.Color('#F7F1EC')), [fog]);
  const byId = useMemo(() => {
    const map = new Map<string, THREE.Texture>();
    textures.forEach((t, i) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      map.set(YARN_PHOTOS[i].id, t);
    });
    return map;
  }, [textures]);

  // Info card faces, painted once the site's fonts can be drawn to canvas.
  // Until then the cards show just their photographs.
  const [faces, setFaces] = useState<Map<string, THREE.Texture> | null>(null);
  useEffect(() => {
    let cancelled = false;
    const size = cardSize(compact);
    const made = new Map<string, THREE.Texture>();
    cardFonts().then((fonts) => {
      if (cancelled) return;
      // One face per photograph per season it hangs in: the ink and motif
      // follow the season, so a visiting bag wears its host's colours.
      for (const card of cards) {
        const key = faceKey(card);
        if (made.has(key)) continue;
        made.set(
          key,
          paintCardFace({
            photo: card.photo,
            season: card.season,
            theme: CARD_THEME[card.season],
            aspect: size.width / size.height,
            fonts,
          }),
        );
      }
      setFaces(made);
    });
    return () => {
      cancelled = true;
      made.forEach((t) => t.dispose());
    };
  }, [byId, cards, compact]);

  return (
    <>
      {cards.map((card) => (
        <YarnCard
          key={card.key}
          card={card}
          texture={byId.get(card.photo.id)!}
          face={faces?.get(faceKey(card)) ?? null}
          pageColor={pageColor}
          reducedMotion={reducedMotion}
          onSelect={onSelect}
        />
      ))}
    </>
  );
}

function Loader() {
  const { active, progress } = useProgress();
  return (
    <div className={styles.loader} data-done={!active && progress === 100} aria-hidden>
      <span>{Math.round(progress)}%</span>
    </div>
  );
}

export default function YarnScene({
  compact,
  reducedMotion,
  onSelect,
  onActive,
  onWritten,
}: {
  compact: boolean;
  reducedMotion: boolean;
  onSelect: (card: Card) => void;
  onActive: (index: number) => void;
  /** Called once, when the hook has finished writing the name. */
  onWritten: () => void;
}) {
  return (
    <>
      <Canvas
        className={styles.canvas}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{
          fov: compact ? 52 : 40,
          near: 0.1,
          far: 60,
          // Opens facing the name written in yarn.
          position: [
            0,
            WORD_VIEW.lookY + (compact ? WORD_VIEW.compact : WORD_VIEW.wide).lift,
            (compact ? WORD_VIEW.compact : WORD_VIEW.wide).distance,
          ],
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          // Neutral keeps whites white and colours true, where the default
          // filmic curve greys the blossoms and pearls.
          gl.toneMapping = THREE.NeutralToneMapping;
        }}
      >
        {/* The far side of the helix melts into the page. */}
        <fog attach="fog" args={[SEASON_BACKDROP.spring.fog, compact ? 8 : 10, compact ? 18 : 22]} />
        <hemisphereLight args={['#FFF6F0', '#E9D9D2', 0.9]} />
        {/* Soft studio reflections for the sheen and the winter metals — built locally, nothing downloaded. */}
        <Environment resolution={128} frames={1}>
          <Lightformer form="rect" intensity={2.4} position={[0, 4, 6]} scale={[10, 4, 1]} color="#FFF3E8" />
          <Lightformer form="rect" intensity={1.2} position={[-6, 0, 2]} rotation-y={Math.PI / 2} scale={[8, 6, 1]} color="#FDE2EC" />
          <Lightformer form="rect" intensity={1} position={[6, -1, 0]} rotation-y={-Math.PI / 2} scale={[8, 6, 1]} color="#E8E4FA" />
          <Lightformer form="rect" intensity={1} position={[0, 2, -6]} rotation-y={Math.PI} scale={[10, 4, 1]} color="#FFF3E8" />
        </Environment>

        <CameraRig compact={compact} reducedMotion={reducedMotion} onActive={onActive} />
        <Yarn compact={compact} reducedMotion={reducedMotion} />
        <SatinBackdrop reducedMotion={reducedMotion} />
        <YarnWord compact={compact} reducedMotion={reducedMotion} onWritten={onWritten} />
        <SeasonRing compact={compact} reducedMotion={reducedMotion} />
        <SeasonGates compact={compact} reducedMotion={reducedMotion} />
        <SeasonSwirl compact={compact} reducedMotion={reducedMotion} />
        <SeasonTitles compact={compact} />
        <Suspense fallback={null}>
          <Cards compact={compact} reducedMotion={reducedMotion} onSelect={onSelect} />
        </Suspense>
      </Canvas>
      <Loader />
    </>
  );
}
