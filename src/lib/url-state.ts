import { BRAND } from '@/config/brand';
import type { BagSelection, SeasonId } from '../data/types';

/**
 * The configurator's whole state lives in the URL, so any bag can be shared,
 * bookmarked or reopened later without a database (plan §29).
 *
 *   /atelier?model=bloom&body=hotpink&detail=woodBeads&handle=knitStrap
 */
export function selectionToQuery(selection: BagSelection): string {
  return new URLSearchParams({
    model: selection.model,
    body: selection.body,
    detail: selection.detail,
    handle: selection.handle,
  }).toString();
}

export const selectionToPath = (selection: BagSelection): string =>
  `/atelier?${selectionToQuery(selection)}`;

export function selectionToShareUrl(selection: BagSelection, origin?: string): string {
  const base = origin ?? (typeof window !== 'undefined' ? window.location.origin : BRAND.siteUrl);
  return `${base}${selectionToPath(selection)}`;
}

/** Deep link into the atelier, optionally carrying a season or a whole design. */
export function atelierHref(options?: {
  season?: SeasonId;
  selection?: Partial<BagSelection>;
}): string {
  const params = new URLSearchParams();
  if (options?.season) params.set('season', options.season);
  for (const [key, value] of Object.entries(options?.selection ?? {})) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `/atelier?${query}` : '/atelier';
}
