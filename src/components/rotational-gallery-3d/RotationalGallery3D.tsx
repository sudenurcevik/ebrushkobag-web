'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { GALLERY_3D_ITEMS } from '@/data/gallery-3d-items';
import { Gallery3DBackground } from './Gallery3DBackground';
import { Gallery3DCaption } from './Gallery3DCaption';
import { Gallery3DControls } from './Gallery3DControls';
import { Gallery3DItem } from './Gallery3DItem';
import styles from './rotational-gallery-3d.module.css';

/**
 * A real cylinder in CSS 3D. Every frame sits at `rotateY(i · 360°/N)
 * translateZ(R)`; the rig holding them is pushed back by R, so the frame that
 * faces the camera lands exactly at screen depth and full size, and turning
 * the rig brings the next frame round to the front. Side frames face away
 * along the curve; the far side shows the backs of frames between them. The
 * camera sits a little above the reel's centre, so the far arc lifts behind
 * the front frame and the perforated rail reads as an ellipse.
 *
 * Motion is one number, `p` — the reel position in frames. Drag, wheel, keys
 * and clicks move `p` or its `target`; a near-critically damped spring
 * carries it home, and each animation frame writes one transform to the rig
 * plus light and fade to each front face. React re-renders only when the
 * front frame changes. `p` is never wrapped, so the loop has no seam.
 */

const N = GALLERY_3D_ITEMS.length;
const STEP = (Math.PI * 2) / N;

const wrap = (d: number) => d - N * Math.floor((d + N / 2) / N);
const mod = (n: number) => ((n % N) + N) % N;
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

interface Geometry {
  mobile: boolean;
  cardW: number;
  cardH: number;
  band: number;
  pad: number;
  radius: number;
  perspective: number;
  anchorY: number;
  /** Pixels of drag that turn the reel by one frame. */
  spacing: number;
}

function measure(width: number, height: number): Geometry {
  const mobile = width < 640;
  const band = mobile ? 13 : 16;
  const pad = mobile ? 6 : 7;
  const byHeight = (height * (mobile ? 0.74 : 0.8) - band * 2) * 0.8 + pad * 2;
  const cardW = mobile ? Math.min(width * 0.66, byHeight) : clamp(Math.min(width * 0.32, byHeight), 260, 520);
  const cardH = (cardW - pad * 2) * 1.25 + band * 2;
  // Desktop: a reel much wider than a frame, so the frames hang apart like an
  // installation and the far side shows through the gaps. Mobile: tight
  // enough that only slivers of the neighbours reach the screen edges.
  const radius = mobile ? cardW * 1.25 : clamp(width * 0.42, cardW * 1.9, cardW * 2.5);
  return {
    mobile,
    cardW,
    cardH,
    band,
    pad,
    radius,
    perspective: radius * (mobile ? 2.2 : 1.75),
    anchorY: height * 0.5,
    spacing: radius * Math.sin(STEP),
  };
}

export function RotationalGallery3D() {
  const stageRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const railRigRef = useRef<HTMLDivElement>(null);
  const faceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const geoRef = useRef<Geometry | null>(null);
  const [geo, setGeo] = useState<Geometry | null>(null);
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);

  const sim = useRef({
    p: -0.85, // the reel turns into place on load
    v: 0,
    target: 0,
    stiffness: 80,
    damping: 17,
    reduced: false,
    dragging: false,
    raf: 0,
    last: 0,
    active: -1,
  });

  const render = useCallback(() => {
    const g = geoRef.current;
    const rig = rigRef.current;
    if (!g || !rig) return;
    const s = sim.current;

    const turn = `translateZ(${(-g.radius).toFixed(1)}px) rotateY(${(-s.p * STEP).toFixed(5)}rad)`;
    rig.style.transform = turn;
    if (railRigRef.current) railRigRef.current.style.transform = turn;

    for (let i = 0; i < N; i++) {
      const face = faceRefs.current[i];
      if (!face) continue;
      const c = Math.cos(wrap(i - s.p) * STEP);
      const lit = Math.max(0, c);
      const opacity = 0.35 + 0.65 * Math.pow(lit, 0.8);
      const brightness = 0.72 + 0.28 * Math.pow(lit, 1.5);
      const blur = c > 0.96 ? 0 : Math.min(1.2, (1 - c) * 1.1);
      face.style.opacity = opacity.toFixed(3);
      face.style.filter =
        blur > 0 ? `brightness(${brightness.toFixed(3)}) blur(${blur.toFixed(2)}px)` : `brightness(${brightness.toFixed(3)})`;
    }

    const front = mod(Math.round(s.p));
    if (front !== s.active) {
      s.active = front;
      faceRefs.current.forEach((face, i) => face?.parentElement?.setAttribute('data-active', String(i === front)));
      setActive(front);
    }
  }, []);

  const tick = useCallback(
    (now: number) => {
      const s = sim.current;
      const dt = Math.min((now - s.last) / 1000, 1 / 30);
      s.last = now;

      if (!s.dragging) {
        s.v += (s.stiffness * (s.target - s.p) - s.damping * s.v) * dt;
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

  // ── Geometry & motion preferences ──────────────────────────────────────
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const s = sim.current;
    s.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // ω ≈ 9 rad/s, ζ ≈ 0.95: a heavy, unhurried settle with no overshoot.
    // Reduced motion: a quick, critically damped step instead.
    s.stiffness = s.reduced ? 700 : 80;
    s.damping = s.reduced ? 53 : 17;
    if (s.reduced) s.p = 0;

    const update = () => {
      const g = measure(stage.clientWidth, stage.clientHeight);
      geoRef.current = g;
      setGeo(g);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(stage);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(s.raf);
      s.raf = 0;
    };
  }, []);

  // Faces and rig mount with the geometry; paint and start once they exist.
  useLayoutEffect(() => {
    if (!geo) return;
    render();
    wake();
  }, [geo, render, wake]);

  // ── Wheel & trackpad (only while the pointer is over the reel) ────────
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const s = sim.current;
    let settle = 0;
    let gestureStart: number | null = null;

    const onWheel = (e: WheelEvent) => {
      let delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (e.deltaMode === 1) delta *= 40;
      if (delta === 0 || e.ctrlKey) return;
      e.preventDefault();

      if (s.reduced) {
        // No continuous spin: one gesture, one frame.
        if (gestureStart === null) {
          gestureStart = s.target;
          step(delta > 0 ? 1 : -1);
        }
        window.clearTimeout(settle);
        settle = window.setTimeout(() => (gestureStart = null), 220);
        return;
      }

      if (gestureStart === null) gestureStart = Math.round(s.target);
      // A mouse notch is one large whole number; a trackpad a stream of small ones.
      const notch = Math.abs(delta) >= 50 && Number.isInteger(delta);
      s.target = clamp(s.target + delta / (notch ? 100 : 420), s.p - 3, s.p + 3);
      wake();

      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        let rest = Math.round(s.target);
        const moved = s.target - (gestureStart ?? rest);
        if (rest === gestureStart && Math.abs(moved) > 0.12) rest += Math.sign(moved);
        s.target = rest;
        gestureStart = null;
        wake();
      }, 160);
    };

    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      stage.removeEventListener('wheel', onWheel);
      window.clearTimeout(settle);
    };
  }, [step, wake]);

  // ── Keyboard ───────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
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
    if (dt > 0) s.v = s.v * 0.3 + (-(e.clientX - d.lastX) / g.spacing / dt) * 0.7;
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
    } else if (s.reduced) {
      // No inertia: settle on the nearest frame, or the next one past a nudge.
      s.v = 0;
      const moved = s.p - d.startP;
      const base = Math.round(d.startP);
      s.target = Math.abs(moved) > 0.18 ? base + Math.sign(moved) * Math.max(1, Math.round(Math.abs(moved))) : base;
    } else {
      if (e.timeStamp - d.lastT > 90) s.v = 0; // held still before letting go
      s.v = clamp(s.v, -10, 10);
      // Carry on with the flick, then settle on the frame it would reach.
      s.target = Math.round(clamp(s.p + s.v * 0.42, s.p - 3, s.p + 3));
    }
    wake();
  };

  const item = GALLERY_3D_ITEMS[active];

  const stageVars = geo
    ? ({
        '--g3-w': `${geo.cardW}px`,
        '--g3-h': `${geo.cardH}px`,
        '--g3-band': `${geo.band}px`,
        '--g3-pad': `${geo.pad}px`,
        perspective: `${geo.perspective}px`,
        perspectiveOrigin: `50% ${geo.anchorY - geo.cardH * 0.3}px`,
      } as CSSProperties)
    : undefined;

  const railRadius = geo ? geo.radius * 1.015 : 0;

  return (
    <>
      <Gallery3DBackground season={item.season} />

      <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
        <div
          ref={stageRef}
          className={`${styles.stage} min-h-0 flex-1`}
          style={stageVars}
          data-dragging={dragging}
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label="Dönen çanta enstalasyonu — sürükleyin, kaydırın ya da ok tuşlarını kullanın"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {geo && (
            <>
              <div
                aria-hidden
                className={styles.floor}
                style={{
                  top: geo.anchorY + geo.cardH / 2 + (geo.mobile ? 18 : 28),
                  width: geo.radius * (geo.mobile ? 1.9 : 2.2),
                  height: geo.mobile ? 50 : 90,
                }}
              />
              {/*
                The rails turn with the frames but live in their own 3D
                context behind them: horizontal discs sharing a context with
                the frames confuse Chrome's depth sorting and let far frames
                paint over the front one.
              */}
              <div aria-hidden className={styles.scene} style={{ top: geo.anchorY }}>
                <div ref={railRigRef} className={styles.rig}>
                  {[
                    { className: styles.railTop, y: -geo.cardH / 2 - (geo.mobile ? 12 : 18) },
                    { className: styles.railBottom, y: geo.cardH / 2 + (geo.mobile ? 12 : 18) },
                  ].map((rail) => (
                    <div
                      key={rail.className}
                      aria-hidden
                      className={`${styles.rail} ${rail.className}`}
                      style={{
                        width: railRadius * 2,
                        height: railRadius * 2,
                        left: -railRadius,
                        top: -railRadius,
                        transform: `translateY(${rail.y}px) rotateX(90deg)`,
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className={styles.scene} style={{ top: geo.anchorY }}>
                <div ref={rigRef} className={styles.rig}>
                  {GALLERY_3D_ITEMS.map((galleryItem, i) => (
                    <Gallery3DItem
                      key={galleryItem.id}
                      item={galleryItem}
                      index={i}
                      total={N}
                      angle={i * STEP}
                      radius={geo.radius}
                      priority={i < 2 || i === N - 1}
                      frontRef={(el) => {
                        faceRefs.current[i] = el;
                      }}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="relative z-[2] flex flex-col items-center gap-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2 sm:gap-5 sm:pb-7">
          <Gallery3DCaption item={item} index={active} />
          <Gallery3DControls index={active} total={N} onPrev={() => step(-1)} onNext={() => step(1)} />
        </div>
      </div>
    </>
  );
}
