'use client';

import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';
import { BRAND } from '@/config/brand';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * The logo gets exactly one appearance at the top of the page, and this is it
 * (plan §3 — the artwork is used as delivered and never redrawn).
 *
 * It is background, not a badge: held at low opacity, bled off the top-right
 * corner so only part of the disc is ever in frame, and painted underneath the
 * hero's gradient so the photograph washes over it.
 *
 * Two motions, both slow enough to read as texture rather than animation: the
 * yarn ball turns continuously in CSS, and the whole mark drifts and fades as
 * the page scrolls, so it settles behind the type instead of tracking it.
 *
 * `aria-hidden`: the wordmark in the navigation already names the brand, and
 * the headline carries the meaning here.
 */
export function HeroLogo() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced || !root.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        root.current,
        { yPercent: -3, opacity: 1 },
        {
          yPercent: 14,
          opacity: 0.25,
          ease: 'none',
          scrollTrigger: {
            trigger: root.current?.parentElement,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.6,
          },
        },
      );
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <div
      ref={root}
      aria-hidden
      className="pointer-events-none absolute right-[-22vw] top-[-12svh] z-[1] w-[min(124vw,54rem)] will-change-transform sm:right-[-16vw] lg:right-[-10vw]"
    >
      {/* A faint bloom so the disc has an edge to sit against. */}
      <div
        className="absolute inset-[-8%] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(255,104,196,0.22), transparent 70%)' }}
      />
      <Image
        src={BRAND.logo.src}
        alt=""
        width={BRAND.logo.width}
        height={BRAND.logo.height}
        priority
        className="relative w-full animate-spin-slow rounded-full opacity-[0.22]"
      />
    </div>
  );
}
