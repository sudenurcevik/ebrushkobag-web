'use client';

import dynamic from 'next/dynamic';
import { Unbounded } from 'next/font/google';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Logo } from '@/components/brand/Logo';
import {
  CARDS_PER_SEASON,
  CARD_COUNT,
  CARD_THEME,
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
  descentOf,
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
 * (see CHAPTER): the scroll is set to the season's first card — the camera
 * travels there while the eye is closed and the scene blurred, so it opens
 * on that card rather than a long scroll short of it — and wheel, touch and
 * keys are held until the title has settled behind the spine. Only going
 * forward.
 */
function holdAtChapter(season: number) {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const y = Math.round(progressForCard(season * CARDS_PER_SEASON) * max);
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

const TURKISH: Record<SeasonId, string> = { spring: 'İlkbahar', summer: 'Yaz', autumn: 'Sonbahar', winter: 'Kış' };

/**
 * The first beat of a new season, drawn over the scene (see CHAPTER): it
 * opens with the new sky, as one circle from the middle of the screen — the
 * scene blurred behind a veil, the season's name large in front — and when
 * the name has been read it closes the same way, back into the middle, on
 * the spine with the name now behind it (SeasonTitles) and the season's
 * first card in front.
 */
function ChapterOverlay({ season }: { season: SeasonId }) {
  const theme = CARD_THEME[season];
  const index = YARN_SEASONS.indexOf(season);
  return (
    <div
      className={styles.chapter}
      aria-hidden
      style={
        {
          '--chapter-length': `${CHAPTER.settled}s`,
          '--chapter-rim': theme.rim,
          '--chapter-accent': theme.accent,
        } as React.CSSProperties
      }
    >
      <div className={styles.chapterVeil} />
      <div className={styles.chapterStage}>
        <div className={styles.chapterTitle}>
          <span className={styles.chapterNumber}>
            {pad(index + 1)} / {pad(YARN_SEASONS.length)}
          </span>
          <span className={styles.chapterName}>{SEASON_NAME[season]}</span>
          <span className={styles.chapterLocal}>{TURKISH[season].toLocaleUpperCase('tr-TR')}</span>
        </div>
      </div>
      <div className={styles.chapterRing} />
    </div>
  );
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
  const fillRefs = useRef<(HTMLSpanElement | null)[]>([]);

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

  // Intro fades as the descent starts; each season's stretch of the rail
  // fills as the descent passes through it.
  useEffect(() => {
    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, window.scrollY / max));
      const intro = introOf(progress);
      if (introRef.current) introRef.current.style.opacity = String(Math.max(0, 1 - intro * 3));
      // With hysteresis: spring's sky arrives at 0.75, and the opening's only
      // returns below 0.55, so the sky never flickers at the threshold.
      setOpening((was) => (was ? intro < 0.75 : intro < 0.55));
      const position = intro < 1 ? -0.5 : descentOf(progress);
      fillRefs.current.forEach((fill, s) => {
        const through = Math.min(1, Math.max(0, (position - s * CARDS_PER_SEASON + 0.5) / CARDS_PER_SEASON));
        if (fill) fill.style.transform = `scaleY(${through})`;
      });
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
  const [chapter, setChapter] = useState<{ season: SeasonId; key: number } | null>(null);
  const lastSky = useRef(sky);
  useEffect(() => {
    if (lastSky.current === sky) return;
    const order = (id: string) => (id === 'opening' ? -1 : YARN_SEASONS.indexOf(id as SeasonId));
    const forward = order(sky) > order(lastSky.current);
    setUnder(lastSky.current);
    lastSky.current = sky;
    setTurn((t) => t + 1);
    const done = window.setTimeout(() => setUnder(null), reducedMotion ? 0 : 2700);
    const play = forward && !jumping.current;
    const release = play ? holdAtChapter(order(sky)) : undefined;
    if (play) setChapter({ season: sky as SeasonId, key: Date.now() });
    const over = play ? window.setTimeout(() => setChapter(null), CHAPTER.settled * 1000 + 200) : undefined;
    return () => {
      window.clearTimeout(done);
      window.clearTimeout(over);
      release?.();
    };
  }, [sky, reducedMotion]);
  // With a chapter, the sky's circle opens in step with the chapter's.
  const withChapter = chapter?.season === sky;
  const reveal = withChapter ? styles.skyIris : styles.skyReveal;
  const layerStyle = (id: string, background: string): React.CSSProperties => ({
    background,
    opacity: id === sky || id === under ? 1 : 0,
    zIndex: id === sky ? 2 : 1,
  });

  return (
    <main
      id="main"
      className={`relative text-ink ${future.className} ${future.variable}`}
      data-written={written}
      style={{ '--chapter-open': `${CHAPTER.open}s` } as React.CSSProperties}
    >
      {/* Seasonal sky — the canvas above it is transparent. */}
      <div aria-hidden className={styles.backdrop} style={{ background: SEASON_BACKDROP.spring.fog }}>
        <div
          key={sky === 'opening' ? `opening-${turn}` : 'opening'}
          className={`${styles.backdropLayer} ${sky === 'opening' && turn > 0 ? reveal : ''}`}
          style={layerStyle('opening', OPENING_SKY)}
        />
        {YARN_SEASONS.map((id) => (
          <div
            key={id === sky ? `${id}-${turn}` : id}
            className={`${styles.backdropLayer} ${id === sky && turn > 0 ? reveal : ''}`}
            style={layerStyle(id, SEASON_BACKDROP[id].sky)}
          >
            {/* Summer's sun throws a few slow, faint rays. */}
            {id === 'summer' && <div className={styles.sunRays} />}
          </div>
        ))}
        {/* A ring of light running out along the edge of the new sky. */}
        {turn > 0 && (
          <div key={`ring-${turn}`} className={`${styles.skyRing} ${withChapter ? styles.skyIrisRing : ''}`} />
        )}
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

      {/* The opening already spells the name, so the header waits for the
          seasons to begin. */}
      <header
        className={`${styles.header} fixed inset-x-0 top-0 z-10 flex items-center justify-between gap-4 px-5 pt-5 sm:px-10 sm:pt-7`}
        data-hidden={opening}
      >
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

      {chapter && <ChapterOverlay key={chapter.key} season={chapter.season} />}

      <FrontAnnouncer card={CARDS[active]} />

      {/* Season rail: where you are on the yarn, and a way to jump. */}
      {/* Like the header, it waits for the seasons to begin. */}
      <nav aria-label="Mevsimler" className={styles.rail} data-hidden={opening}>
        <ol className={styles.railList}>
          {YARN_SEASONS.map((id, i) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => scrollToProgress(seasonProgress(i))}
                aria-current={i === season ? 'step' : undefined}
                className={styles.railItem}
                style={{ '--rail-rim': CARD_THEME[id].rim, '--rail-accent': CARD_THEME[id].accent } as React.CSSProperties}
              >
                <span aria-hidden className={styles.railIndex}>
                  {pad(i + 1)}
                </span>
                <span>{SEASON_NAME[id]}</span>
                <span aria-hidden className={styles.railBar}>
                  <span ref={(el) => void (fillRefs.current[i] = el)} className={styles.railFill} />
                </span>
              </button>
            </li>
          ))}
        </ol>
        <p aria-hidden className={styles.railCount}>
          {pad(active + 1)}
          <span> / {pad(CARD_COUNT)}</span>
        </p>
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
