import * as THREE from 'three';
import type { SeasonId } from '@/data/types';
import { SEASON_NAME, type CardTheme, type YarnPhoto } from '@/data/yarn-gallery';

/**
 * The type and HUD of an info card, painted once per photograph and season
 * into a transparent canvas laid over the card: corner brackets and a small
 * code over the photograph, and inside the glass panel the season and
 * number, the name, the line of copy, the season's motif and the maker's
 * mark. The photograph, the frosted panel and the rim are drawn by the
 * card's shader (YarnCard).
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

function spaced(ctx: CanvasRenderingContext2D, spacing: string) {
  // Letter-spacing on canvas is recent; where missing, the type is just tighter.
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = spacing;
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

/**
 * The photograph's share of a card: its width on wide cards (the left),
 * its height on tall ones (the top). The information panel has the rest.
 */
export const PHOTO_SHARE = { landscape: 0.62, portrait: 0.6 };

/**
 * Where the glass panel sits on a card, in card UV (x0, y0, x1, y1; y up):
 * in the rest of the card beside the photograph — down the right-hand side
 * on wide cards, across the bottom on tall ones. The card's shader draws the
 * frosted panel there; this painter sets the text inside it.
 */
export const PANEL = {
  landscape: [0.642, 0.075, 0.96, 0.925] as const,
  portrait: [0.05, 0.04, 0.95, 0.38] as const,
};

export function paintCardFace({
  photo,
  season,
  theme,
  aspect,
  fonts,
}: {
  photo: YarnPhoto;
  /** The season the card hangs in: it sets the ink, the motif and the label. */
  season: SeasonId;
  theme: CardTheme;
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

  // ── HUD over the photograph: corner brackets and a small code ──────────
  const inset = unit * 4.5;
  const arm = unit * 6;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = Math.max(2, unit * 0.35);
  ctx.lineCap = 'round';
  const corners: [number, number, number, number][] = [
    [inset, inset, 1, 1],
    [W - inset, H - inset, -1, -1],
    [inset, H - inset, 1, -1],
  ];
  for (const [x, y, dx, dy] of corners) {
    ctx.beginPath();
    ctx.moveTo(x, y + dy * arm);
    ctx.lineTo(x, y);
    ctx.lineTo(x + dx * arm, y);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = `500 ${unit * 2}px ${fonts.display}`;
  spaced(ctx, `${unit * 0.5}px`);
  ctx.fillText(`EBK · ${SEASON_NAME[season].slice(0, 3)} ${String(photo.number).padStart(2, '0')}`, inset + unit * 1.5, inset + unit * 5);
  spaced(ctx, '0px');

  // ── The text, inside the glass panel ───────────────────────────────────
  const [px0, py0, px1, py1] = landscape ? PANEL.landscape : PANEL.portrait;
  const left = px0 * W;
  const right = px1 * W;
  const top = (1 - py1) * H;
  const bottom = (1 - py0) * H;
  const pad = unit * (landscape ? 4 : 4.5);
  const textX = left + pad;
  const textW = right - left - pad * 2;
  let y = top + pad + unit * 2.5;

  // Season and number, in the season's colour, with a small index on the right.
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = theme.inkMuted;
  ctx.font = `500 ${unit * (landscape ? 2.1 : 2.8)}px ${fonts.display}`;
  spaced(ctx, `${unit * 0.6}px`);
  ctx.fillText(SEASON_NAME[season], textX, y);
  ctx.textAlign = 'right';
  ctx.fillText(String(photo.number).padStart(2, '0'), right - pad, y);
  ctx.textAlign = 'left';
  spaced(ctx, '0px');

  // Title
  const titleSize = unit * (landscape ? 5.4 : 6.6);
  ctx.fillStyle = theme.ink;
  ctx.font = `300 ${titleSize}px ${fonts.display}`;
  spaced(ctx, `${-titleSize * 0.02}px`);
  y += unit * 4 + titleSize;
  for (const line of wrap(ctx, photo.title, textW)) {
    ctx.fillText(line, textX, y);
    y += titleSize * 1.16;
  }
  spaced(ctx, '0px');

  // A short rule in the season's colour
  ctx.fillStyle = theme.rim;
  ctx.fillRect(textX, y + unit * 0.2, unit * 6, Math.max(2, unit * 0.35));
  y += unit * 5;

  // Description
  const bodySize = unit * (landscape ? 2.6 : 3.5);
  ctx.fillStyle = theme.inkSoft;
  ctx.font = `400 ${bodySize}px ${fonts.sans}`;
  for (const line of wrap(ctx, photo.description, textW)) {
    ctx.fillText(line, textX, y);
    y += bodySize * 1.55;
  }

  // The season's motif and the maker's mark at the foot of the panel.
  const foot = bottom - pad;
  const motif = unit * (landscape ? 8.5 : 8);
  if (y + motif * 0.4 < foot - motif) etchMotif(ctx, season, right - pad - motif * 0.5, foot - motif * 0.5, motif, theme.accent);
  if (y + unit * 2 < foot) {
    ctx.fillStyle = theme.inkSoft;
    ctx.font = `500 ${unit * (landscape ? 1.6 : 2.2)}px ${fonts.display}`;
    spaced(ctx, `${unit * 0.6}px`);
    ctx.fillText('EBRUSHKOBAG  ·  EL ÖRGÜSÜ', textX, foot);
    spaced(ctx, '0px');
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
