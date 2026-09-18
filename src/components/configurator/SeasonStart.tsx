'use client';

import type { SeasonId } from '@/data/types';
import { SEASONS } from '@/data/seasons';
import { PRESETS } from '@/data/configurator';

/**
 * "Nereden başlayalım?" (plan §27).
 *
 * The season is a starting point, not a filter — the copy says so explicitly,
 * and "Tüm renkler" is always one tap away. Presets below are nothing more than
 * a selection written into the same state (plan §28).
 */
export function SeasonStart({
  value,
  onChange,
  onPreset,
}: {
  value: SeasonId | 'all';
  onChange: (next: SeasonId | 'all') => void;
  onPreset: (presetId: string) => void;
}) {
  const options: { id: SeasonId | 'all'; label: string; accent: string }[] = [
    ...SEASONS.map((season) => ({ id: season.id, label: season.label, accent: season.accent })),
    { id: 'all', label: 'Tüm renkler', accent: '#FF68C4' },
  ];

  const presets = value === 'all' ? PRESETS : PRESETS.filter((preset) => preset.season === value);

  return (
    <div className="space-y-8">
      <div>
        <p className="label text-ink-muted">Nereden başlayalım?</p>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Başlangıç paleti">
          {options.map((option) => {
            const selected = option.id === value;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onChange(option.id)}
                aria-pressed={selected}
                className={[
                  'rounded-full border px-4 py-2.5 text-[0.6875rem] font-medium uppercase tracking-label',
                  'transition-colors duration-300 ease-editorial',
                  selected ? 'text-cream' : 'border-blush-deep text-ink-soft hover:border-ink-line hover:text-ink',
                ].join(' ')}
                style={
                  selected
                    ? { backgroundColor: option.accent, borderColor: option.accent, color: '#241A20' }
                    : undefined
                }
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-ink-muted">
          Mevsim yalnızca hangi renklerin önce görüneceğini belirler. Hiçbir seçeneği kapatmaz.
        </p>
      </div>

      {presets.length > 0 && (
        <div>
          <p className="label text-ink-muted">Hazır kombinasyonlar</p>
          <ul className="mt-4 grid gap-2">
            {presets.map((preset) => (
              <li key={preset.id}>
                <button
                  type="button"
                  onClick={() => onPreset(preset.id)}
                  className="flex w-full items-center justify-between gap-4 rounded-2xl border border-blush-deep px-4 py-3.5 text-left transition-colors duration-300 hover:border-hotpink hover:bg-blush/60"
                >
                  <span>
                    <span className="block font-display text-xl text-ink">{preset.name}</span>
                    <span className="mt-0.5 block text-xs text-ink-muted">{preset.description}</span>
                  </span>
                  <span className="shrink-0 text-[0.625rem] uppercase tracking-label text-hotpink">
                    Uygula
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
