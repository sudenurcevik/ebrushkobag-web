'use client';

import type { ReactNode } from 'react';
import type { ImageRef } from '@/data/types';
import { formatPrice } from '@/lib/format';

export interface OptionItem {
  id: string;
  name: string;
  note?: string;
  priceModifier: number;
  thumbnail?: ImageRef;
  available: boolean;
  unavailableReason?: string;
  swatch: ReactNode;
}

/**
 * Native radios under the surface — arrow-key navigation, screen-reader grouping
 * and focus handling all come for free (plan §38).
 *
 * Unavailable materials stay in the list, dimmed, with the reason attached to
 * them rather than hidden in a tooltip. Rows are 76px tall so they are
 * comfortable to hit on a phone (plan §37).
 */
export function OptionSelector({
  legend,
  name,
  items,
  value,
  onChange,
  presence,
}: {
  legend: string;
  name: string;
  items: OptionItem[];
  value: string;
  onChange: (id: string) => void;
  presence: Record<string, boolean>;
}) {
  return (
    <fieldset>
      <legend className="sr-only">{legend}</legend>
      <div className="grid gap-2">
        {items.map((item) => {
          const selected = item.id === value;
          const inputId = `${name}-${item.id}`;
          const reasonId = `${inputId}-reason`;
          const showPhoto = item.thumbnail && presence[item.thumbnail.src];

          return (
            <div key={item.id} className="relative">
              <input
                type="radio"
                id={inputId}
                name={name}
                value={item.id}
                checked={selected}
                disabled={!item.available}
                onChange={() => onChange(item.id)}
                className="peer sr-only"
                aria-describedby={item.available ? undefined : reasonId}
              />
              <label
                htmlFor={inputId}
                className={[
                  'flex min-h-[4.75rem] cursor-pointer items-center gap-4 rounded-2xl px-3 py-3',
                  'border transition-colors duration-300 ease-editorial',
                  'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-hotpink',
                  item.available
                    ? selected
                      ? 'border-hotpink bg-blush'
                      : 'border-blush-deep hover:border-ink-line hover:bg-blush/60'
                    : 'cursor-not-allowed border-transparent opacity-45',
                ].join(' ')}
              >
                <span className="relative block h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                  {showPhoto && item.thumbnail ? (
                    <img
                      src={item.thumbnail.src}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    item.swatch
                  )}
                  <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-black/10" aria-hidden />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-3">
                    <span
                      className={`font-sans text-[0.9375rem] font-medium ${
                        selected ? 'text-ink' : 'text-ink-soft'
                      }`}
                    >
                      {item.name}
                    </span>
                    {item.priceModifier > 0 && (
                      <span className="shrink-0 text-xs tabular-nums text-ink-muted">
                        +{formatPrice(item.priceModifier)}
                      </span>
                    )}
                  </span>

                  {item.available ? (
                    item.note && (
                      <span className="mt-0.5 block truncate text-xs text-ink-muted">{item.note}</span>
                    )
                  ) : (
                    <span id={reasonId} className="mt-0.5 block text-xs text-burgundy">
                      {item.unavailableReason}
                    </span>
                  )}
                </span>

                <span
                  className={`block h-2.5 w-2.5 shrink-0 rounded-full transition-colors duration-300 ${
                    selected ? 'bg-hotpink' : 'bg-transparent'
                  }`}
                  aria-hidden
                />
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
