'use client';

import type { BagModel, DetailOption, HandleOption, YarnOption } from '@/data/types';
import { formatPrice } from '@/lib/format';
import { BagVector } from './BagVector';

/**
 * Step one. Each model is shown as a silhouette rather than a photograph, so the
 * choice reads as a *shape* decision — colour and trim come later.
 */
export function ModelSelector({
  models,
  value,
  onChange,
  body,
  detail,
  handle,
}: {
  models: BagModel[];
  value: string;
  onChange: (id: string) => void;
  body: YarnOption;
  detail: DetailOption;
  handle: HandleOption;
}) {
  return (
    <fieldset>
      <legend className="sr-only">Model seçimi</legend>
      <div className="grid gap-2">
        {models.map((model) => {
          const selected = model.id === value;
          const inputId = `model-${model.id}`;

          return (
            <div key={model.id} className="relative">
              <input
                type="radio"
                id={inputId}
                name="model"
                value={model.id}
                checked={selected}
                onChange={() => onChange(model.id)}
                className="peer sr-only"
              />
              <label
                htmlFor={inputId}
                className={[
                  'flex cursor-pointer items-center gap-4 rounded-2xl border px-3 py-3',
                  'transition-colors duration-300 ease-editorial',
                  'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-hotpink',
                  selected ? 'border-hotpink bg-blush' : 'border-blush-deep hover:border-ink-line hover:bg-blush/60',
                ].join(' ')}
              >
                <span className="block h-20 w-20 shrink-0">
                  <BagVector
                    className="h-full w-full"
                    model={model}
                    body={body}
                    detail={detail}
                    handle={handle}
                    roles={{ shadow: false, highlight: false }}
                  />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-3">
                    <span
                      className={`font-display text-2xl leading-none ${selected ? 'text-ink' : 'text-ink-soft'}`}
                    >
                      {model.name}
                    </span>
                    <span className="shrink-0 text-xs tabular-nums text-ink-muted">
                      {formatPrice(model.startingPrice)}
                    </span>
                  </span>
                  <span className="mt-1.5 block text-xs text-ink-muted">{model.tagline}</span>
                  <span className="mt-0.5 block text-xs tabular-nums text-ink-muted/80">
                    {model.dimensions}
                  </span>
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
