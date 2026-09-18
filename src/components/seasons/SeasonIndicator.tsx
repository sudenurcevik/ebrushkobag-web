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
      {/* Desktop: quiet vertical index at the right edge. */}
      <nav
        aria-label="Mevsim bölümleri"
        className={[
          'pointer-events-none fixed right-[max(1.25rem,3vw)] top-1/2 z-40 hidden -translate-y-1/2 lg:block',
          'transition-opacity duration-500 ease-editorial',
          visible ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
      >
        <ol className={visible ? 'pointer-events-auto space-y-4' : 'space-y-4'}>
          {seasons.map((season) => {
            const isActive = season.id === active;
            return (
              <li key={season.id}>
                <a
                  href={`#${season.slug}`}
                  aria-current={isActive ? 'true' : undefined}
                  className="flex items-center justify-end gap-3 transition-opacity duration-500 ease-editorial"
                  style={{ color: ink, opacity: isActive ? 1 : 0.35 }}
                >
                  <span className="label">{season.index}</span>
                  <span className="text-[0.6875rem] uppercase tracking-label">{season.label}</span>
                  <span
                    className="block h-[2px] rounded-full transition-all duration-500 ease-editorial"
                    style={{ width: isActive ? 28 : 12, backgroundColor: isActive ? accent : ink }}
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
          className="flex items-center gap-1 rounded-full px-2 py-1.5 backdrop-blur-sm"
          style={{ backgroundColor: `${ground}E6`, boxShadow: `0 0 0 1px ${accent}55` }}
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
