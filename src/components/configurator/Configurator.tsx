'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { BagSelection, SeasonId } from '@/data/types';
import { PRESETS } from '@/data/configurator';
import { SEASONS, getSeason } from '@/data/seasons';
import {
  DETAILS,
  HANDLES,
  MODELS,
  YARNS,
  getDetail,
  getHandle,
  getModel,
  getYarn,
  parseSelection,
  priceFor,
  reconcileSelection,
} from '@/lib/catalog';
import { buildDesignCode } from '@/lib/design-code';
import { formatPrice } from '@/lib/format';
import { adjacentAssetPaths } from '@/lib/preview';
import { selectionToQuery } from '@/lib/url-state';
import { buildReadableSummary } from '@/lib/summary';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { CtaButton, ctaStyle } from '@/components/ui/Cta';
import { Toast, useToast } from '@/components/ui/Toast';
import { BagPreview, useLayerPreload } from './BagPreview';
import { ColorSelector } from './ColorSelector';
import { ConfiguratorSummary } from './ConfiguratorSummary';
import { DetailSelector } from './DetailSelector';
import { HandleSelector } from './HandleSelector';
import { ModelSelector } from './ModelSelector';
import { SeasonStart } from './SeasonStart';

const STEPS = [
  { id: 'model', title: 'Model', hint: 'Formunu seç. Gerisi bunun üzerine kurulur.' },
  { id: 'body', title: 'İp / Gövde', hint: 'Çantanın rengini ve dokusunu belirleyen ip.' },
  { id: 'detail', title: 'Pul / Detay', hint: 'Işığı yakalayan kısım. İstersen hiç olmasın.' },
  { id: 'handle', title: 'Sap', hint: 'Omzunda nasıl duracağını bu seçim belirler.' },
  { id: 'finish', title: 'Son Dokunuş', hint: 'Tasarımın hazır. Kodunu al, bize yaz.' },
] as const;

const isSeasonId = (value: string | null): value is SeasonId =>
  SEASONS.some((season) => season.id === value);

export interface ConfiguratorProps {
  presence: Record<string, boolean>;
  /**
   * Write the selection into the address bar. True on /atelier, where the URL is
   * the shareable record of a design.
   */
  syncUrl?: boolean;
}

export function Configurator({ presence, syncUrl = true }: ConfiguratorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduced = usePrefersReducedMotion();
  const previewRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const { message, show } = useToast();

  const [selection, setSelection] = useState<BagSelection>(() =>
    parseSelection({
      model: searchParams.get('model') ?? undefined,
      body: searchParams.get('body') ?? undefined,
      detail: searchParams.get('detail') ?? undefined,
      handle: searchParams.get('handle') ?? undefined,
    }),
  );
  const [step, setStep] = useState(0);
  const [season, setSeason] = useState<SeasonId | 'all'>(() => {
    const fromUrl = searchParams.get('season');
    return isSeasonId(fromUrl) ? fromUrl : 'all';
  });
  const [showAllColors, setShowAllColors] = useState(false);

  // Reopening a shared link — or using the back button — rebuilds the exact bag.
  useEffect(() => {
    if (!syncUrl) return;
    const fromUrl = parseSelection({
      model: searchParams.get('model') ?? undefined,
      body: searchParams.get('body') ?? undefined,
      detail: searchParams.get('detail') ?? undefined,
      handle: searchParams.get('handle') ?? undefined,
    });
    setSelection((current) =>
      selectionToQuery(current) === selectionToQuery(fromUrl) ? current : fromUrl,
    );
  }, [searchParams, syncUrl]);

  /**
   * A shared link can describe a bag that cannot be built any more. `parseSelection`
   * heals it; this writes the healed version back so the URL and the preview
   * never disagree.
   */
  useEffect(() => {
    if (!syncUrl) return;
    const canonical = selectionToQuery(selection);
    const current = new URLSearchParams(searchParams.toString());
    current.delete('season');
    if (current.toString() !== canonical) {
      const seasonPart = season !== 'all' ? `&season=${season}` : '';
      router.replace(`/atelier?${canonical}${seasonPart}`, { scroll: false });
    }
    // Keyed on the selection only: re-running on every searchParams change
    // would fight the visitor's own navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection, season, syncUrl]);

  const update = useCallback(
    (patch: Partial<BagSelection>) => {
      setSelection((current) => reconcileSelection({ ...current, ...patch }));
    },
    [],
  );

  const applyPreset = useCallback((presetId: string) => {
    const preset = PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    setSelection(reconcileSelection(preset.selection));
    setSeason(preset.season);
    setShowAllColors(false);
  }, []);

  const model = getModel(selection.model);
  const body = getYarn(selection.body);
  const detail = getDetail(selection.detail);
  const handle = getHandle(selection.handle);
  const designCode = buildDesignCode(selection);
  const total = priceFor(selection).total;
  const label = buildReadableSummary(selection);
  const palette = season === 'all' ? getSeason('spring') : getSeason(season);

  const preloadPaths = useMemo(
    () =>
      adjacentAssetPaths(selection, {
        bodies: YARNS.map((o) => o.id),
        details: DETAILS.map((o) => o.id),
        handles: HANDLES.map((o) => o.id),
      }),
    [selection],
  );
  useLayerPreload(preloadPaths, presence, true);

  const goToStep = useCallback(
    (index: number) => {
      setStep(index);
      if (typeof window !== 'undefined' && window.innerWidth < 1024 && controlsRef.current) {
        const top = controlsRef.current.getBoundingClientRect().top + window.scrollY - 8;
        window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
      }
    },
    [reduced],
  );

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <>
      <div className="lg:grid lg:grid-cols-[3fr_2fr] lg:items-start">
        {/* ── Preview ─────────────────────────────────────────────────────
            Sticky under the header on every breakpoint: on a phone the bag
            stays on screen while the options scroll beneath it (plan §26). */}
        <div
          className="sticky top-[var(--nav-height)] z-20 border-b border-blush-deep lg:z-10 lg:h-[calc(100svh-var(--nav-height))] lg:border-b-0 lg:border-r"
          style={{ backgroundColor: palette.background }}
        >
          <div className="relative flex h-[38svh] min-h-[248px] flex-col lg:h-full">
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between px-5 pt-4 lg:px-10 lg:pt-8">
              <div>
                <p
                  className="font-display text-2xl leading-none lg:text-4xl"
                  style={{ color: palette.ink }}
                >
                  {model.name}
                </p>
                <p className="mt-1 hidden text-xs tabular-nums lg:block" style={{ color: palette.inkSoft }}>
                  {model.dimensions}
                </p>
              </div>
              <p
                className="font-sans text-[0.625rem] font-semibold tracking-label lg:text-xs"
                style={{ color: palette.accent }}
              >
                {designCode}
              </p>
            </div>

            <div className="flex flex-1 items-center justify-center px-8 py-6 lg:px-16 lg:py-12">
              <BagPreview
                ref={previewRef}
                selection={selection}
                presence={presence}
                label={label}
                className="max-h-full w-full max-w-[min(100%,38rem)]"
              />
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden items-end justify-between px-10 pb-8 lg:flex">
              <p className="max-w-[26ch] text-xs leading-relaxed" style={{ color: palette.inkSoft }}>
                {label}
              </p>
              <p className="font-display text-3xl tabular-nums" style={{ color: palette.ink }}>
                {formatPrice(total)}
              </p>
            </div>
          </div>
        </div>

        {/* ── Controls ────────────────────────────────────────────────────── */}
        <div ref={controlsRef} className="bg-cream">
          <div className="mx-auto w-full max-w-xl px-gutter py-9 lg:px-12 lg:py-14">
            {/* Progress — an index line, not a checkout bar. */}
            <div className="mb-8">
              <div className="flex items-baseline justify-between">
                <p className="label text-ink-muted">
                  {String(step + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}
                </p>
                <p className="label text-ink-muted">{current.title}</p>
              </div>
              <ol className="mt-3 flex gap-1.5" aria-label="Tasarım adımları">
                {STEPS.map((s, index) => (
                  <li key={s.id} className="flex-1">
                    <button
                      type="button"
                      onClick={() => goToStep(index)}
                      aria-current={index === step ? 'step' : undefined}
                      className="block h-1 w-full rounded-full transition-colors duration-500 ease-editorial"
                      style={{ backgroundColor: index <= step ? '#FF68C4' : '#F3D3D6' }}
                    >
                      <span className="sr-only">
                        {index + 1}. adım: {s.title}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>

            {/* Keyed so each step mounts fresh and plays the CSS fade. */}
            <div key={current.id} className="animate-fade-rise">
              {!isLast && (
                <header className="mb-7">
                  <h2 className="font-display text-4xl leading-none text-ink">{current.title}</h2>
                  <p className="mt-3 max-w-[40ch] text-sm leading-relaxed text-ink-soft">{current.hint}</p>
                </header>
              )}

              {current.id === 'model' && (
                <div className="space-y-10">
                  <SeasonStart value={season} onChange={setSeason} onPreset={applyPreset} />
                  <ModelSelector
                    models={MODELS}
                    value={selection.model}
                    onChange={(id) => update({ model: id })}
                    body={body}
                    detail={detail}
                    handle={handle}
                  />
                </div>
              )}

              {current.id === 'body' && (
                <ColorSelector
                  season={season}
                  selection={selection}
                  onChange={(id) => update({ body: id })}
                  showAll={showAllColors}
                  onShowAll={setShowAllColors}
                  presence={presence}
                />
              )}

              {current.id === 'detail' && (
                <DetailSelector
                  selection={selection}
                  onChange={(id) => update({ detail: id })}
                  presence={presence}
                />
              )}

              {current.id === 'handle' && (
                <HandleSelector
                  selection={selection}
                  onChange={(id) => update({ handle: id })}
                  presence={presence}
                />
              )}

              {current.id === 'finish' && (
                <ConfiguratorSummary
                  selection={selection}
                  presence={presence}
                  previewRef={previewRef}
                  showToast={show}
                  season={season}
                />
              )}
            </div>

            <div className="mt-10 flex items-center justify-between gap-4 border-t border-blush-deep pt-6">
              <CtaButton
                variant="ghost"
                size="sm"
                className="-ml-1 px-1"
                style={ctaStyle('ghost', { accent: '#FF68C4', ink: '#5A4B53' })}
                onClick={() => goToStep(Math.max(0, step - 1))}
                disabled={step === 0}
              >
                Geri
              </CtaButton>

              <p className="text-xs tabular-nums text-ink-muted lg:hidden">{formatPrice(total)}</p>

              {!isLast ? (
                <CtaButton
                  onClick={() => goToStep(step + 1)}
                  style={ctaStyle('solid', { accent: '#FF68C4', ink: '#241A20', onAccent: '#FFFBF4' })}
                >
                  Devam
                </CtaButton>
              ) : (
                <CtaButton
                  variant="outline"
                  size="sm"
                  style={ctaStyle('outline', { accent: '#E7D9DB', ink: '#241A20' })}
                  onClick={() => goToStep(0)}
                >
                  Baştan Tasarla
                </CtaButton>
              )}
            </div>
          </div>
        </div>
      </div>

      <Toast message={message} />
    </>
  );
}
