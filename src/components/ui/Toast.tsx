'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/** One quiet confirmation line, used after copy actions. */
export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const show = useCallback((next: string) => {
    setMessage(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMessage(null), 3200);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return { message, show };
}

/**
 * Always mounted, so the live region is stable for screen readers and the
 * show/hide is a plain CSS transition.
 */
export function Toast({ message }: { message: string | null }) {
  const [last, setLast] = useState('');

  useEffect(() => {
    if (message) setLast(message);
  }, [message]);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex justify-center px-4 lg:bottom-8"
      role="status"
      aria-live="polite"
    >
      <p
        className={[
          'rounded-full bg-ink px-6 py-3.5 text-center text-[0.6875rem] font-medium uppercase tracking-label text-cream',
          'transition-[opacity,transform] duration-500 ease-editorial',
          message ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
        ].join(' ')}
      >
        {last}
      </p>
    </div>
  );
}
