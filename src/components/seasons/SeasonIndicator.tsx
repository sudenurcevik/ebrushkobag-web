'use client';

import { useEffect, useState } from 'react';
import type { Season } from '@/data/types';

/**
 * The chapter navigator (plan §20).
 *
 * A vertical index at the edge of the viewport on desktop, a compact horizontal
 * strip on touch. It appears only while the visitor is inside the seasonal part
 * of the page, takes its active colour from the season currently on screen, and
 * never tries to stand in for the main navigation.
 */
export function SeasonIndicator({ seasons }: { seasons: Season[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('[data-season]');
    if (sections.length === 0) return;

    // Track the ratio of each chapter rather than the first to intersect, so a
    // tall chapter scrolling past a short one still wins.
    const ratios = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.season;
          if (id) ratios.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }

        let best: string | null = null;
        let bestRatio = 0;
        ratios.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            best = id;
            bestRatio = ratio;
          }
        });

        setActive(bestRatio > 0.08 ? best : null);
      },
      { threshold: [0, 0.08, 0.25, 0.5, 0.75, 1] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const activeSeason = seasons.find((season) => season.id === active);
  const visible = Boolean(activeSeason);
  const accent = activeSeason?.accent ?? '#FF68C4';
  const ink = activeSeason?.ink ?? '#241A20';
  const ground = activeSeason?.background ?? '#FEE9EA';

  return (
    <>
      {/*
        Desktop: a narrow index in the right margin — number and rule only, so
        it fits in the gutter beside a full-width layout instead of forcing the
        chapters to reserve space for it. The name is always in the accessible
        name and slides out on hover or keyboard focus.
      */}
      <nav
        aria-label="Mevsim bölümleri"
        className={[
          'fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 lg:block',
          'transition-opacity duration-500 ease-editorial',
          visible ? 'opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
      >
        <ol className="space-y-5">
          {seasons.map((season) => {
            const isActive = season.id === active;
            return (
              <li key={season.id} className="group relative flex justify-end">
                <a
                  href={`#${season.slug}`}
                  aria-current={isActive ? 'true' : undefined}
                  aria-label={`${season.index} ${season.label}`}
                  className="flex items-center gap-2 py-1 pl-2 transition-opacity duration-500 ease-editorial"
                  style={{
                    color: ink,
                    opacity: isActive ? 1 : 0.4,
                    // The chapter image now bleeds to the edge behind this, so
                    // the marks carry a halo in the page colour to stay legible
                    // over whatever photograph is underneath.
                    textShadow: `0 0 10px ${ground}, 0 0 4px ${ground}`,
                    filter: `drop-shadow(0 0 6px ${ground})`,
                  }}
                >
                  {/* Slides out of the gutter only while pointed at or focused. */}
                  <span
                    className="pointer-events-none absolute right-full mr-2 whitespace-nowrap rounded-full px-3 py-1.5 text-[0.625rem] uppercase tracking-label opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
                    style={{ backgroundColor: ground, color: ink, boxShadow: `0 0 0 1px ${accent}55` }}
                    aria-hidden
                  >
                    {season.label}
                  </span>
                  <span className="text-[0.625rem] font-medium tabular-nums tracking-label" aria-hidden>
                    {season.index}
                  </span>
                  <span
                    className="block h-[2px] rounded-full transition-all duration-500 ease-editorial"
                    style={{ width: isActive ? 22 : 10, backgroundColor: isActive ? accent : ink }}
                    aria-hidden
                  />
                </a>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Touch: one compact strip, out of the way of the thumb. */}
      <nav
        aria-label="Mevsim bölümleri"
        className={[
          'fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 lg:hidden',
          'transition-opacity duration-500 ease-editorial',
          visible ? 'opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
      >
        <ol
          // Solid rather than a blurred panel: a backdrop filter on a fixed
          // element is re-composited against everything scrolling behind it,
          // which is exactly the wrong cost on a phone.
          className="flex items-center gap-1 rounded-full px-2 py-1.5"
          style={{ backgroundColor: ground, boxShadow: `0 0 0 1px ${accent}55` }}
        >
          {seasons.map((season) => {
            const isActive = season.id === active;
            return (
              <li key={season.id}>
                <a
                  href={`#${season.slug}`}
                  aria-current={isActive ? 'true' : undefined}
                  className="block rounded-full px-3 py-1.5 text-[0.625rem] uppercase tracking-label transition-colors duration-400"
                  style={{
                    backgroundColor: isActive ? accent : 'transparent',
                    color: isActive ? ground : ink,
                    opacity: isActive ? 1 : 0.55,
                  }}
                >
                  {season.label}
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
