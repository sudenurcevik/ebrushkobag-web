'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, type ReactNode } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * The opening image settles as the page moves — a slow de-scale and a small
 * drift, nothing more (plan §7: "very subtle image scale on scroll").
 *
 * GSAP already runs on this page for the seasonal bridges, so the hero borrows
 * it rather than pulling a second animation library into the bundle.
 */
export function HeroMedia({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced || !root.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-hero-media]',
        { scale: 1.08, yPercent: 0 },
        {
          scale: 1,
          yPercent: 8,
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.5,
          },
        },
      );
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <div ref={root} className="absolute inset-0 overflow-hidden">
      <div data-hero-media className="absolute inset-0 will-change-transform">
        {children}
      </div>
    </div>
  );
}
