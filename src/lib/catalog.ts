import {
  COMPATIBILITY_RULES,
  DEFAULT_SELECTION,
  DETAILS,
  HANDLES,
  MODELS,
  UNAVAILABLE_FOR_MODEL,
  YARNS,
} from '../data/configurator';
import type {
  Availability,
  BagModel,
  BagSelection,
  DetailOption,
  HandleOption,
  OptionKind,
  SeasonId,
  YarnOption,
} from '../data/types';

export const getModel = (id: string): BagModel => MODELS.find((m) => m.id === id) ?? MODELS[0];
export const getYarn = (id: string): YarnOption => YARNS.find((y) => y.id === id) ?? YARNS[0];
export const getDetail = (id: string): DetailOption => DETAILS.find((d) => d.id === id) ?? DETAILS[0];
export const getHandle = (id: string): HandleOption => HANDLES.find((h) => h.id === id) ?? HANDLES[0];

type AnyOption = YarnOption | DetailOption | HandleOption;
type OptionSlot = Exclude<OptionKind, 'model'>;

const OPTION_SETS: Record<OptionSlot, AnyOption[]> = {
  body: YARNS,
  detail: DETAILS,
  handle: HANDLES,
};

export const optionsFor = (kind: OptionSlot): AnyOption[] => OPTION_SETS[kind];

/**
 * Availability never filters the list. An option that cannot be used stays on
 * screen, disabled, carrying its reason — the visitor should see the whole range
 * even when part of it is closed for their model.
 */
export function getAvailability(
  kind: OptionSlot,
  optionId: string,
  selection: BagSelection,
): Availability {
  const option = OPTION_SETS[kind].find((o) => o.id === optionId);
  if (!option) return { available: false, reason: UNAVAILABLE_FOR_MODEL };

  if (option.availableModels !== 'all' && !option.availableModels.includes(selection.model)) {
    return { available: false, reason: UNAVAILABLE_FOR_MODEL };
  }

  for (const rule of COMPATIBILITY_RULES) {
    if (rule.disallow.kind !== kind) continue;
    if (!rule.disallow.ids.includes(optionId)) continue;

    const matches = (Object.keys(rule.when) as OptionKind[]).every(
      (key) => rule.when[key] === selection[key as keyof BagSelection],
    );
    if (matches) return { available: false, reason: rule.reason };
  }

  return { available: true };
}

/**
 * Where to land when the current choice cannot be made. The option's own
 * `preferredFallback` wins, so a shared design degrades to the nearest thing in
 * spirit rather than to whatever happens to be first in the list.
 */
function healedOption(kind: OptionSlot, currentId: string, selection: BagSelection): string {
  const current = OPTION_SETS[kind].find((o) => o.id === currentId);
  const preferred = current?.preferredFallback;
  if (preferred && getAvailability(kind, preferred, selection).available) return preferred;

  const found = OPTION_SETS[kind].find((o) => getAvailability(kind, o.id, selection).available);
  return found?.id ?? OPTION_SETS[kind][0].id;
}

/** Applies a change and repairs anything it invalidated. */
export function reconcileSelection(next: BagSelection): BagSelection {
  const model = MODELS.some((m) => m.id === next.model) ? next.model : DEFAULT_SELECTION.model;
  let result: BagSelection = { ...next, model };

  // Order matters: body constrains detail, body + detail constrain handle.
  for (const kind of ['body', 'detail', 'handle'] as const) {
    const current = result[kind];
    const exists = OPTION_SETS[kind].some((o) => o.id === current);
    if (!exists || !getAvailability(kind, current, result).available) {
      result = { ...result, [kind]: healedOption(kind, current, result) };
    }
  }

  return result;
}

export function parseSelection(
  input: Partial<Record<keyof BagSelection, string | undefined>>,
): BagSelection {
  return reconcileSelection({
    model: input.model ?? DEFAULT_SELECTION.model,
    body: input.body ?? DEFAULT_SELECTION.body,
    detail: input.detail ?? DEFAULT_SELECTION.detail,
    handle: input.handle ?? DEFAULT_SELECTION.handle,
  });
}

/**
 * Yarns a season opens with. This orders the palette, it never shortens it —
 * "Tüm renkleri gör" returns the full list (plan §27).
 */
export function yarnsForSeason(season: SeasonId | 'all'): YarnOption[] {
  if (season === 'all') return YARNS;
  const suggested = YARNS.filter((yarn) => yarn.seasons.includes(season));
  return suggested.length > 0 ? suggested : YARNS;
}

export interface PriceBreakdown {
  base: number;
  additions: { label: string; amount: number }[];
  total: number;
}

export function priceFor(selection: BagSelection): PriceBreakdown {
  const model = getModel(selection.model);
  const parts: AnyOption[] = [
    getYarn(selection.body),
    getDetail(selection.detail),
    getHandle(selection.handle),
  ];

  const additions = parts
    .filter((p) => p.priceModifier > 0)
    .map((p) => ({ label: p.name, amount: p.priceModifier }));

  return {
    base: model.startingPrice,
    additions,
    total: model.startingPrice + additions.reduce((sum, a) => sum + a.amount, 0),
  };
}

export { DETAILS, HANDLES, MODELS, YARNS, DEFAULT_SELECTION };
