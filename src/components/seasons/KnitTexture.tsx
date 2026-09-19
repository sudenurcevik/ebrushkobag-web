'use client';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * PROCEDURAL CROCHET TEXTURE
 *
 * The macro world between two seasons (plan §13). It is drawn rather than
 * photographed for three reasons: it can be re-coloured continuously as the
 * scroll morphs one season's palette into the next, it costs nothing to load,
 * and it works today while the brand's macro photography is still being shot.
 *
 * When a real macro photograph exists it crossfades *over* this layer, so the
 * drawn texture becomes the fallback rather than the final look.
 *
 * Colours are baked in as literal attributes rather than read from CSS
 * variables. Writing a variable this field depends on invalidates paint for the
 * whole full-screen pattern, and doing that once per scroll frame was the single
 * most expensive thing on the page — on a phone it was most of the stutter. The
 * transition now stacks two of these, one per palette, and cross-fades them:
 * opacity is a compositor property, so the morph costs no paint at all.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export function KnitTexture({
  className = '',
  /** Tile size in px. Larger reads as a closer macro crop — and repeats less. */
  tile = 96,
  opacity = 1,
  id,
  yarn,
  shade,
  ground,
}: {
  className?: string;
  tile?: number;
  opacity?: number;
  id: string;
  yarn: string;
  shade: string;
  ground: string;
}) {
  const patternId = `knit-${id}`;
  const shadowId = `knit-shadow-${id}`;

  return (
    <svg
      className={className}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      style={{ opacity }}
    >
      <defs>
        {/*
          One crochet repeat: two interlocking V loops, a shadow pass beneath and
          a fibre highlight above. Stroke widths are relative to the tile so the
          texture holds up at any zoom.
        */}
        <pattern id={patternId} width={tile} height={tile * 0.58} patternUnits="userSpaceOnUse">
          <rect width={tile} height={tile * 0.58} fill={ground} />

          {/*
            A stockinette V. Rows are packed tightly enough that the ground
            barely shows — knitted fabric has no gaps in it — and each row is
            drawn three times at half-tile offsets so the columns interlock
            like real stitches instead of lining up into a grid.
          */}
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            {[-0.5, 0, 0.5].map((offset) => {
              const x = offset * tile;
              const v = `M ${x + tile * 0.02} ${tile * 0.56} L ${x + tile * 0.5} ${tile * 0.04} L ${x + tile * 0.98} ${tile * 0.56}`;
              const lit = `M ${x + tile * 0.06} ${tile * 0.5} L ${x + tile * 0.5} ${tile * 0.02}`;
              return (
                <g key={offset}>
                  <path d={v} stroke={shade} strokeWidth={tile * 0.36} opacity="0.85" />
                  <path d={v} stroke={yarn} strokeWidth={tile * 0.26} />
                  <path d={lit} stroke="#FFFFFF" strokeWidth={tile * 0.05} opacity="0.28" />
                </g>
              );
            })}
          </g>
        </pattern>

        {/* Depth: a macro crop is never evenly lit. */}
        <radialGradient id={shadowId} cx="0.5" cy="0.45" r="0.75">
          <stop offset="0%" stopColor="#000000" stopOpacity="0" />
          <stop offset="70%" stopColor="#000000" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
        </radialGradient>
      </defs>

      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      <rect width="100%" height="100%" fill={`url(#${shadowId})`} />
    </svg>
  );
}
