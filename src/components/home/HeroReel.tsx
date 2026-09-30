'use client';

import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, type ReactNode } from 'react';
import { BRAND } from '@/config/brand';
import { HERO } from '@/data/content';
import type { Season } from '@/data/types';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { RevealLines } from '@/components/ui/Reveal';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * THE OPENING REEL
 *
 * The logo is the reel the year is wound on. Scrolling unwinds it: the copy
 * lifts away, the reel drifts in and turns, and a length of film slides out
 * from under its rim carrying the four seasons — the same stock as the film
 * strip it leads into. By the end the ground has warmed into that section's
 * blush, so there is no hard edge between the two.
 *
 * Opening motion is FILM. The seasonal bridges own THREAD; nothing here borrows
 * the yarn motif.
 *
 * Choreography, as scroll progress through the pinned section:
 *
 *   0–8%     still: headline, reel turning on its own
 *   8–45%    copy lifts and fades; the reel drifts toward the centre, smaller
 *   28–82%   the film slides out from beneath the rim, reel turning with it
 *   70–100%  the ground warms to blush and the reel steps back; the strip stays
 *
 * One scrubbed timeline, transform and opacity only. Reduced motion gets a
 * plain, unpinned hero with a still reel and no strip.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Matches the film base of `SeasonFilmStrip`, so the two read as one length. */
const FILM_BASE = '#15100F';

export interface ReelFrame {
  season: Season;
  image: ReactNode;
}

export function HeroReel({ frames }: { frames: ReelFrame[] }) {
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (reduced || !root.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const scope = root.current;

    const ctx = gsap.context(() => {
      const q = (selector: string) => scope.querySelector<HTMLElement>(selector);
      const headline = q('[data-hero-headline]');
      const support = gsap.utils.toArray<HTMLElement>('[data-hero-support]', scope);
      const reelMove = q('[data-reel-move]');
      const reelTurn = q('[data-reel-turn]');
      const reelBody = q('[data-reel-body]');
      const film = q('[data-film]');
      const warm = gsap.utils.toArray<HTMLElement>('[data-hero-warm]', scope);
      if (!headline || !reelMove || !reelTurn || !reelBody || !film || warm.length === 0) return;

      // Positions in the film's own (scaled) pixels. Wound: entirely above
      // the rim. Released: the leading end — spring — reaches the bottom of
      // the screen. Then it keeps feeding, so the later seasons pass the reel.
      const wound = () => -film.offsetHeight;
      const released = () => Math.min(0, -film.offsetHeight + window.innerHeight * 0.8);
      const fed = () => Math.min(0, -film.offsetHeight + window.innerHeight * 1.5);

      gsap.set(film, { y: wound });
      gsap.set(warm, { opacity: 0 });

      const mm = gsap.matchMedia();
      mm.add({ desktop: '(min-width: 1024px)', mobile: '(max-width: 1023px)' }, (context) => {
        const desktop = Boolean(context.conditions?.desktop);

        const timeline = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: scope,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });

        timeline
          // Copy leaves first, and in two speeds: the supporting lines go
          // quickly, the headline lingers and only drifts.
          .to(support, { opacity: 0, y: -24, duration: 0.2, stagger: 0.03 }, 0.08)
          .to(headline, { y: '-12svh', duration: 0.4 }, 0.08)
          .to(headline, { opacity: 0, duration: 0.18 }, 0.3)

          // The reel becomes the subject: in toward the centre, a touch smaller.
          .to(
            reelMove,
            desktop
              ? { x: '-16vw', y: '-6svh', scale: 0.8, duration: 0.37, ease: 'power1.inOut' }
              : { y: '-34svh', scale: 0.82, duration: 0.37, ease: 'power1.inOut' },
            0.08,
          )

          // Unwinding: the film slides out as the reel turns to release it.
          .to(film, { y: released, duration: 0.42, ease: 'power1.out' }, 0.28)
          .to(film, { y: fed, duration: 0.3 }, 0.7)
          .to(reelTurn, { rotation: 300, duration: 0.72 }, 0.28)

          // Into the film strip's world: blush ground, the reel steps back and
          // leaves the strip as the composition.
          .to(warm, { opacity: 1, duration: 0.3 }, 0.7)
          .to(reelBody, { opacity: 0, scale: 0.92, duration: 0.24 }, 0.74)
          .to(
            reelMove,
            desktop
              ? { x: '-36vw', scale: 0.9, duration: 0.3, ease: 'power1.inOut' }
              : { x: '-16vw', duration: 0.3, ease: 'power1.inOut' },
            0.7,
          );
      });

      return () => mm.revert();
    }, scope);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={root}
      className={`relative ${reduced ? '' : 'hero-height'}`}
      aria-labelledby="hero-title"
    >
      <div className="sticky top-0 flex h-[100svh] min-h-[36rem] flex-col overflow-hidden">
        {/* Ground: warm espresso-plum with a little atmosphere, neutral enough
            to open onto any of the four seasons. The blush layer is the film
            strip section's own ground, faded in at the end of the sequence. */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: '#261B21',
            backgroundImage: [
              'radial-gradient(60% 55% at 74% 38%, rgba(114,80,87,0.55), transparent 70%)',
              'radial-gradient(70% 60% at 8% 100%, rgba(75,45,40,0.85), transparent 70%)',
              'linear-gradient(180deg, #2B1D22 0%, #3B241E 100%)',
            ].join(', '),
          }}
          aria-hidden
        />
        <div data-hero-warm className="absolute inset-0 bg-blush opacity-0" aria-hidden />

        {/* ── The reel ─────────────────────────────────────────────────── */}
        <div
          className={[
            'pointer-events-none absolute z-[1]',
            // Mobile: large and centred under the copy.
            'bottom-[4svh] left-1/2 w-[min(84vw,26rem)] -translate-x-1/2',
            // Desktop: top right, beside the headline.
            'lg:bottom-auto lg:left-auto lg:right-[5vw] lg:top-[calc(var(--nav-height)+3svh)] lg:w-[min(40vw,34rem)] lg:translate-x-0',
          ].join(' ')}
          aria-hidden
        >
          <div data-reel-move className="relative aspect-square w-full will-change-transform">
            {/* The film, wound out from under the rim. Its clip starts at the
                reel's centre line, so the length appears to come out of the
                pack rather than rise into view. Held above the clip by inline
                style until GSAP takes it over, so it never flashes unwound. */}
            {!reduced && (
              <div className="absolute right-[4%] top-1/2 h-[240svh] w-[42%] overflow-hidden">
                <div
                  data-film
                  className="will-change-transform"
                  style={{ transform: 'translateY(-101%)' }}
                >
                  <FilmLength frames={frames} />
                </div>
              </div>
            )}

            <div data-reel-body className="absolute inset-0">
              <div
                className="absolute inset-[-10%] rounded-full blur-3xl"
                style={{ background: 'radial-gradient(circle, rgba(255,104,196,0.2), transparent 68%)' }}
              />
              <div data-reel-turn className="absolute inset-0 will-change-transform">
                <div className="absolute inset-0 animate-spin-reel">
                  <ReelRing />
                  <Image
                    src={BRAND.logo.src}
                    alt=""
                    width={BRAND.logo.width}
                    height={BRAND.logo.height}
                    priority
                    className="absolute inset-[15%] h-[70%] w-[70%] rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* The film runs on past the fold and dissolves into the next
            section's ground rather than being cut by the edge of the pin. */}
        <div
          data-hero-warm
          className="pointer-events-none absolute inset-x-0 -bottom-px z-[2] h-[26svh] opacity-0"
          style={{ backgroundImage: 'linear-gradient(180deg, rgba(254,233,234,0), #FEE9EA 78%)' }}
          aria-hidden
        />

        {/* ── The copy ─────────────────────────────────────────────────── */}
        <div className="shell relative z-10 flex flex-1 flex-col pt-[calc(var(--nav-height)+6svh)] lg:justify-end lg:pb-16 lg:pt-0">
          <p data-hero-support className="label text-cream/60">
            {HERO.eyebrow}
          </p>

          <h1
            id="hero-title"
            data-hero-headline
            className="mt-5 font-display text-[clamp(2.75rem,9vw,7.5rem)] leading-[0.95] tracking-[-0.025em] text-cream"
          >
            <RevealLines lines={HERO.lines} />
          </h1>

          <p data-hero-support className="mt-6 max-w-measure font-sans text-lg text-cream/80 sm:text-xl">
            {HERO.subline}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-5 lg:mt-10">
            <div data-hero-support>
              <Link
                href="/atelier"
                className="group relative inline-flex items-center gap-2.5 py-2 font-sans text-[0.8125rem] font-medium uppercase tracking-label text-cream"
              >
                {HERO.cta}
                <span
                  className="text-hotpink transition-transform duration-500 ease-editorial group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden
                >
                  ↗
                </span>
                {/* A pink rule that is always there, and runs full length on hover. */}
                <span
                  className="absolute bottom-0 left-0 h-[2px] w-10 bg-hotpink transition-[width] duration-500 ease-editorial group-hover:w-full group-focus-visible:w-full"
                  aria-hidden
                />
              </Link>
            </div>

            <div data-hero-support>
              <a
                href="#mevsimler"
                className="group inline-flex items-center gap-3 py-2 text-cream/70 transition-colors duration-500 hover:text-cream"
              >
                <span className="label">{HERO.scrollHint}</span>
                <span className="animate-scroll-hint text-sm leading-none" aria-hidden>
                  ↓
                </span>
              </a>
            </div>
          </div>
        </div>

        <span className="sr-only">{BRAND.taglineTr}</span>
      </div>
    </section>
  );
}

/**
 * The reel around the logo: a translucent disc, the wound film as a dark band
 * with its perforations, and four small chapter marks. Drawn thin — an
 * editorial reading of a reel, not a picture of one.
 */
function ReelRing() {
  const holes = Array.from({ length: 56 }, (_, i) => (i * 360) / 56);
  const marks = ['01', '02', '03', '04'];

  return (
    <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
      <defs>
        {/* Opaque, but in the hero's own tones — it reads as a tinted glass
            disc while still hiding the film wound underneath it. */}
        <radialGradient id="reel-disc">
          <stop offset="0%" stopColor="#3E2A2F" />
          <stop offset="100%" stopColor="#2C1E23" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="99" fill="url(#reel-disc)" stroke="rgba(255,251,244,0.22)" strokeWidth="0.4" />
      <circle cx="100" cy="100" r="88.5" fill="none" stroke={FILM_BASE} strokeOpacity="0.6" strokeWidth="15" />
      <circle cx="100" cy="100" r="96" fill="none" stroke="rgba(255,251,244,0.16)" strokeWidth="0.35" />
      <circle cx="100" cy="100" r="81" fill="none" stroke="rgba(255,251,244,0.16)" strokeWidth="0.35" />
      {holes.map((angle) => (
        <rect
          key={angle}
          x="98.6"
          y="5.2"
          width="2.8"
          height="1.8"
          rx="0.5"
          fill="#FEE9EA"
          opacity="0.28"
          transform={`rotate(${angle} 100 100)`}
        />
      ))}
      {marks.map((mark, i) => (
        <text
          key={mark}
          x="100"
          y="16.5"
          textAnchor="middle"
          fill="#FFFBF4"
          opacity="0.55"
          style={{ fontSize: 4.2, letterSpacing: '0.2em' }}
          className="font-sans"
          transform={`rotate(${45 + i * 90} 100 100)`}
        >
          {mark}
        </text>
      ))}
    </svg>
  );
}

/** One side's sprocket holes, for film running vertically. */
function Rail() {
  return (
    <svg className="h-full w-4 shrink-0 sm:w-5" aria-hidden>
      <defs>
        <pattern id="reel-perf" width="20" height="30" patternUnits="userSpaceOnUse">
          <rect x="5" y="9" width="10" height="16" rx="2.5" fill="#FEE9EA" opacity="0.9" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#reel-perf)" />
    </svg>
  );
}

/**
 * The unwound length. The leading end comes out first, so spring sits at the
 * bottom of the length — the first chapter is the first thing off the reel.
 */
function FilmLength({ frames }: { frames: ReelFrame[] }) {
  return (
    <div className="flex" style={{ backgroundColor: FILM_BASE }}>
      <Rail />
      <ol className="flex min-w-0 flex-1 flex-col-reverse gap-2 py-2">
        {/* The leader: blank stock ahead of the first frame. */}
        <li className="flex h-16 items-start justify-center pt-2 text-[0.5rem] uppercase tracking-[0.3em] text-cream/30">
          EBRUSHKOBAG
        </li>
        {frames.map(({ season, image }) => (
          <li key={season.id} className="relative">
            <div className="relative aspect-[4/5] overflow-hidden" style={{ backgroundColor: season.background }}>
              {image}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3">
                <span className="block text-[0.5rem] uppercase tracking-[0.25em] sm:text-[0.5625rem]" style={{ color: season.accent }}>
                  {season.index} / {season.labelEn}
                </span>
                <span className="mt-1 block font-display text-lg leading-none text-cream sm:text-2xl">
                  {season.label}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ol>
      <Rail />
    </div>
  );
}
