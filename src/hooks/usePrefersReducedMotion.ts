'use client';

import { useEffect, useState } from 'react';

/**
 * Tracks the reduced-motion preference, including changes made while the page is
 * open. The signature seasonal transition checks this and renders its calm
 * alternative instead (plan §36).
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
