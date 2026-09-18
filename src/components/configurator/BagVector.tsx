import type { BagModel, DetailOption, HandleOption, YarnOption } from '@/data/types';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * VECTOR BAG — the preview that ships before the photography does.
 *
 * Drawn on the same 2000×2000 registration as the configurator's image layers
 * and in the same order (shadow → body → detail → handle → highlight), so
 * swapping in real .webp layers is a straight substitution: geometry, anchor
 * points and stacking already agree.
 *
 * Everything is deterministic — the stitch grid and the bead scatter are seeded
 * from the model id — so server and client render identically and the PNG export
 * matches the screen. Colour-carrying paint is set through `style` so a change
 * of yarn, bead or handle transitions rather than cutting.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const CANVAS = 1000;

/** Frames the silhouettes so the bag fills ~80% of the square. */
const FRAME_SCALE = 1.28;
const FRAME_ORIGIN = { x: 500, y: 500 };
const FRAME_TRANSFORM =
  `translate(${FRAME_ORIGIN.x} ${FRAME_ORIGIN.y}) scale(${FRAME_SCALE}) ` +
  `translate(${-FRAME_ORIGIN.x} ${-FRAME_ORIGIN.y})`;

const COLOUR_TRANSITION =
  'fill 320ms cubic-bezier(0.22, 1, 0.36, 1), stroke 320ms cubic-bezier(0.22, 1, 0.36, 1)';
const tint = (value: string) => ({ fill: value, transition: COLOUR_TRANSITION });
const ink = (value: string) => ({ stroke: value, transition: COLOUR_TRANSITION });

interface Geometry {
  body: string;
  anchors: [[number, number], [number, number]];
  peak: number;
  bounds: { x: number; y: number; width: number; height: number };
  shadow: { cx: number; cy: number; rx: number; ry: number };
  mouth: { y: number; depth: number };
}

const GEOMETRY: Record<BagModel['silhouette'], Geometry> = {
  round: {
    body: 'M 500 356 A 216 216 0 1 1 499.9 356 Z',
    anchors: [
      [347, 420],
      [653, 420],
    ],
    peak: 168,
    bounds: { x: 300, y: 374, width: 400, height: 400 },
    shadow: { cx: 500, cy: 800, rx: 210, ry: 22 },
    mouth: { y: 356, depth: 78 },
  },
  crescent: {
    body:
      'M 176 424 C 330 376, 670 376, 824 424 ' +
      'C 808 636, 690 740, 500 740 C 310 740, 192 636, 176 424 Z',
    anchors: [
      [206, 428],
      [794, 428],
    ],
    peak: 146,
    bounds: { x: 190, y: 396, width: 620, height: 328 },
    shadow: { cx: 500, cy: 762, rx: 266, ry: 25 },
    mouth: { y: 388, depth: 104 },
  },
  clutch: {
    body:
      'M 196 452 C 196 430, 214 416, 238 416 ' +
      'L 762 416 C 786 416, 804 430, 804 452 ' +
      'L 804 664 C 804 690, 784 706, 756 706 ' +
      'L 244 706 C 216 706, 196 690, 196 664 Z',
    anchors: [
      [248, 424],
      [752, 424],
    ],
    peak: 188,
    bounds: { x: 210, y: 424, width: 580, height: 270 },
    shadow: { cx: 500, cy: 726, rx: 262, ry: 20 },
    mouth: { y: 414, depth: 70 },
  },
  tote: {
    body:
      'M 208 386 C 400 366, 600 366, 792 386 ' +
      'L 748 742 C 744 780, 720 794, 690 794 ' +
      'L 310 794 C 280 794, 256 780, 252 742 Z',
    anchors: [
      [262, 386],
      [738, 386],
    ],
    peak: 128,
    bounds: { x: 226, y: 386, width: 548, height: 392 },
    shadow: { cx: 500, cy: 812, rx: 248, ry: 24 },
    mouth: { y: 370, depth: 92 },
  },
};

function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hashString = (value: string): number => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

function handlePath(geo: Geometry): string {
  const [[ax, ay], [bx, by]] = geo.anchors;
  return `M ${ax} ${ay} C ${ax + 10} ${geo.peak + 48}, ${bx - 10} ${geo.peak + 48}, ${bx} ${by}`;
}

function scatter(geo: Geometry, seedKey: string, density: number) {
  const random = mulberry32(hashString(seedKey));
  const { x, y, width, height } = geo.bounds;

  const columns = Math.max(6, Math.round(14 * density));
  const rows = Math.max(6, Math.round(12 * density));
  const cellW = width / columns;
  const cellH = height / rows;

  const points: { x: number; y: number; r: number; rotate: number; alpha: number }[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      // Gaps on purpose: a full grid reads as printed fabric, not sewn-on trim.
      if (random() > 0.56) continue;
      points.push({
        x: x + col * cellW + cellW * (0.12 + random() * 0.76),
        y: y + row * cellH + cellH * (0.12 + random() * 0.76),
        r: 5 + random() * 2.8,
        rotate: random() * 70 - 35,
        alpha: 0.65 + random() * 0.35,
      });
    }
  }
  return points;
}

export interface BagVectorProps {
  model: BagModel;
  body: YarnOption;
  detail: DetailOption;
  handle: HandleOption;
  /** Which conceptual layers to draw, so photographed layers can replace them one at a time. */
  roles?: { shadow?: boolean; body?: boolean; detail?: boolean; handle?: boolean; highlight?: boolean };
  className?: string;
  title?: string;
}

export function BagVector({ model, body, detail, handle, roles, className = '', title }: BagVectorProps) {
  const geo = GEOMETRY[model.silhouette];
  const show = {
    shadow: roles?.shadow ?? true,
    body: roles?.body ?? true,
    detail: roles?.detail ?? true,
    handle: roles?.handle ?? true,
    highlight: roles?.highlight ?? true,
  };

  const uid = `${model.id}-${body.id}-${detail.id}-${handle.id}`;
  const clipId = `clip-${uid}`;
  const stitchId = `stitch-${uid}`;
  const shadeId = `shade-${uid}`;
  const mouthId = `mouth-${uid}`;
  const glowId = `glow-${uid}`;
  const blurId = `blur-${uid}`;
  const strap = handlePath(geo);
  // Seeded by model alone, so switching gold → pearl re-colours the same trim.
  const trim = detail.style === 'none' ? [] : scatter(geo, model.id, detail.density ?? 1);

  return (
    <svg
      viewBox={`0 0 ${CANVAS} ${CANVAS}`}
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={geo.body} />
        </clipPath>

        {/* Crochet V-stitch, shaded with the yarn's own dark tone. */}
        <pattern id={stitchId} width="22" height="17" patternUnits="userSpaceOnUse">
          <path
            d="M 1.5 15 L 11 3 L 20.5 15"
            fill="none"
            style={ink(body.shadeHex)}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.45"
          />
          <path
            d="M 1.5 15 L 11 3"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.2"
          />
        </pattern>

        <linearGradient id={shadeId} x1="0.15" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.22" />
          <stop offset="42%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.34" />
        </linearGradient>

        {/* The opening: without it the shape reads as a flat disc. */}
        <linearGradient
          id={mouthId}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={geo.mouth.y}
          x2="0"
          y2={geo.mouth.y + geo.mouth.depth}
        >
          <stop offset="0%" stopColor="#000000" stopOpacity="0.48" />
          <stop offset="55%" stopColor="#000000" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </linearGradient>

        <radialGradient id={glowId} cx="0.32" cy="0.24" r="0.55">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>

        <filter id={blurId} x="-30%" y="-120%" width="160%" height="360%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
      </defs>

      <g transform={FRAME_TRANSFORM}>
        {show.shadow && (
          <g data-role="shadow">
            <ellipse
              cx={geo.shadow.cx}
              cy={geo.shadow.cy}
              rx={geo.shadow.rx}
              ry={geo.shadow.ry}
              fill="#241A20"
              opacity="0.18"
              filter={`url(#${blurId})`}
            />
          </g>
        )}

        {show.body && (
          <>
            <g data-role="body-tint">
              <path d={geo.body} style={tint(body.hex)} />
            </g>
            <g data-role="body-texture" clipPath={`url(#${clipId})`}>
              <rect x="0" y="0" width={CANVAS} height={CANVAS} fill={`url(#${stitchId})`} />
              <rect x="0" y="0" width={CANVAS} height={CANVAS} fill={`url(#${shadeId})`} />
              <rect x="0" y="0" width={CANVAS} height={CANVAS} fill={`url(#${mouthId})`} />
              <path d={geo.body} fill="none" stroke="#FFFFFF" strokeWidth="6" opacity="0.15" />
              <path d={geo.body} fill="none" style={ink(body.shadeHex)} strokeWidth="2" opacity="0.5" />
            </g>
          </>
        )}

        {show.detail && trim.length > 0 && (
          <g data-role="detail" clipPath={`url(#${clipId})`}>
            {trim.map((point, index) => (
              <g
                key={index}
                transform={`translate(${point.x} ${point.y}) rotate(${point.rotate})`}
                opacity={point.alpha}
              >
                {detail.style === 'bead' ? (
                  <>
                    <circle r={point.r * 1.15} style={tint(detail.hex)} />
                    <circle r={point.r * 1.15} fill="none" stroke="#000000" strokeWidth="0.8" opacity="0.25" />
                    <circle r={point.r * 0.3} fill="#000000" opacity="0.35" />
                    <ellipse
                      cx={-point.r * 0.35}
                      cy={-point.r * 0.4}
                      rx={point.r * 0.34}
                      ry={point.r * 0.24}
                      style={tint(detail.sheenHex)}
                      opacity="0.6"
                    />
                  </>
                ) : (
                  <>
                    <ellipse rx={point.r} ry={point.r * (detail.style === 'pearl' ? 0.96 : 0.86)} style={tint(detail.hex)} />
                    <ellipse
                      rx={point.r}
                      ry={point.r * (detail.style === 'pearl' ? 0.96 : 0.86)}
                      fill="none"
                      stroke="#000000"
                      strokeWidth="0.6"
                      opacity="0.2"
                    />
                    <ellipse
                      cx={-point.r * 0.26}
                      cy={-point.r * 0.3}
                      rx={point.r * 0.36}
                      ry={point.r * 0.24}
                      style={tint(detail.sheenHex)}
                      opacity="0.75"
                    />
                  </>
                )}
              </g>
            ))}
          </g>
        )}

        {show.handle && (
          <g data-role="handle" fill="none" strokeLinecap="round">
            {handle.style === 'chain' ? (
              <>
                <path d={strap} style={ink(handle.shadeHex)} strokeWidth="19" strokeDasharray="18 13" opacity="0.95" />
                <path d={strap} style={ink(handle.hex)} strokeWidth="13" strokeDasharray="11 20" strokeDashoffset="16" />
              </>
            ) : handle.style === 'knit' ? (
              <>
                <path d={strap} style={ink(handle.shadeHex)} strokeWidth="26" opacity="0.9" />
                <path d={strap} style={ink(handle.hex)} strokeWidth="20" strokeDasharray="16 12" />
                <path d={strap} stroke="#FFFFFF" strokeWidth="5" strokeDasharray="7 21" strokeDashoffset="9" opacity="0.25" />
              </>
            ) : handle.style === 'wood' ? (
              <>
                {/* A rigid handle sits above the body rather than hanging from it. */}
                <path d={strap} style={ink(handle.shadeHex)} strokeWidth="30" />
                <path d={strap} style={ink(handle.hex)} strokeWidth="22" />
                <path d={strap} stroke="#FFFFFF" strokeWidth="4" opacity="0.22" />
              </>
            ) : (
              <>
                <path d={strap} style={ink(handle.shadeHex)} strokeWidth="24" />
                <path d={strap} style={ink(handle.hex)} strokeWidth="18" />
                <path d={strap} stroke="#FFFFFF" strokeWidth="2" strokeDasharray="9 10" opacity="0.18" />
              </>
            )}

            {/* Brass rings where the handle meets the body. */}
            {geo.anchors.map(([ax, ay], index) => (
              <g key={index}>
                <circle cx={ax} cy={ay} r="15" fill="none" stroke="#8A6F3F" strokeWidth="5.5" />
                <circle cx={ax} cy={ay} r="15" fill="none" stroke="#E4CE9C" strokeWidth="2.2" />
              </g>
            ))}
          </g>
        )}

        {show.highlight && (
          <g data-role="highlight" clipPath={`url(#${clipId})`}>
            <rect x="0" y="0" width={CANVAS} height={CANVAS} fill={`url(#${glowId})`} />
          </g>
        )}
      </g>
    </svg>
  );
}
