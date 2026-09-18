import type { DetailOption, HandleOption, YarnOption } from '@/data/types';

/**
 * Material thumbnails for the selectors. When the brand's macro photography
 * exists it is used; until then each material is drawn — crochet stitches for
 * yarn, scattered trim for details, a section of strap for handles.
 *
 * Never a bare colour dot: a dot tells you nothing about a hand-knitted surface,
 * and the plan is explicit about touch-friendly material thumbnails (§26, §37).
 */

export function YarnSwatch({ option, className = '' }: { option: YarnOption; className?: string }) {
  const id = `yarn-${option.id}`;
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <pattern id={id} width="25" height="19" patternUnits="userSpaceOnUse">
          <path
            d="M 2 17 L 12.5 3 L 23 17"
            fill="none"
            stroke={option.shadeHex}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.5"
          />
          <path d="M 2 17 L 12.5 3" fill="none" stroke="#FFFFFF" strokeWidth="1.4" opacity="0.22" />
        </pattern>
      </defs>
      <rect width="100" height="100" fill={option.hex} />
      <rect width="100" height="100" fill={`url(#${id})`} />
    </svg>
  );
}

export function DetailSwatch({ option, className = '' }: { option: DetailOption; className?: string }) {
  if (option.style === 'none') {
    return (
      <svg viewBox="0 0 100 100" className={className} aria-hidden>
        <rect width="100" height="100" fill="#F3E4E6" />
        <path d="M 26 74 L 74 26" stroke="#8F8189" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  const points = [
    [30, 32],
    [63, 26],
    [46, 53],
    [74, 60],
    [26, 66],
    [56, 79],
  ];

  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <rect width="100" height="100" fill="#F3E4E6" />
      {points.map(([cx, cy], index) => (
        <g key={index}>
          <circle cx={cx} cy={cy} r={option.style === 'bead' ? 12 : 10} fill={option.hex} />
          {option.style === 'bead' && <circle cx={cx} cy={cy} r="3.2" fill="#000000" opacity="0.32" />}
          <ellipse
            cx={cx - 3.5}
            cy={cy - 4}
            rx="3.8"
            ry="2.4"
            fill={option.sheenHex}
            opacity="0.7"
          />
        </g>
      ))}
    </svg>
  );
}

export function HandleSwatch({ option, className = '' }: { option: HandleOption; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <rect width="100" height="100" fill="#F3E4E6" />
      {option.style === 'chain' ? (
        <>
          <path d="M 8 50 H 92" stroke={option.shadeHex} strokeWidth="26" strokeDasharray="16 10" strokeLinecap="round" />
          <path d="M 8 50 H 92" stroke={option.hex} strokeWidth="16" strokeDasharray="9 17" strokeDashoffset="13" strokeLinecap="round" />
        </>
      ) : option.style === 'knit' ? (
        <>
          <path d="M 4 50 H 96" stroke={option.shadeHex} strokeWidth="36" />
          <path d="M 4 50 H 96" stroke={option.hex} strokeWidth="28" strokeDasharray="14 10" />
          <path d="M 4 42 H 96" stroke="#FFFFFF" strokeWidth="4" strokeDasharray="7 17" opacity="0.28" />
        </>
      ) : option.style === 'wood' ? (
        <>
          <path d="M 4 50 H 96" stroke={option.shadeHex} strokeWidth="40" />
          <path d="M 4 50 H 96" stroke={option.hex} strokeWidth="30" />
          <path d="M 4 40 H 96" stroke="#FFFFFF" strokeWidth="5" opacity="0.25" />
        </>
      ) : (
        <>
          <path d="M 4 50 H 96" stroke={option.shadeHex} strokeWidth="38" />
          <path d="M 4 50 H 96" stroke={option.hex} strokeWidth="30" />
          <path d="M 4 39 H 96" stroke="#FFFFFF" strokeWidth="1.8" strokeDasharray="6 7" opacity="0.25" />
        </>
      )}
    </svg>
  );
}
