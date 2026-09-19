'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Season } from '@/data/types';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * THE SEASON FILM STRIP
 *
 * The year as a physical length of film: a dark band with punched sprocket
 * holes, edge markings, and one frame per season. The strip advances on its own
 * — each season takes focus in turn, its clip plays, then the band moves on —
 * and it can be swiped or clicked at any point.
 *
 * Why a dark film base: the four seasonal palettes live on blush, periwinkle,
 * chocolate and navy grounds. Laid out as cards on the page's own blush they
 * disappeared into it. On film stock every frame reads as an image being shown,
 * which is both more legible and more like what this section actually is.
 *
 * Only the focused clip plays. Under `prefers-reduced-motion` nothing advances
 * on its own and nothing plays: the strip becomes a static contact sheet.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const FILM_BASE = '#15100F';
const ADVANCE_MS = 5600;
/** How long a deliberate interaction holds the strip still. */
const HOLD_MS = 9000;

function Perforations() {
  return (
    <svg className="pointer-events-none h-5 w-full shrink-0" aria-hidden>
      <defs>
        <pattern id="film-perf" width="34" height="20" patternUnits="userSpaceOnUse">
          <rect x="7" y="4.5" width="20" height="11" rx="3" fill="#FEE9EA" opacity="0.92" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#film-perf)" />
    </svg>
  );
}

/**
 * Stand-in for a clip that has not been shot yet, drawn as an Academy leader —
 * the countdown frame at the head of a reel. It belongs on film stock, and it
 * says plainly that the frame is reserved rather than broken.
 */
function LeaderPlaceholder({ season }: { season: Season }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ backgroundColor: '#1D1714' }}
      role="img"
      aria-label={`${season.label} videosu henüz eklenmedi`}
    >
      <svg viewBox="0 0 200 200" className="h-[76%] w-auto" aria-hidden>
        <circle cx="100" cy="100" r="86" fill="none" stroke={season.accent} strokeWidth="1.5" opacity="0.5" />
        <circle cx="100" cy="100" r="62" fill="none" stroke={season.accent} strokeWidth="1" opacity="0.3" />
        <path d="M100 6 V194 M6 100 H194" stroke={season.accent} strokeWidth="1" opacity="0.3" />
        {/* The sweeping hand of a countdown leader, parked at this season. */}
        <path
          d="M100 100 L100 20"
          stroke={season.accent}
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.75"
          transform={`rotate(${Number(season.index) * 82} 100 100)`}
        />
        <text
          x="100"
          y="128"
          textAnchor="middle"
          fill={season.accent}
          className="font-display"
          style={{ fontSize: 86, fontWeight: 600 }}
        >
          {season.index}
        </text>
      </svg>

      <span className="absolute bottom-4 left-0 right-0 text-center text-[0.5625rem] uppercase tracking-label text-cream/45">
        Video bekleniyor · 1920×1080
      </span>
    </div>
  );
}

export function SeasonFilmStrip({
  seasons,
  /** Which season clips actually exist on disk, resolved on the server. */
  videoPresence,
}: {
  seasons: Season[];
  videoPresence: Record<string, boolean>;
}) {
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const frameRefs = useRef<(HTMLLIElement | null)[]>([]);
  const programmatic = useRef(false);
  const holdTimer = useRef<number | undefined>(undefined);

  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [held, setHeld] = useState(false);

  /** Any deliberate interaction stops the strip for a while, then lets it go. */
  const hold = useCallback(() => {
    setHeld(true);
    window.clearTimeout(holdTimer.current);
    holdTimer.current = window.setTimeout(() => setHeld(false), HOLD_MS);
  }, []);

  useEffect(() => () => window.clearTimeout(holdTimer.current), []);

  // Nothing runs while the strip is off screen.
  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.25 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Centre the focused frame. Guarded so the resulting scroll does not read as
  // the visitor swiping.
  useEffect(() => {
    const frame = frameRefs.current[active];
    const track = trackRef.current;
    if (!frame || !track) return;

    programmatic.current = true;
    track.scrollTo({
      left: frame.offsetLeft - (track.clientWidth - frame.clientWidth) / 2,
      behavior: reduced ? 'auto' : 'smooth',
    });
    const timer = window.setTimeout(() => {
      programmatic.current = false;
    }, 900);
    return () => window.clearTimeout(timer);
  }, [active, reduced]);

  // Advance on its own.
  useEffect(() => {
    if (reduced || !inView || held) return;
    const id = window.setInterval(
      () => setActive((current) => (current + 1) % seasons.length),
      ADVANCE_MS,
    );
    return () => window.clearInterval(id);
  }, [reduced, inView, held, seasons.length]);

  // Only the focused clip plays; the rest stay parked on their first frame.
  useEffect(() => {
    frameRefs.current.forEach((node, index) => {
      const video = node?.querySelector('video');
      if (!video) return;
      if (index === active && inView && !reduced) {
        void video.play().catch(() => {
          /* autoplay refused — the poster frame stands in, which is fine */
        });
      } else {
        video.pause();
      }
    });
  }, [active, inView, reduced]);

  // Follow a swipe: whichever frame ends up nearest the centre takes focus.
  const onScroll = useCallback(() => {
    if (programmatic.current) return;
    const track = trackRef.current;
    if (!track) return;

    const centre = track.scrollLeft + track.clientWidth / 2;
    let nearest = 0;
    let best = Number.POSITIVE_INFINITY;
    frameRefs.current.forEach((node, index) => {
      if (!node) return;
      const distance = Math.abs(node.offsetLeft + node.clientWidth / 2 - centre);
      if (distance < best) {
        best = distance;
        nearest = index;
      }
    });
    setActive((current) => (current === nearest ? current : nearest));
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <div
        className="relative overflow-hidden"
        style={{ backgroundColor: FILM_BASE }}
        onPointerDown={hold}
        onMouseEnter={hold}
        onFocusCapture={hold}
      >
        {/* Edge markings, the way real stock is printed along the sprocket rail. */}
        <div className="flex items-center justify-between px-4 pt-2 text-[0.5rem] uppercase tracking-[0.3em] text-cream/30">
          <span>EBRUSHKOBAG · SEASONS · 24 FPS</span>
          <span aria-hidden>▶ {String(active + 1).padStart(2, '0')} / 04</span>
        </div>

        <Perforations />

        <ul
          ref={trackRef}
          onScroll={onScroll}
          className="hide-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-[11vw] py-2.5 sm:px-[22vw] lg:px-[calc(50%-20rem)]"
        >
          {seasons.map((season, index) => {
            const isActive = index === active;
            const hasVideo = videoPresence[season.video.src];

            return (
              <li
                key={season.id}
                ref={(node) => {
                  frameRefs.current[index] = node;
                }}
                className="w-[78vw] shrink-0 snap-center sm:w-[56vw] lg:w-[40rem]"
              >
                <Link
                  href={`#${season.slug}`}
                  onFocus={() => {
                    hold();
                    setActive(index);
                  }}
                  onMouseEnter={() => setActive(index)}
                  aria-current={isActive ? 'true' : undefined}
                  className="group block"
                >
                  <div
                    className="relative aspect-[3/2] overflow-hidden transition-[opacity,transform,filter] duration-700 ease-editorial"
                    style={{
                      opacity: isActive ? 1 : 0.38,
                      transform: isActive ? 'scale(1)' : 'scale(0.955)',
                      filter: isActive ? 'none' : 'saturate(0.5)',
                      boxShadow: isActive ? `0 0 0 2px ${season.accent}` : '0 0 0 1px rgba(255,251,244,0.12)',
                      backgroundColor: season.background,
                    }}
                  >
                    {hasVideo ? (
                      <video
                        className="absolute inset-0 h-full w-full object-cover"
                        muted
                        loop
                        playsInline
                        preload="none"
                        poster={season.video.poster}
                        aria-label={season.video.alt}
                      >
                        <source src={season.video.src} type="video/mp4" />
                      </video>
                    ) : (
                      <LeaderPlaceholder season={season} />
                    )}

                    {/* Enough scrim for the type, not enough to flatten the clip. */}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/25"
                      aria-hidden
                    />

                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6">
                      <div>
                        <span className="label" style={{ color: season.accent }}>
                          {season.index} / {season.labelEn}
                        </span>
                        <span className="mt-1.5 block font-display text-3xl leading-none text-cream sm:text-4xl">
                          {season.label}
                        </span>
                        <span className="mt-2 block max-w-[28ch] text-xs text-cream/70 sm:text-sm">
                          {season.headline}
                        </span>
                      </div>

                      <span
                        className="hidden shrink-0 items-center gap-1.5 text-[0.625rem] uppercase tracking-label text-cream/0 transition-colors duration-500 group-hover:text-cream/80 group-focus-visible:text-cream/80 sm:flex"
                        aria-hidden
                      >
                        Bölüme git <span>→</span>
                      </span>
                    </div>

                    <ul className="absolute right-4 top-4 flex gap-1.5" aria-hidden>
                      {season.palette.slice(0, 5).map((swatch) => (
                        <li
                          key={swatch.hex}
                          className="h-2.5 w-2.5 rounded-full ring-1 ring-black/20"
                          style={{ backgroundColor: swatch.hex }}
                        />
                      ))}
                    </ul>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        <Perforations />
        <div className="h-2" />
      </div>

      {/* The scrub bar: names the four chapters and shows how long this one has
          left. Doubles as the keyboard route into the strip. */}
      <div className="shell mt-6 flex flex-wrap items-center justify-center gap-2">
        {seasons.map((season, index) => {
          const isActive = index === active;
          return (
            <button
              key={season.id}
              type="button"
              onClick={() => {
                hold();
                setActive(index);
              }}
              aria-current={isActive ? 'true' : undefined}
              className="group relative overflow-hidden rounded-full px-4 py-2.5 text-[0.625rem] uppercase tracking-label transition-colors duration-400"
              style={{
                color: isActive ? '#241A20' : '#8F8189',
                backgroundColor: isActive ? season.accent : 'transparent',
                boxShadow: isActive ? 'none' : '0 0 0 1px #FBD9DC',
              }}
            >
              <span className="relative">
                {season.index} {season.label}
              </span>
              <span className="sr-only">bölümünü göster</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
