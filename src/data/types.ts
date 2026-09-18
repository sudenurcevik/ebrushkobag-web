/**
 * Domain types.
 *
 * Seasons are data, never hardcoded colour literals in components (plan §33).
 * A component asks the season for its accent; it never knows what green is.
 */

export type SeasonId = 'spring' | 'summer' | 'autumn' | 'winter';

export interface ImageRef {
  /** Path under /public. Renders a clearly-labelled placeholder when absent. */
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Shown inside the placeholder while the real photograph is missing. */
  placeholderLabel?: string;
  /** Marks an asset the brand must supply before launch (plan §32). */
  required?: boolean;
}

/** Colours the procedural knit texture is drawn with. */
export interface KnitPalette {
  /** The yarn itself. */
  yarn: string;
  /** Shadow between the loops. */
  shade: string;
  /** What shows through behind the stitches. */
  ground: string;
}

export interface Season {
  id: SeasonId;
  /**
   * URL fragment for this chapter. Explicit rather than derived from the label:
   * `'KIŞ'.toLowerCase()` returns `kiş` in JavaScript's default locale, not
   * `kış`, so deriving it would put a misspelling in the address bar.
   */
  slug: string;
  /** '01' … '04' */
  index: string;
  /** Turkish chapter name, e.g. BAHAR. */
  label: string;
  /** English chapter name, e.g. SPRING. */
  labelEn: string;
  headline: string;
  body: string;
  /** Small mood words shown as floating micro-labels. */
  mood: string[];

  background: string;
  surface: string;
  accent: string;
  accentSoft: string;
  ink: string;
  inkSoft: string;
  /** Border / hairline colour that works on this background. */
  line: string;

  /** Swatch row shown in the chapter header. */
  palette: { name: string; hex: string }[];
  knit: KnitPalette;

  images: {
    hero: ImageRef;
    product: ImageRef;
    macro: ImageRef;
  };

  /** Product ids featured in this chapter, in order. */
  productIds: string[];
}

/**
 * The signature between-season sequence (plan §9–§16).
 * Colours are listed as the stops the thread and the ground morph through.
 */
export interface SeasonBridge {
  id: string;
  from: SeasonId;
  to: SeasonId;
  /** Thread colour stops, outgoing accent → incoming accent. */
  threadStops: string[];
  /** Background stops for the macro world. */
  groundStops: string[];
  knitFrom: KnitPalette;
  knitTo: KnitPalette;
  /** One line of copy that surfaces inside the macro world. */
  whisper: string;
}

export type ProductStatus = 'current' | 'archive' | 'oneOfOne';

export interface Product {
  id: string;
  /** Editorial name, e.g. "PATCHWORK NO. 01". */
  name: string;
  /** Materials line, e.g. "Pamuk ipi / Ahşap boncuk / El yapımı". */
  materials: string;
  note: string;
  season: SeasonId;
  status: ProductStatus;
  image: ImageRef;
  /** Which configurator combination this product inspires. */
  inspires?: {
    model: string;
    body: string;
    detail: string;
    handle: string;
  };
}

export interface ArchiveItem {
  id: string;
  image: ImageRef;
  label: string;
  caption: string;
  /** Layout weight on the mosaic: 1 = small, 3 = hero. */
  weight: 1 | 2 | 3;
}

// ── Configurator ──────────────────────────────────────────────────────────

export type OptionKind = 'model' | 'body' | 'detail' | 'handle';

export interface BagModel {
  id: string;
  name: string;
  code: string;
  tagline: string;
  dimensions: string;
  materials: string;
  productionTime: string;
  startingPrice: number;
  silhouette: 'round' | 'crescent' | 'clutch' | 'tote';
  assetDir: string;
  canvas: { width: number; height: number };
}

interface OptionBase {
  id: string;
  name: string;
  code: string;
  note?: string;
  priceModifier: number;
  availableModels: string[] | 'all';
  thumbnail?: ImageRef;
  /** Nearest alternative when this option cannot be used. */
  preferredFallback?: string;
}

export interface YarnOption extends OptionBase {
  hex: string;
  shadeHex: string;
  /** Seasons whose starting palette suggests this yarn (plan §27). */
  seasons: SeasonId[];
  render: 'tint' | 'prerendered';
  prerenderedAsset?: Record<string, string>;
  blend?: 'multiply' | 'soft-light';
}

export interface DetailOption extends OptionBase {
  hex: string;
  sheenHex: string;
  /** How the decoration is drawn in the preview. */
  style: 'none' | 'sequin' | 'bead' | 'pearl';
  density?: number;
}

export interface HandleOption extends OptionBase {
  hex: string;
  shadeHex: string;
  material: string;
  style: 'knit' | 'strap' | 'wood' | 'chain';
}

export interface CompatibilityRule {
  id: string;
  when: Partial<Record<OptionKind, string>>;
  disallow: { kind: OptionKind; ids: string[] };
  reason: string;
}

export interface BagSelection {
  model: string;
  body: string;
  detail: string;
  handle: string;
}

export interface Availability {
  available: boolean;
  reason?: string;
}

export interface SeasonPreset {
  id: string;
  name: string;
  season: SeasonId;
  description: string;
  selection: BagSelection;
}
