'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  CAMERA_LIFT,
  CARD_COUNT,
  SEASON_BACKDROP,
  YARN_SEASONS,
  cameraDistance,
  cardAngle,
  cardY,
  descentOf,
  introOf,
  seasonOfCard,
  spine,
} from '@/data/yarn-gallery';
import { reel } from './reel';
import { WORD_VIEW } from './YarnWord';

/**
 * Scroll drives the whole film:
 *
 * 1. **Opening.** The camera faces the name written in yarn. The first
 *    stretch of scroll winds it into a ball; as the ball drops onto the
 *    spine the camera follows it down and dives.
 * 2. **Descent.** The camera circles the yarn as it goes down, a fifth of a
 *    turn per card, so each card swings round to face it in turn.
 *
 * The page's own scroll position is read every frame and eased with an
 * exponential damp — the camera always lags a little behind the hand, which
 * is what gives the heavy, gliding feel. The camera sits a little above what
 * it looks at, so the reel is seen slightly from above.
 */

const tmpLook = new THREE.Vector3();
const tmpTarget = new THREE.Vector3();
const introTarget = new THREE.Vector3();
const introLook = new THREE.Vector3();
const tmpColor = new THREE.Color();
const lightOffset = new THREE.Vector3(-2, 5, 0);

export function CameraRig({
  compact,
  reducedMotion,
  onActive,
}: {
  compact: boolean;
  reducedMotion: boolean;
  onActive: (index: number) => void;
}) {
  const camera = useThree((s) => s.camera);
  const scene = useThree((s) => s.scene);
  const key = useRef<THREE.DirectionalLight>(null);
  const position = useRef(0);
  const intro = useRef(0);
  const look = useRef(new THREE.Vector3(0, WORD_VIEW.lookY, 0));
  const active = useRef(-1);
  // The pointer, eased, so the view drifts after it rather than snapping.
  const gaze = useRef(new THREE.Vector2());
  const maxScroll = useRef(1);

  useEffect(() => {
    const measure = () => {
      maxScroll.current = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useFrame((state, dt) => {
    const step = Math.min(dt, 0.1);
    const damp = (lambda: number) => (reducedMotion ? 1 : 1 - Math.exp(-lambda * step));
    // Measured every frame, so the camera and the page (which holds the
    // scroll at each chapter) always agree on where the scroll is.
    maxScroll.current = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = THREE.MathUtils.clamp(window.scrollY / maxScroll.current, 0, 1);

    intro.current += (introOf(progress) - intro.current) * damp(3);
    const before = position.current;
    position.current += (descentOf(progress) - position.current) * damp(3);
    const p = position.current;
    reel.intro = intro.current;
    reel.position = p;
    reel.speed = step > 0 ? (p - before) / step : 0;

    // Moving the pointer turns the view a little — round the yarn and up or
    // down — never enough to lose the front card.
    const g = gaze.current;
    const follow = reducedMotion ? 0 : 1 - Math.exp(-2.5 * step);
    g.x += (state.pointer.x - g.x) * follow;
    g.y += (state.pointer.y - g.y) * follow;

    // Where the descent would put the camera: facing the front card.
    const angle = cardAngle(p) + g.x * 0.22;
    const y = cardY(p);
    const [sx, , sz] = spine(y);
    const distance = cameraDistance(compact);
    reel.angle = angle;
    reel.y = y;
    tmpTarget.set(
      sx + Math.sin(angle) * distance,
      y + CAMERA_LIFT + g.y * 0.7,
      sz + Math.cos(angle) * distance,
    );
    // On phones aim a little lower, so the card rides higher in the frame.
    tmpLook.set(sx, y - (compact ? 0.45 : 0.2), sz);

    // Where the opening puts it: square on to the name.
    const view = compact ? WORD_VIEW.compact : WORD_VIEW.wide;
    introTarget.set(g.x * 1.6, WORD_VIEW.lookY + view.lift + g.y * 0.8, view.distance - Math.abs(g.x) * 0.4);
    introLook.set(0, WORD_VIEW.lookY, 0);
    // Hold on the name while it winds into a ball, then follow the ball down.
    const dive = THREE.MathUtils.smoothstep(intro.current, 0.6, 1);
    tmpTarget.lerpVectors(introTarget, tmpTarget, dive);
    tmpLook.lerpVectors(introLook, tmpLook, dive);

    const k = damp(6);
    camera.position.lerp(tmpTarget, k);
    look.current.lerp(tmpLook, k);
    camera.lookAt(look.current);

    // The key light travels with the camera, so whichever side of the yarn
    // is in view is lit the same way.
    if (key.current) {
      key.current.position.copy(camera.position).add(lightOffset);
      key.current.target.position.copy(look.current);
      key.current.target.updateMatrixWorld();
    }

    const front = THREE.MathUtils.clamp(Math.round(p), 0, CARD_COUNT - 1);
    if (front !== active.current) {
      active.current = front;
      onActive(front);
    }
    if (scene.fog instanceof THREE.Fog) {
      tmpColor.set(SEASON_BACKDROP[YARN_SEASONS[seasonOfCard(front)]].fog);
      scene.fog.color.lerp(tmpColor, damp(1.2));
    }
  });

  return <directionalLight ref={key} intensity={1.7} color="#FFF4EA" />;
}
