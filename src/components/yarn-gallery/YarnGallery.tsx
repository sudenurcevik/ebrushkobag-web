'use client';

import dynamic from 'next/dynamic';
import { Unbounded } from 'next/font/google';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Logo } from '@/components/brand/Logo';
import {
  CARD_COUNT,
  CHAPTER,
  DESCENT_STRETCH,
  OPENING_SKY,
  SEASON_BACKDROP,
  SEASON_NAME,
  YARN_PHOTOS,
  YARN_SEASONS,
  buildCards,
  introOf,
  progressForCard,
  seasonOfCard,
  seasonBoundary,
  seasonProgress,
  type YarnCard,
} from '@/data/yarn-gallery';
import type { SeasonId } from '@/data/types';
import styles from './yarn-gallery.module.css';

/**
 * The DOM half of /yarnGallery: a tall scroll track (the page really
 * scrolls; the camera spirals down the yarn as it does), the seasonal
 * backdrop, the header and the season rail. The front card carries its own
 * text inside the scene. The WebGL scene is a client-only dynamic import, so
 * three.js loads for this route alone.
 */

const YarnScene = dynamic(() => import('./YarnScene'), { ssr: false });

/** A modern, geometric face for the opening's line and cue — this route only. */
const future = Unbounded({ subsets: ['latin', 'latin-ext'], display: 'swap', variable: '--font-future' });

/** The cue to scroll: a slowly turning ring of words round an arrow. */
function ScrollCue({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={styles.cue} aria-label="Kaydır ve keşfet">
      <svg viewBox="0 0 120 120" className={styles.cueRing} aria-hidden>
        <defs>
          <path id="cue-circle" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
        </defs>
        <text className={styles.cueText}>
          <textPath href="#cue-circle">KAYDIR · KEŞFET · KAYDIR · KEŞFET ·</textPath>
        </text>
      </svg>
      <span aria-hidden className={styles.cueArrow}>
        ↓
      </span>
    </button>
  );
}

/**
 * Crossing into a new season, the page holds still while the chapter plays
 * (see CHAPTER): the scroll is set just past the knot — so a fast flick does
 * not carry the camera on into the next cards — and wheel, touch and keys
 * are held until the title has settled behind the spine. Only going forward.
 */
function holdAtChapter(season: number) {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  // Held at a fixed point just past the threshold (never on it, where the
  // sky could flicker back): the start of the first card for spring, just
  // past the knot for the others.
  const y = Math.round((season === 0 ? progressForCard(0) : progressForCard(seasonBoundary(season) + 0.08)) * max);
  // 'instant', not 'auto': the site sets scroll-behavior: smooth, which would
  // turn every correction into a glide that fights the reader's own scroll.
  window.scrollTo({ top: y, behavior: 'instant' });
  const stop = (e: Event) => e.preventDefault();
  const keys = (e: KeyboardEvent) => {
    if ([' ', 'PageDown', 'PageUp', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) e.preventDefault();
  };
  const keep = () => {
    if (Math.abs(window.scrollY - y) > 1) window.scrollTo({ top: y, behavior: 'instant' });
  };
  window.addEventListener('wheel', stop, { passive: false });
  window.addEventListener('touchmove', stop, { passive: false });
  window.addEventListener('keydown', keys);
  window.addEventListener('scroll', keep);
  const release = () => {
    window.clearTimeout(timer);
    window.removeEventListener('wheel', stop);
    window.removeEventListener('touchmove', stop);
    window.removeEventListener('keydown', keys);
    window.removeEventListener('scroll', keep);
  };
  const timer = window.setTimeout(release, CHAPTER.settled * 1000);
  return release;
}

/** Card order along the helix — the same list the scene builds. */
const CARDS = buildCards(false);

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * The front card's text lives on the card itself (painted into the scene);
 * this only announces it to screen readers as the descent moves on.
 */
function FrontAnnouncer({ card }: { card: YarnCard }) {
  return (
    <p className="sr-only" aria-live="polite">
      {SEASON_NAME[card.season]} / {pad(card.photo.number)} — {card.photo.title}. {card.photo.description} (
      {pad(card.index + 1)} / {pad(CARD_COUNT)})
    </p>
  );
}

export function YarnGallery() {
  const [active, setActive] = useState(0);
  // Until the ball comes down onto the spine, the sky is the opening's
  // neutral ivory; then the first season arrives.
  const [opening, setOpening] = useState(true);
  // Nothing competes with the hook while it writes: the cue to scroll and
  // the season rail arrive once the name is finished.
  const [written, setWritten] = useState(false);
  const [compact, setCompact] = useState<boolean | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const introRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  // Viewport class and motion preference, decided on the client.
  useEffect(() => {
    const narrow = window.matchMedia('(max-width: 639px)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      setCompact(narrow.matches);
      setReducedMotion(reduce.matches);
    };
    sync();
    narrow.addEventListener('change', sync);
    reduce.addEventListener('change', sync);
    return () => {
      narrow.removeEventListener('change', sync);
      reduce.removeEventListener('change', sync);
    };
  }, []);

  // Intro fades as the descent starts; the rail fills with progress.
  useEffect(() => {
    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, window.scrollY / max));
      const intro = introOf(progress);
      if (introRef.current) introRef.current.style.opacity = String(Math.max(0, 1 - intro * 3));
      // With hysteresis: spring's sky arrives at 0.75, and the opening's only
      // returns below 0.55, so the sky never flickers at the threshold.
      setOpening((was) => (was ? intro < 0.75 : intro < 0.55));
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${progress})`;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // A jump (season rail, a card) glides straight to where it is going: it
  // does not stop for the chapters it passes.
  const jumping = useRef(false);
  const scrollToProgress = (progress: number) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    jumping.current = true;
    const land = () => (jumping.current = false);
    window.addEventListener('scrollend', land, { once: true });
    window.setTimeout(land, 2500);
    window.scrollTo({ top: progress * max, behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  const season = seasonOfCard(active);
  const current = YARN_SEASONS[season];

  // The sky changes like a page turning: the new one opens as a widening
  // circle from the middle of the screen, over the old, which stays beneath
  // until it is covered.
  const sky = opening ? 'opening' : current;
  const [under, setUnder] = useState<string | null>(null);
  const [turn, setTurn] = useState(0);
  const lastSky = useRef(sky);
  useEffect(() => {
    if (lastSky.current === sky) return;
    const order = (id: string) => (id === 'opening' ? -1 : YARN_SEASONS.indexOf(id as SeasonId));
    const forward = order(sky) > order(lastSky.current);
    setUnder(lastSky.current);
    lastSky.current = sky;
    setTurn((t) => t + 1);
    const done = window.setTimeout(() => setUnder(null), reducedMotion ? 0 : 2700);
    const release = forward && !jumping.current ? holdAtChapter(order(sky)) : undefined;
    return () => {
      window.clearTimeout(done);
      release?.();
    };
  }, [sky, reducedMotion]);
  const layerStyle = (id: string, background: string): React.CSSProperties => ({
    background,
    opacity: id === sky || id === under ? 1 : 0,
    zIndex: id === sky ? 2 : 1,
  });

  return (
    <main id="main" className={`relative text-ink ${future.className} ${future.variable}`} data-written={written}>
      {/* Seasonal sky — the canvas above it is transparent. */}
      <div aria-hidden className={styles.backdrop} style={{ background: SEASON_BACKDROP.spring.fog }}>
        <div
          key={sky === 'opening' ? `opening-${turn}` : 'opening'}
          className={`${styles.backdropLayer} ${sky === 'opening' && turn > 0 ? styles.skyReveal : ''}`}
          style={layerStyle('opening', OPENING_SKY)}
        />
        {YARN_SEASONS.map((id) => (
          <div
            key={id === sky ? `${id}-${turn}` : id}
            className={`${styles.backdropLayer} ${id === sky && turn > 0 ? styles.skyReveal : ''}`}
            style={layerStyle(id, SEASON_BACKDROP[id].sky)}
          >
            {/* Summer's sun throws a few slow, faint rays. */}
            {id === 'summer' && <div className={styles.sunRays} />}
          </div>
        ))}
        {/* A ring of light running out along the edge of the new sky. */}
        {turn > 0 && <div key={`ring-${turn}`} className={styles.skyRing} />}
        <div className={styles.grain} />
      </div>

      {compact !== null && (
        <YarnScene
          compact={compact}
          reducedMotion={reducedMotion}
          onActive={setActive}
          onWritten={() => setWritten(true)}
          // Clicking a card turns the reel to it.
          onSelect={(card) => scrollToProgress(progressForCard(card.index))}
        />
      )}

      {/* The scroll track: its height is the length of the descent. */}
      <div aria-hidden style={{ height: `${Math.round(CARD_COUNT * 55 * DESCENT_STRETCH) + 180}svh` }} />

      <header className="fixed inset-x-0 top-0 z-10 flex items-center justify-between gap-4 px-5 pt-5 sm:px-10 sm:pt-7">
        <Link href="/yarnGallery" className="flex shrink-0 items-center gap-3" aria-label="EBRUSHKOBAG — iplik galerisi">
          <Logo size={32} priority />
          <span className="hidden font-display text-[0.95rem] font-semibold tracking-[0.18em] sm:inline">
            EBRUSHKOBAG
          </span>
        </Link>
      </header>

      <h1 className="sr-only">EBRUSHKOBAG</h1>
      {/* Under the name written in yarn, once it is finished: a line of copy
          and the cue to scroll. */}
      <div ref={introRef} className={`${styles.intro} fixed inset-x-0 bottom-8 z-10 sm:bottom-12`}>
        <div className={styles.introInner}>
          <p className={styles.tagline}>
            Bir ip. <span>Dört mevsim.</span>
          </p>
          <ScrollCue onClick={() => scrollToProgress(progressForCard(0))} />
        </div>
      </div>

      <FrontAnnouncer card={CARDS[active]} />

      {/* Season rail: where you are on the yarn, and a way to jump. */}
      <nav aria-label="Mevsimler" className={`${styles.rail} ${styles.afterWriting}`}>
        <div className={styles.railTrack}>
          <div ref={fillRef} className={styles.railFill} />
        </div>
        <ul className="flex flex-col justify-between gap-6 py-1">
          {YARN_SEASONS.map((id, i) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => scrollToProgress(seasonProgress(i))}
                aria-current={i === season ? 'step' : undefined}
                className={`text-[0.625rem] font-medium uppercase tracking-season transition-colors duration-500 ${
                  i === season ? 'text-ink' : 'text-ink-muted/70 hover:text-ink'
                }`}
              >
                {SEASON_NAME[id]}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* The collection as text, for screen readers and anyone without WebGL. */}
      <ul className="sr-only">
        {YARN_PHOTOS.map((photo) => (
          <li key={photo.id}>
            {SEASON_NAME[photo.season]} / {pad(photo.number)} — {photo.title}: {photo.description}
          </li>
        ))}
      </ul>
    </main>
  );
}
