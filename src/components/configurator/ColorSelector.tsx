'use client';

import type { BagSelection, SeasonId, YarnOption } from '@/data/types';
import { getAvailability, yarnsForSeason, YARNS } from '@/lib/catalog';
import { OptionSelector } from './OptionSelector';
import { YarnSwatch } from './MaterialSwatch';

/**
 * Step two.
 *
 * The chosen season decides which yarns are offered *first* — never which are
 * allowed. "Tüm renkleri gör" opens the whole range in place, and the plan is
 * explicit that a season must not lock anyone out of a colour (§27).
 */
export function ColorSelector({
  season,
  selection,
  onChange,
  showAll,
  onShowAll,
  presence,
}: {
  season: SeasonId | 'all';
  selection: BagSelection;
  onChange: (id: string) => void;
  showAll: boolean;
  onShowAll: (next: boolean) => void;
  presence: Record<string, boolean>;
}) {
  const suggested = season === 'all' ? YARNS : yarnsForSeason(season);
  const visible: YarnOption[] = showAll || season === 'all' ? YARNS : suggested;
  const hiddenCount = YARNS.length - suggested.length;

  const items = visible.map((yarn) => {
    const availability = getAvailability('body', yarn.id, selection);
    return {
      id: yarn.id,
      name: yarn.name,
      note: yarn.note,
      priceModifier: yarn.priceModifier,
      thumbnail: yarn.thumbnail,
      available: availability.available,
      unavailableReason: availability.reason,
      swatch: <YarnSwatch option={yarn} className="h-full w-full" />,
    };
  });

  return (
    <div className="space-y-4">
      <OptionSelector
        legend="Gövde ipi"
        name="body"
        items={items}
        value={selection.body}
        onChange={onChange}
        presence={presence}
      />

      {season !== 'all' && hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => onShowAll(!showAll)}
          className="w-full rounded-full border border-blush-deep px-5 py-3 text-[0.6875rem] font-medium uppercase tracking-label text-ink-soft transition-colors duration-300 hover:border-hotpink hover:text-ink"
        >
          {showAll ? 'Sadece mevsim renkleri' : `Tüm renkleri gör (+${hiddenCount})`}
        </button>
      )}
    </div>
  );
}
