'use client';

import { forwardRef } from 'react';

/**
 * The yarn strand that carries one season into the next (plan §11).
 *
 * Both paths carry `data-thread` so the transition can set the dash on each of
 * them from one measured length — the highlight tracks the strand exactly.
 *
 * It is a single loose path with a couple of gentle sags — it should read as a
 * length of yarn lying across the frame, not as a decorative squiggle. Drawing
 * is `stroke-dashoffset` driven by scroll progress, and the colour is a CSS
 * variable so the strand can change season mid-draw.
 */
export const ThreadPath = forwardRef<SVGPathElement, { className?: string; id: string }>(
  function ThreadPath({ className = '', id }, ref) {
    const shadowId = `thread-shadow-${id}`;

    return (
      <svg
        className={className}
        viewBox="0 0 1000 620"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        aria-hidden
      >
        <defs>
          <filter id={shadowId} x="-10%" y="-40%" width="120%" height="180%">
            <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#000000" floodOpacity="0.18" />
          </filter>
        </defs>

        <g filter={`url(#${shadowId})`}>
          {/* The strand: enters left, sags, loops over itself, leaves right. */}
          <path
            ref={ref}
            d="M -40 250
               C 150 130, 250 420, 420 330
               C 560 255, 545 95, 660 150
               C 775 205, 700 400, 830 395
               C 930 399, 980 300, 1060 250"
            stroke="var(--thread-color)"
            strokeWidth="14"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            data-thread="strand"
          />
          {/* Fibre highlight, offset slightly so the strand reads as round. */}
          <path
            d="M -40 246
               C 150 126, 250 416, 420 326
               C 560 251, 545 91, 660 146
               C 775 201, 700 396, 830 391
               C 930 395, 980 296, 1060 246"
            stroke="#FFFFFF"
            strokeOpacity="0.32"
            strokeWidth="3"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            data-thread="highlight"
          />
        </g>
      </svg>
    );
  },
);
