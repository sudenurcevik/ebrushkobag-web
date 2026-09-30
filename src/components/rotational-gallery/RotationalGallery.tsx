'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { GALLERY_ITEMS } from '@/data/gallery-items';
import { GalleryBackground } from './GalleryBackground';
import { GalleryCaption } from './GalleryCaption';
import { GalleryControls } from './GalleryControls';
import { GalleryItem } from './GalleryItem';
import styles from './rotational-gallery.module.css';

/**
 * The reel: a wheel far larger than the screen, its hub somewhere below the
 * fold, with the frames riding its top arc. Only the front of the wheel is
 * ever visible, so the frames rise to the front and fall away to the sides —
 * tilted along the circle — instead of sliding on a straight line.
 *
 * Motion is one number, `p`: the reel position in frames (0 = first frame
 * front and centre). Everything — drag, wheel, keys, clicks — only moves `p`
 * or its `target`; a near-critically damped spring carries `p` to the
 * target, and each animation frame writes transforms straight to the DOM.
 * React re-renders only when the front frame changes.
 */

const N = GALLERY_ITEMS.length;

/** Wrap a frame offset into [-N/2, N/2) so the reel is endless. */
const wrap = (d: number) => d - N * Math.floor((d + N / 2) / N);
const mod = (n: number) => ((n % N) + N) % N;
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

interface Geometry {
  width: number;
  height: number;
  mobile: boolean;
  cardW: number;
  cardH: number;
  band: number;
  pad: number;
  /** Radius of the wheel through the frame centres. */
  radius: number;
  /** Angle between neighbouring frames, in radians. */
  step: number;
  /** Pixels of drag that move the reel by one frame. */
  spacing: number;
  anchorY: number;
}

function measure(width: number, height: number): Geometry {
  const mobile = width < 640;
  const band = mobile ? 14 : 18;
  const pad = mobile ? 6 : 7;
  const maxH = mobile ? Math.min(height * 0.84, width * 0.66 * 1.25 + band * 2) : clamp(height * 0.8, 260, 540);
  const photoH = maxH - band * 2;
  const cardW = photoH * 0.8 + pad * 2;
  const radius = mobile ? width * 1.35 : clamp(width * 0.6, 640, 1150);
  const spacing = cardW * (mobile ? 1.02 : 0.8);
  return {
    width,
    height,
    mobile,
    cardW,
    cardH: maxH,
    band,
    pad,
    radius,
    step: spacing / radius,
    spacing,
    anchorY: height / 2,
  };
}

const REDUCED_MOTION = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function RotationalGallery() {
  const stageRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const geoRef = useRef<Geometry | null>(null);
  const [geo, setGeo] = useState<Geometry | null>(null);
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);

  // Physics state lives outside React: it changes every frame.
  const sim = useRef({
    p: -1.4, // the reel turns into place on load
    v: 0,
    target: 0,
    stiffness: 120,
    damping: 20,
    dragging: false,
    raf: 0,
    last: 0,
    active: -1,
  });

  const render = useCallback(() => {
    const g = geoRef.current;
    if (!g) return;
    const s = sim.current;
    const maxVisible = g.mobile ? 1.75 : 2.85;

    for (let i = 0; i < N; i++) {
      const el = itemRefs.current[i];
      if (!el) continue;
      const d = wrap(i - s.p);
      const ad = Math.abs(d);
      const theta = d * g.step;
      const x = g.radius * Math.sin(theta);
      const y = g.radius * (1 - Math.cos(theta));
      const scale = Math.max(0.5, 1 - 0.19 * ad);
      const fade = clamp((maxVisible - ad) / 0.75, 0, 1);
      const opacity = (1 - 0.14 * Math.min(ad, 3)) * fade;
      const blur = Math.min(1.6, Math.max(0, ad - 0.55) * 0.75);
      const rotY = clamp(-d * 7, -18, 18);

      el.style.transform =
        `translate(-50%, -50%) translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${(-ad * 70).toFixed(1)}px) ` +
        `rotate(${theta.toFixed(4)}rad) rotateY(${rotY.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
      el.style.opacity = opacity.toFixed(3);
      el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px) saturate(${(1 - 0.08 * ad).toFixed(3)})` : 'none';
      el.style.zIndex = String(100 - Math.round(ad * 10));
      el.style.visibility = opacity < 0.01 ? 'hidden' : 'visible';
    }

    if (ringRef.current) ringRef.current.style.transform = `rotate(${(-s.p * g.step).toFixed(5)}rad)`;

    const front = mod(Math.round(s.p));
    if (front !== s.active) {
      s.active = front;
      itemRefs.current.forEach((el, i) => el?.setAttribute('data-active', String(i === front)));
      setActive(front);
    }
  }, []);

  const tick = useCallback(
    (now: number) => {
      const s = sim.current;
      const dt = Math.min((now - s.last) / 1000, 1 / 30);
      s.last = now;

      if (!s.dragging) {
        const accel = s.stiffness * (s.target - s.p) - s.damping * s.v;
        s.v += accel * dt;
        s.p += s.v * dt;
      }
      render();

      if (!s.dragging && Math.abs(s.target - s.p) < 1e-4 && Math.abs(s.v) < 1e-3) {
        s.p = s.target;
        s.v = 0;
        render();
        s.raf = 0;
        return;
      }
      s.raf = requestAnimationFrame(tick);
    },
    [render],
  );

  const wake = useCallback(() => {
    const s = sim.current;
    if (s.raf) return;
    s.last = performance.now();
    s.raf = requestAnimationFrame(tick);
  }, [tick]);

  const step = useCallback(
    (dir: 1 | -1) => {
      const s = sim.current;
      s.target = Math.round(s.target) + dir;
      wake();
    },
    [wake],
  );

  const goTo = useCallback(
    (index: number) => {
      const s = sim.current;
      s.target = Math.round(s.target + wrap(index - s.target));
      wake();
    },
    [wake],
  );

  // ── Geometry ───────────────────────────────────────────────────────────
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const reduced = REDUCED_MOTION();
    const s = sim.current;
    // ω ≈ 11 rad/s, ζ ≈ 0.92: settles in about half a second, no visible overshoot.
    s.stiffness = reduced ? 900 : 120;
    s.damping = reduced ? 60 : 20;
    if (reduced) s.p = 0;

    const update = () => {
      const g = measure(stage.clientWidth, stage.clientHeight);
      geoRef.current = g;
      setGeo(g);
      render();
    };
    update();
    wake();
    const observer = new ResizeObserver(update);
    observer.observe(stage);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(s.raf);
      s.raf = 0;
    };
  }, [render, wake]);

  // ── Wheel & trackpad ───────────────────────────────────────────────────
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const s = sim.current;
    let settle = 0;
    let gestureStart: number | null = null;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      let delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (e.deltaMode === 1) delta *= 40;
      if (delta === 0) return;
      if (gestureStart === null) gestureStart = Math.round(s.target);

      // A mouse notch arrives as one large whole number; a trackpad as a
      // stream of small ones. A notch should move about one frame.
      const notch = Math.abs(delta) >= 50 && Number.isInteger(delta);
      s.target = clamp(s.target + delta / (notch ? 100 : 380), s.p - 4, s.p + 4);
      wake();

      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        let rest = Math.round(s.target);
        const moved = s.target - (gestureStart ?? rest);
        if (rest === gestureStart && Math.abs(moved) > 0.12) rest += Math.sign(moved);
        s.target = rest;
        gestureStart = null;
        wake();
      }, 150);
    };

    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      stage.removeEventListener('wheel', onWheel);
      window.clearTimeout(settle);
    };
  }, [wake]);

  // ── Keyboard ───────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target;
      if (el instanceof Element && el.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') step(1);
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') step(-1);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step]);

  // ── Drag & swipe ───────────────────────────────────────────────────────
  const drag = useRef({ id: -1, startX: 0, startP: 0, moved: 0, lastX: 0, lastT: 0, pressed: -1 });

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !geoRef.current) return;
    const s = sim.current;
    const pressed = (e.target as HTMLElement).closest<HTMLElement>('[data-index]');
    drag.current = {
      id: e.pointerId,
      startX: e.clientX,
      startP: s.p,
      moved: 0,
      lastX: e.clientX,
      lastT: e.timeStamp,
      pressed: pressed ? Number(pressed.dataset.index) : -1,
    };
    s.dragging = true;
    s.v = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    wake();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const g = geoRef.current;
    if (e.pointerId !== d.id || !g) return;
    const s = sim.current;
    const dx = e.clientX - d.startX;
    d.moved = Math.max(d.moved, Math.abs(dx));
    s.p = d.startP - dx / g.spacing;

    const dt = (e.timeStamp - d.lastT) / 1000;
    if (dt > 0) {
      const v = -(e.clientX - d.lastX) / g.spacing / dt;
      s.v = s.v * 0.3 + v * 0.7;
    }
    d.lastX = e.clientX;
    d.lastT = e.timeStamp;
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (e.pointerId !== d.id) return;
    d.id = -1;
    const s = sim.current;
    s.dragging = false;
    setDragging(false);

    if (d.moved < 6) {
      s.v = 0;
      if (d.pressed >= 0) goTo(d.pressed);
      else s.target = Math.round(s.p);
    } else {
      // A pause before letting go means no flick.
      if (e.timeStamp - d.lastT > 90) s.v = 0;
      s.v = clamp(s.v, -14, 14);
      const projected = s.p + s.v * 0.32;
      s.target = Math.round(clamp(projected, s.p - 3, s.p + 3));
    }
    wake();
  };

  const item = GALLERY_ITEMS[active];

  const stageVars = geo
    ? ({
        '--rg-w': `${geo.cardW}px`,
        '--rg-h': `${geo.cardH}px`,
        '--rg-band': `${geo.band}px`,
        '--rg-pad': `${geo.pad}px`,
      } as CSSProperties)
    : undefined;

  return (
    <>
      <GalleryBackground season={item.season} intensity={0.3} />

      <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
        <div
          ref={stageRef}
          className={`${styles.stage} min-h-0 flex-1`}
          style={stageVars}
          data-dragging={dragging}
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label="Dönen çanta arşivi — sürükleyin, kaydırın ya da ok tuşlarını kullanın"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {geo && <ReelRing ref={ringRef} geo={geo} />}
          {GALLERY_ITEMS.map((galleryItem, i) => (
            <GalleryItem
              key={galleryItem.id}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              item={galleryItem}
              index={i}
              total={N}
              priority={i < 2 || i === N - 1}
            />
          ))}
        </div>

        <div className="relative z-[2] flex flex-col items-center gap-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 sm:gap-6 sm:pb-8">
          <GalleryCaption item={item} index={active} />
          <GalleryControls index={active} total={N} onPrev={() => step(-1)} onNext={() => step(1)} />
        </div>
      </div>
    </>
  );
}

/**
 * The reel's geometry, drawn once and rotated with the frames: a hairline
 * track through the frame centres and, outside the frames, a perforated edge
 * with fine ticks — enough to read as a turning reel without becoming one.
 */
function ReelRing({ geo, ref }: { geo: Geometry; ref: React.Ref<HTMLDivElement> }) {
  const outer = geo.radius + geo.cardH * 0.5 + (geo.mobile ? 22 : 34);
  const size = (outer + 12) * 2;
  const c = size / 2;

  return (
    <div
      ref={ref}
      aria-hidden
      className={styles.ring}
      style={{
        width: size,
        height: size,
        left: geo.width / 2 - c,
        top: geo.anchorY + geo.radius - c,
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
        <circle cx={c} cy={c} r={geo.radius} stroke="#C9A97A" strokeOpacity="0.32" strokeWidth="1" />
        <circle
          cx={c}
          cy={c}
          r={outer}
          stroke="#B8966A"
          strokeOpacity="0.4"
          strokeWidth="3.2"
          strokeLinecap="round"
          pathLength={720}
          strokeDasharray="0.01 2.99"
        />
        <circle cx={c} cy={c} r={outer + 8} stroke="#C9A97A" strokeOpacity="0.28" strokeWidth="0.75" />
        <circle
          cx={c}
          cy={c}
          r={outer + 8}
          stroke="#B8966A"
          strokeOpacity="0.45"
          strokeWidth="5"
          pathLength={360}
          strokeDasharray="0.06 29.94"
        />
      </svg>
    </div>
  );
}
