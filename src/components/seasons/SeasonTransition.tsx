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
 *   0–15%    outgoing season still whole
 *   15–34%   the thread draws itself in
 *   30–52%   the camera pushes into the product's textile
 *   50–70%   fullscreen macro; the palette morphs
 *   70–84%   the thread returns in the new colour and underlines the new name
 *   82–100%  zoom back out into the next season's product
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
      gsap.set(incoming, { opacity: 0, scale: 3 });

      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: scope,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          // Colour is written straight to CSS variables: one style write per
          // frame, no re-render, and arbitrary multi-stop morphs.
          onUpdate: (self) => {
            const p = self.progress;
            stage.style.setProperty('--thread-color', sampleStops(bridge.threadStops, phase(p, 0.1, 0.9)));
            stage.style.setProperty('--bridge-ground', sampleStops(bridge.groundStops, phase(p, 0.3, 0.8)));

            const knit = phase(p, 0.45, 0.78);
            stage.style.setProperty('--knit-yarn', sampleStops([bridge.knitFrom.yarn, bridge.knitTo.yarn], knit));
            stage.style.setProperty('--knit-shade', sampleStops([bridge.knitFrom.shade, bridge.knitTo.shade], knit));
            stage.style.setProperty('--knit-ground', sampleStops([bridge.knitFrom.ground, bridge.knitTo.ground], knit));
          },
        },
      });

      // 15–34% — the thread arrives, drawing itself from the edge of the frame.
      timeline
        .to(threadWrap, { opacity: 1, duration: 0.04 }, 0.15)
        .to(strands, { strokeDashoffset: 0, duration: 0.19 }, 0.15)

        // 30–52% — into the textile. The bag stops being a bag.
        .to(outgoing, { scale: 3.1, duration: 0.24 }, 0.3)
        .to(outgoing, { opacity: 0, duration: 0.1 }, 0.44)
        .to(macro, { opacity: 1, duration: 0.14 }, 0.36)
        .to(macro, { scale: 1, duration: 0.3 }, 0.36)

        // 50–70% — the macro world; palette morphs via onUpdate above.
        .to(whisper, { opacity: 1, duration: 0.06 }, 0.52)
        .to(macroPhoto, { opacity: 1, duration: 0.12 }, 0.54)
        .to(whisper, { opacity: 0, duration: 0.05 }, 0.66)

        // The strand leaves and comes back wearing the next season.
        .to(strands, { strokeDashoffset: -length, duration: 0.12 }, 0.58)
        .set(strands, { strokeDashoffset: length }, 0.7)
        .to(strands, { strokeDashoffset: 0, duration: 0.12 }, 0.7)

        // 70–84% — the new chapter name is knitted in.
        .to(title, { opacity: 1, y: 0, duration: 0.1 }, 0.72)

        // 82–100% — back out, into the next season's product.
        .to(macro, { scale: 0.78, opacity: 0, duration: 0.14 }, 0.85)
        .to(threadWrap, { opacity: 0, duration: 0.06 }, 0.86)
        .to(incoming, { opacity: 1, duration: 0.09 }, 0.85)
        .to(incoming, { scale: 1, duration: 0.15 }, 0.85)
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
          <span className="label" style={{ color: to.accent }}>
            {to.index} / {to.labelEn}
          </span>
          <span
            className="font-display text-display-lg leading-none"
            style={{ color: to.ink, letterSpacing: '0.16em' }}
          >
            {to.label}
          </span>
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
