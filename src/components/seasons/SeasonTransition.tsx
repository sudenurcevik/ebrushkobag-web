'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Season, SeasonBridge } from '@/data/types';
import { phase, sampleStops } from '@/lib/color';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { KnitTexture } from './KnitTexture';
import { ThreadPath } from './ThreadPath';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * THE SIGNATURE TRANSITION (plan §9–§16)
 *
 *   thread → macro knit → colour morph → new textile → zoom out → next season
 *
 * The previous season does not fade away and get replaced. Its yarn is followed
 * into the weave of the bag, the weave changes colour, and the next season is
 * knitted out of it.
 *
 * Choreography, as scroll progress through the section:
 *
 *   0–12%    outgoing season still whole
 *   12–44%   the thread draws itself in, all the way across the frame
 *   28–56%   the camera pushes into the product's textile, softening as it goes
 *   50–72%   fullscreen macro; the palette morphs on the same unbroken strand
 *   70–88%   the new name arrives and the thread stitches a line beneath it
 *   84–100%  zoom back out, sharpening into the next season's product
 *
 * The strand is drawn once and never re-drawn. An earlier cut had it leave the
 * frame and come back, which read as two threads rather than one continuing —
 * the whole point of the section is that it is the *same* yarn.
 *
 * GSAP owns this section and nothing else on the page owns it too (plan §34):
 * transforms are scrubbed by a single timeline, and colour — which GSAP cannot
 * interpolate across an arbitrary stop list — is written to CSS variables in one
 * `onUpdate`. No React state changes while scrolling.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export function SeasonTransition({
  bridge,
  from,
  to,
  outgoingImage,
  incomingImage,
  macroImage,
}: {
  bridge: SeasonBridge;
  from: Season;
  to: Season;
  /** Rendered on the server so photography keeps next/image optimisation. */
  outgoingImage: ReactNode;
  incomingImage: ReactNode;
  /** The real macro photograph, when it exists. Crossfades over the drawn one. */
  macroImage: ReactNode | null;
}) {
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (reduced || !root.current) return;

    gsap.registerPlugin(ScrollTrigger);
    const scope = root.current;

    const ctx = gsap.context(() => {
      const stage = scope.querySelector<HTMLElement>('[data-stage]');
      const outgoing = scope.querySelector<HTMLElement>('[data-outgoing]');
      const macro = scope.querySelector<HTMLElement>('[data-macro]');
      const macroPhoto = scope.querySelector<HTMLElement>('[data-macro-photo]');
      const threadWrap = scope.querySelector<HTMLElement>('[data-thread-wrap]');
      const title = scope.querySelector<HTMLElement>('[data-title]');
      const whisper = scope.querySelector<HTMLElement>('[data-whisper]');
      const incoming = scope.querySelector<HTMLElement>('[data-incoming]');
      const underline = scope.querySelector<SVGPathElement>('[data-underline]');
      const strands = gsap.utils.toArray<SVGPathElement>('[data-thread]', scope);
      if (!stage || !outgoing || !macro || !threadWrap || !title || !incoming) return;

      // Measure the strand once and dash both paths from the same length, so
      // the fibre highlight draws exactly with the yarn.
      const strand = strands.find((path) => path.dataset.thread === 'strand');
      const length = strand ? strand.getTotalLength() : 1000;
      gsap.set(strands, { strokeDasharray: length, strokeDashoffset: length });

      gsap.set(macro, { opacity: 0, scale: 1.35 });
      gsap.set(macroPhoto, { opacity: 0 });
      gsap.set(threadWrap, { opacity: 0 });
      gsap.set(title, { opacity: 0, y: 40 });
      gsap.set(whisper, { opacity: 0 });
      gsap.set(outgoing, { filter: 'blur(0px)' });
      gsap.set(incoming, { opacity: 0, scale: 3, filter: 'blur(10px)' });
      if (underline) gsap.set(underline, { strokeDasharray: 300, strokeDashoffset: 300 });

      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: scope,
          start: 'top top',
          end: 'bottom bottom',
          // A full second of catch-up: the section is meant to feel heavier and
          // slower than the rest of the page, and the smoothing is most of that.
          scrub: 1,
          // Colour is written straight to CSS variables: one style write per
          // frame, no re-render, and arbitrary multi-stop morphs.
          onUpdate: (self) => {
            const p = self.progress;
            stage.style.setProperty('--thread-color', sampleStops(bridge.threadStops, phase(p, 0.12, 0.88)));
            stage.style.setProperty('--bridge-ground', sampleStops(bridge.groundStops, phase(p, 0.3, 0.8)));

            const knit = phase(p, 0.45, 0.78);
            stage.style.setProperty('--knit-yarn', sampleStops([bridge.knitFrom.yarn, bridge.knitTo.yarn], knit));
            stage.style.setProperty('--knit-shade', sampleStops([bridge.knitFrom.shade, bridge.knitTo.shade], knit));
            stage.style.setProperty('--knit-ground', sampleStops([bridge.knitFrom.ground, bridge.knitTo.ground], knit));
          },
        },
      });

      timeline
        // 12–44% — the thread arrives and finishes. A generous window: the draw
        // completing is the promise the rest of the section is built on.
        .to(threadWrap, { opacity: 1, duration: 0.05 }, 0.1)
        .to(strands, { strokeDashoffset: 0, duration: 0.32, ease: 'power1.out' }, 0.12)

        // 28–56% — into the textile. The bag stops being a bag, and goes soft as
        // it grows, the way a real lens loses it on the way in.
        .to(outgoing, { scale: 3.1, duration: 0.3, ease: 'power1.in' }, 0.28)
        .to(outgoing, { filter: 'blur(9px)', duration: 0.22 }, 0.34)
        .to(outgoing, { opacity: 0, duration: 0.12 }, 0.46)
        .to(macro, { opacity: 1, duration: 0.14 }, 0.38)
        .to(macro, { scale: 1, duration: 0.34, ease: 'power1.out' }, 0.38)

        // 50–72% — the macro world; the palette morphs via onUpdate above while
        // the same unbroken strand lies across it.
        .to(whisper, { opacity: 1, duration: 0.05 }, 0.5)
        .to(macroPhoto, { opacity: 1, duration: 0.12 }, 0.54)
        .to(whisper, { opacity: 0, duration: 0.05 }, 0.68)

        // 70–88% — the new chapter arrives and the thread stitches under it.
        .to(title, { opacity: 1, y: 0, duration: 0.1, ease: 'power2.out' }, 0.7)
        .to(underline, { strokeDashoffset: 0, duration: 0.12, ease: 'power1.out' }, 0.76)

        // 84–100% — back out, sharpening into the next season's product.
        .to(threadWrap, { opacity: 0, duration: 0.08 }, 0.8)
        .to(macro, { scale: 0.82, opacity: 0, duration: 0.16, ease: 'power1.in' }, 0.84)
        .to(incoming, { opacity: 1, duration: 0.1 }, 0.84)
        .to(incoming, { scale: 1, duration: 0.16, ease: 'power1.out' }, 0.84)
        .to(incoming, { filter: 'blur(0px)', duration: 0.14 }, 0.86)
        .to(title, { opacity: 0, y: -24, duration: 0.07 }, 0.93);

      setReady(true);
    }, scope);

    return () => ctx.revert();
  }, [bridge, reduced]);

  // ── Reduced motion (plan §36) ──────────────────────────────────────────
  // Same story, told without the journey: the ground changes colour, the new
  // chapter name arrives, and nothing pins or zooms.
  if (reduced) {
    return (
      <section
        aria-label={`${from.label} bölümünden ${to.label} bölümüne geçiş`}
        className="flex min-h-[55svh] flex-col items-center justify-center gap-6 px-gutter py-24 text-center"
        style={{ backgroundColor: to.background, color: to.ink }}
      >
        <p className="label" style={{ color: to.accent }}>
          {to.index} / {to.labelEn}
        </p>
        <p className="font-display text-display-md" style={{ letterSpacing: '0.12em' }}>
          {to.label}
        </p>
        <p className="max-w-measure font-display text-xl italic" style={{ color: to.inkSoft }}>
          {bridge.whisper}
        </p>
      </section>
    );
  }

  return (
    <section
      ref={root}
      className="bridge-height relative"
      aria-label={`${from.label} bölümünden ${to.label} bölümüne geçiş`}
    >
      <div
        data-stage
        className="sticky top-0 h-[100svh] w-full overflow-hidden"
        style={{ backgroundColor: 'var(--bridge-ground)' }}
      >
        {/* 1 — the season we are leaving, pushed into until it is only texture */}
        <div
          data-outgoing
          className="absolute inset-0 flex items-center justify-center will-change-transform"
        >
          <div className="h-[62svh] w-[min(78vw,30rem)] overflow-hidden rounded-[2rem]">
            {outgoingImage}
          </div>
        </div>

        {/* 2 — the macro world: drawn texture, with the real photograph over it */}
        <div data-macro className="absolute inset-0 will-change-transform">
          <KnitTexture id={bridge.id} className="absolute inset-0" tile={132} />
          {macroImage && (
            <div data-macro-photo className="absolute inset-0">
              {macroImage}
            </div>
          )}
        </div>

        {/* 3 — the thread itself */}
        <div data-thread-wrap className="pointer-events-none absolute inset-0">
          <ThreadPath id={bridge.id} className="h-full w-full" />
        </div>

        {/* 4 — the incoming chapter, knitted out of the texture */}
        <div
          data-title
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4 px-gutter text-center"
        >
          {/* Ink, not the accent: by this point the field is the incoming
              season's own yarn, and an accent-coloured label disappears into
              it — summer's yellow on summer's yellow knit, silver on silver. */}
          <span className="label" style={{ color: to.ink, opacity: 0.75 }}>
            {to.index} / {to.labelEn}
          </span>
          <span
            className="font-display text-display-lg leading-none"
            style={{ color: to.ink, letterSpacing: '0.16em' }}
          >
            {to.label}
          </span>

          {/* The same thread, stitching a line under the new name (plan §15) —
              a short run of back-stitch, not a traced outline of the letters. */}
          <svg
            viewBox="0 0 300 16"
            className="mt-2 h-4 w-[min(70vw,22rem)]"
            fill="none"
            aria-hidden
          >
            <path
              d="M 4 9 C 40 2, 70 14, 106 8 C 142 2, 170 14, 206 8 C 240 2, 268 13, 296 8"
              stroke="var(--thread-color)"
              strokeWidth="5"
              strokeLinecap="round"
              data-underline
            />
          </svg>
        </div>

        {/* 5 — one line, deep inside the texture */}
        <p
          data-whisper
          className="pointer-events-none absolute inset-x-0 bottom-[12%] px-gutter text-center font-display text-2xl italic sm:text-3xl"
          style={{ color: to.ink }}
        >
          {bridge.whisper}
        </p>

        {/* 6 — the season we arrive in */}
        <div
          data-incoming
          className="absolute inset-0 flex items-center justify-center will-change-transform"
        >
          <div className="h-[62svh] w-[min(78vw,30rem)] overflow-hidden rounded-[2rem]">
            {incomingImage}
          </div>
        </div>

        {/* Until GSAP has set the opening state, nothing should be half-drawn. */}
        {!ready && <div className="absolute inset-0" style={{ backgroundColor: from.background }} />}
      </div>
    </section>
  );
}
