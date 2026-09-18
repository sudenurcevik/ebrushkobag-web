'use client';

import type { BagSelection } from '@/data/types';
import { DETAILS, getAvailability } from '@/lib/catalog';
import { OptionSelector } from './OptionSelector';
import { DetailSwatch } from './MaterialSwatch';

/** Step three — beads, sequins, pearls, or nothing at all. */
export function DetailSelector({
  selection,
  onChange,
  presence,
}: {
  selection: BagSelection;
  onChange: (id: string) => void;
  presence: Record<string, boolean>;
}) {
  const items = DETAILS.map((detail) => {
    const availability = getAvailability('detail', detail.id, selection);
    return {
      id: detail.id,
      name: detail.name,
      note: detail.note,
      priceModifier: detail.priceModifier,
      thumbnail: detail.thumbnail,
      available: availability.available,
      unavailableReason: availability.reason,
      swatch: <DetailSwatch option={detail} className="h-full w-full" />,
    };
  });

  return (
    <OptionSelector
      legend="Detay"
      name="detail"
      items={items}
      value={selection.detail}
      onChange={onChange}
      presence={presence}
    />
  );
}
