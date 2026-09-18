import fs from 'node:fs';
import path from 'node:path';

const cache = new Map<string, boolean>();

/**
 * Whether a referenced file actually exists in /public yet.
 *
 * The brand's photography is still being produced, so components ask this on the
 * server and draw a clearly-labelled placeholder instead of requesting a missing
 * file. No 404s, no broken-image icons, no layout shift when the real photo
 * lands — and critical product assets are never silently faked (plan §32).
 */
export function hasPublicAsset(src: string): boolean {
  if (!src.startsWith('/')) return false;
  const cached = cache.get(src);
  if (cached !== undefined) return cached;

  const absolute = path.join(process.cwd(), 'public', src.replace(/^\//, ''));
  let exists = false;
  try {
    exists = fs.existsSync(absolute) && fs.statSync(absolute).isFile();
  } catch {
    exists = false;
  }

  // Cache only in production: a newly dropped file should show up on the next
  // render in development without restarting the server.
  if (process.env.NODE_ENV === 'production') cache.set(src, exists);
  return exists;
}

export const assetPresence = (paths: string[]): Record<string, boolean> =>
  Object.fromEntries(paths.map((p) => [p, hasPublicAsset(p)]));
