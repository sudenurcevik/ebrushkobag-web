import * as THREE from 'three';
import type { SeasonId } from '@/data/types';
import { SEASON_NAME, type CardTheme, type YarnPhoto } from '@/data/yarn-gallery';

/**
 * What sits on the glass of an info card, painted once per photograph into
 * a transparent canvas: the photograph, lifted off the glass by a soft
 * shadow, and beside it (below it on phones) the season and number, the
 * name, the line of copy and the maker's mark. The glass itself is drawn by
 * the card's shader; everything here is what the glass carries, inked in the
 * season's colours, with the season's motif etched finely in the corner.
 * Titles are set in the page's modern display face (Unbounded, as in the
 * opening and the season rail), text in the site's sans.
 */

/** A font variable, read where it is defined: the page's <main> or the root. */
const cssFont = (variable: string, fallback: string) => {
  for (const el of [document.querySelector('main'), document.documentElement]) {
    const value = el ? getComputedStyle(el).getPropertyValue(variable).trim() : '';
    if (value) return value;
  }
  return fallback;
};

/** Waits until the display and sans faces can be drawn to a canvas. */
export async function cardFonts() {
  const display = cssFont('--font-future', 'system-ui, sans-serif');
  const sans = cssFont('--font-sans', 'system-ui, sans-serif');
  await Promise.all([
    document.fonts.load(`300 80px ${display}`),
    document.fonts.load(`500 22px ${display}`),
    document.fonts.load(`400 30px ${sans}`),
    document.fonts.load(`500 22px ${sans}`),
  ]).catch(() => undefined);
  return { display, sans };
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Draws `image` to cover the rectangle, cropping the overflow. */
function cover(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource & { width: number; height: number },
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const scale = Math.max(w / image.width, h / image.height);
  const sw = w / scale;
  const sh = h / scale;
  ctx.drawImage(image, (image.width - sw) / 2, (image.height - sh) / 2, sw, sh, x, y, w, h);
}

function spaced(ctx: CanvasRenderingContext2D, spacing: string) {
  // Letter-spacing on canvas is recent; where missing, the type is just tighter.
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = spacing;
}

/** The photograph on the glass: rounded, with a soft shadow beneath it. */
function mountPhoto(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource & { width: number; height: number },
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
  unit: number,
) {
  ctx.save();
  ctx.shadowColor = 'rgba(58, 36, 40, 0.22)';
  ctx.shadowBlur = unit * 5;
  ctx.shadowOffsetY = unit * 1.6;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.clip();
  cover(ctx, image, x, y, w, h);
  ctx.restore();
}

/**
 * The season's motif as a fine etched line drawing, centred on (cx, cy)
 * and `size` across: a blossom sprig, a sun, a veined leaf, a frost crystal.
 */
function etchMotif(ctx: CanvasRenderingContext2D, season: SeasonId, cx: number, cy: number, size: number, color: string) {
  const r = size / 2;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1.2, size * 0.018);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = 0.7;

  const blossom = (x: number, y: number, s: number, turn: number) => {
    for (let i = 0; i < 5; i++) {
      const a = turn + (i / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(x + Math.cos(a) * s * 0.55, y + Math.sin(a) * s * 0.55, s * 0.5, s * 0.32, a, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(x, y, s * 0.12, 0, Math.PI * 2);
    ctx.fill();
  };

  switch (season) {
    case 'spring': {
      // A sprig: an arching twig, three blossoms and two buds.
      ctx.beginPath();
      ctx.moveTo(-r, r * 0.7);
      ctx.bezierCurveTo(-r * 0.4, r * 0.2, r * 0.1, r * 0.3, r * 0.9, -r * 0.7);
      ctx.moveTo(-r * 0.2, r * 0.3);
      ctx.quadraticCurveTo(-r * 0.2, -r * 0.2, -r * 0.45, -r * 0.45);
      ctx.stroke();
      blossom(r * 0.55, -r * 0.35, r * 0.28, 0.3);
      blossom(-r * 0.45, -r * 0.55, r * 0.22, 1.1);
      blossom(r * 0.05, r * 0.1, r * 0.2, 0.7);
      for (const [x, y] of [[-r * 0.8, r * 0.45], [r * 0.9, -r * 0.8]] as const) {
        ctx.beginPath();
        ctx.ellipse(x, y, r * 0.07, r * 0.11, 0.6, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
    }
    case 'summer': {
      // A sun: a disc, a fine ring and long and short rays.
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2);
      ctx.globalAlpha = 0.35;
      ctx.stroke();
      ctx.globalAlpha = 0.7;
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        const long = i % 2 === 0;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * r * 0.52, Math.sin(a) * r * 0.52);
        ctx.lineTo(Math.cos(a) * r * (long ? 0.98 : 0.72), Math.sin(a) * r * (long ? 0.98 : 0.72));
        ctx.stroke();
      }
      break;
    }
    case 'autumn': {
      // A leaf with its midrib and veins, and a curl of stem.
      ctx.rotate(-0.5);
      ctx.beginPath();
      ctx.moveTo(0, r * 0.95);
      ctx.bezierCurveTo(r * 0.7, r * 0.4, r * 0.6, -r * 0.5, 0, -r);
      ctx.bezierCurveTo(-r * 0.6, -r * 0.5, -r * 0.7, r * 0.4, 0, r * 0.95);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, r * 1.2);
      ctx.lineTo(0, -r * 0.85);
      for (let i = 0; i < 5; i++) {
        const y = r * 0.6 - i * r * 0.32;
        ctx.moveTo(0, y);
        ctx.quadraticCurveTo(r * 0.2, y - r * 0.08, r * 0.42, y - r * 0.3);
        ctx.moveTo(0, y);
        ctx.quadraticCurveTo(-r * 0.2, y - r * 0.08, -r * 0.42, y - r * 0.3);
      }
      ctx.stroke();
      break;
    }
    case 'winter': {
      // A frost crystal: six arms with paired branches.
      for (let i = 0; i < 6; i++) {
        ctx.save();
        ctx.rotate((i / 6) * Math.PI * 2);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -r);
        for (const [d, l] of [[0.35, 0.22], [0.58, 0.18], [0.78, 0.12]] as const) {
          ctx.moveTo(0, -r * d);
          ctx.lineTo(r * l, -r * (d + l * 0.9));
          ctx.moveTo(0, -r * d);
          ctx.lineTo(-r * l, -r * (d + l * 0.9));
        }
        ctx.stroke();
        ctx.restore();
      }
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.1, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
  }
  ctx.restore();
}

export function paintCardFace({
  photo,
  season,
  theme,
  image,
  aspect,
  fonts,
}: {
  photo: YarnPhoto;
  /** The season the card hangs in: it sets the ink, the motif and the label. */
  season: SeasonId;
  theme: CardTheme;
  image: CanvasImageSource & { width: number; height: number };
  /** Card width / height. */
  aspect: number;
  fonts: { display: string; sans: string };
}) {
  const landscape = aspect > 1;
  const W = landscape ? 1800 : 1000;
  const H = Math.round(W / aspect);
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const unit = Math.min(W, H) / 100;
  const pad = unit * 6;

  let textX: number;
  let textY: number;
  let textW: number;
  let bottom: number;

  if (landscape) {
    // Photograph on the left at 4:5, text on the right.
    const ph = H - pad * 2;
    const pw = ph * 0.8;
    mountPhoto(ctx, image, pad, pad, pw, ph, unit * 2.2, unit);
    textX = pad + pw + pad * 1.3;
    textW = W - textX - pad * 1.3;
    textY = pad + unit * 10;
    bottom = H - pad - unit * 1.5;
  } else {
    // Photograph on top, text underneath.
    const pw = W - pad * 2;
    const ph = pw * 0.92;
    mountPhoto(ctx, image, pad, pad, pw, ph, unit * 3, unit);
    textX = pad + unit * 0.5;
    textW = W - pad * 2 - unit;
    textY = pad + ph + unit * 11;
    bottom = H - pad - unit * 0.5;
  }

  // Season / number
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = theme.inkMuted;
  ctx.font = `500 ${unit * (landscape ? 2.1 : 2.8)}px ${fonts.display}`;
  spaced(ctx, `${unit * 0.6}px`);
  ctx.fillText(`${SEASON_NAME[season]}  —  ${String(photo.number).padStart(2, '0')}`, textX, textY);
  spaced(ctx, '0px');

  // Title, light and wide
  const titleSize = unit * (landscape ? 6.6 : 7.4);
  ctx.fillStyle = theme.ink;
  ctx.font = `300 ${titleSize}px ${fonts.display}`;
  spaced(ctx, `${-titleSize * 0.02}px`);
  let y = textY + unit * 4.5 + titleSize;
  for (const line of wrap(ctx, photo.title, textW)) {
    ctx.fillText(line, textX, y);
    y += titleSize * 1.18;
  }
  spaced(ctx, '0px');

  // A short rule in the season's colour
  ctx.fillStyle = theme.rim;
  ctx.fillRect(textX, y + unit * 0.4, unit * 6, Math.max(2, unit * 0.35));
  y += unit * 5.5;

  // Description
  const bodySize = unit * (landscape ? 3.0 : 3.9);
  ctx.fillStyle = theme.inkSoft;
  ctx.font = `400 ${bodySize}px ${fonts.sans}`;
  for (const line of wrap(ctx, photo.description, Math.min(textW, unit * (landscape ? 56 : 100)))) {
    ctx.fillText(line, textX, y);
    y += bodySize * 1.6;
  }

  // The season's motif, etched in the corner of the text column.
  const motif = unit * (landscape ? 13 : 12);
  const motifX = W - pad - motif * 0.55;
  const motifY = bottom - motif * 0.5 - unit * (landscape ? 0 : 1);
  if (y + motif * 0.2 < motifY - motif * 0.5 || landscape) etchMotif(ctx, season, motifX, motifY, motif, theme.accent);

  // Maker's mark at the foot of the text column — only if the copy leaves room.
  if (y + unit * 2 < bottom) {
    ctx.fillStyle = theme.inkSoft;
    ctx.font = `500 ${unit * (landscape ? 1.6 : 2.2)}px ${fonts.display}`;
    spaced(ctx, `${unit * 0.6}px`);
    ctx.fillText('EBRUSHKOBAG  ·  EL ÖRGÜSÜ', textX, bottom);
    spaced(ctx, '0px');
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
