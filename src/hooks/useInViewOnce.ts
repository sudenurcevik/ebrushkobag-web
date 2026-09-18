'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * One IntersectionObserver per revealed element, disconnected the moment it
 * fires. Deliberately not a scroll listener: the reveal itself is a CSS
 * transition, so scrolling stays off the JS main thread (plan §35).
 */
export function useInViewOnce<T extends HTMLElement>(
  { amount = 0.25, once = true }: { amount?: number; once?: boolean } = {},
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setInView(false);
          }
        }
      },
      // Clamped: `amount: 1` on an element taller than the viewport never fires.
      { threshold: Math.min(amount, 0.9), rootMargin: '0px 0px -5% 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [amount, once]);

  return [ref, inView];
}
