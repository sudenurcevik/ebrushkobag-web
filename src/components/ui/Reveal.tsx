'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useInViewOnce } from '@/hooks/useInViewOnce';

type Element = 'div' | 'section' | 'li' | 'figure' | 'p' | 'span' | 'ol' | 'ul';

/**
 * The site's reveal primitive.
 *
 * The motion is a CSS transition; this component only decides *when* to flip
 * `data-visible`. Scrolling stays off the JS main thread, and because the hiding
 * rules are scoped to `[data-js]` — set by a one-line bootstrap in the layout —
 * a blocked or failed bundle leaves the page fully readable rather than blank
 * (plan §38: content must remain accessible without animation).
 */
export function Reveal({
  children,
  className,
  delay = 0,
  direction = 'up',
  amount = 0.25,
  as = 'div',
  style,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'none';
  amount?: number;
  as?: Element;
  /** Merged with the stagger delay — for layout values a class cannot express. */
  style?: CSSProperties;
}) {
  const [ref, inView] = useInViewOnce<HTMLDivElement>({ amount });
  const Component = as as 'div';

  return (
    <Component
      ref={ref}
      className={className}
      data-reveal={direction}
      data-visible={inView ? 'true' : 'false'}
      style={delay ? { ...style, transitionDelay: `${delay}s` } : style}
    >
      {children}
    </Component>
  );
}

/** Line-by-line reveal for the large editorial headlines. */
export function RevealLines({
  lines,
  className,
  lineClassName,
  delay = 0,
  amount = 0.45,
}: {
  lines: ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  amount?: number;
}) {
  const [ref, inView] = useInViewOnce<HTMLSpanElement>({ amount });

  return (
    <span ref={ref} className={className}>
      {lines.map((line, index) => (
        <span key={index} className="block overflow-hidden">
          <span
            className={`block ${lineClassName ?? ''}`}
            data-reveal-line=""
            data-visible={inView ? 'true' : 'false'}
            style={{ transitionDelay: `${delay + index * 0.08}s` }}
          >
            {line}
          </span>
        </span>
      ))}
    </span>
  );
}
