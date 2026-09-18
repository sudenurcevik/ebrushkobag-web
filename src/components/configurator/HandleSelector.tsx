'use client';

import type { BagSelection } from '@/data/types';
import { HANDLES, getAvailability } from '@/lib/catalog';
import { OptionSelector } from './OptionSelector';
import { HandleSwatch } from './MaterialSwatch';

/** Step four — the choice that decides whether the bag is daytime or evening. */
export function HandleSelector({
  selection,
  onChange,
  presence,
}: {
  selection: BagSelection;
  onChange: (id: string) => void;
  presence: Record<string, boolean>;
}) {
  const items = HANDLES.map((handle) => {
    const availability = getAvailability('handle', handle.id, selection);
    return {
      id: handle.id,
      name: handle.name,
      note: handle.note,
      priceModifier: handle.priceModifier,
      thumbnail: handle.thumbnail,
      available: availability.available,
      unavailableReason: availability.reason,
      swatch: <HandleSwatch option={handle} className="h-full w-full" />,
    };
  });

  return (
    <OptionSelector
      legend="Sap"
      name="handle"
      items={items}
      value={selection.handle}
      onChange={onChange}
      presence={presence}
    />
  );
}
