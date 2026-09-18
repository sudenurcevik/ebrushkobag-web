/**
 * Tiny colour helpers for the seasonal bridges.
 *
 * The transition morphs through an explicit list of stops (plan §14), so the
 * interpolation happens here rather than relying on CSS custom-property
 * interpolation, which is not reliable across every browser this site has to
 * serve — much of the traffic arrives inside the Instagram in-app browser.
 */

type Rgb = [number, number, number];

function hexToRgb(hex: string): Rgb {
  const value = hex.replace('#', '');
  const full =
    value.length === 3
      ? value
          .split('')
          .map((c) => c + c)
          .join('')
      : value;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

const toHex = (channel: number): string =>
  Math.round(Math.min(255, Math.max(0, channel)))
    .toString(16)
    .padStart(2, '0');

export function mixHex(from: string, to: string, t: number): string {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  const p = clamp01(t);
  return `#${toHex(a[0] + (b[0] - a[0]) * p)}${toHex(a[1] + (b[1] - a[1]) * p)}${toHex(
    a[2] + (b[2] - a[2]) * p,
  )}`;
}

/** Position `t` (0–1) along an arbitrary list of colour stops. */
export function sampleStops(stops: string[], t: number): string {
  if (stops.length === 0) return '#000000';
  if (stops.length === 1) return stops[0];

  const p = clamp01(t) * (stops.length - 1);
  const index = Math.min(stops.length - 2, Math.floor(p));
  return mixHex(stops[index], stops[index + 1], p - index);
}

/** Maps a sub-range of scroll progress onto 0–1, clamped outside it. */
export const phase = (progress: number, start: number, end: number): number =>
  clamp01((progress - start) / (end - start));
