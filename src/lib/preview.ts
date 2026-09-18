import type { BagSelection } from '../data/types';
import { getDetail, getHandle, getModel, getYarn } from './catalog';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * LIVE PREVIEW ARCHITECTURE (plan §26 — 2D layered, no 3D)
 *
 * The bag is never a flat per-combination render. It is a stack of transparent
 * layers sharing one square canvas and one registration point:
 *
 *   1  shadow        contact shadow on the ground              (multiply)
 *   2  bodyTint      flat colour, clipped to the body alpha    (normal)
 *   3  bodyTexture   neutral crochet photo over the tint       (multiply)
 *   —  bodyPrerendered  …or one photographed body, replacing 2+3
 *   4  detail        beads / sequins / pearls                  (normal)
 *   5  handle        strap, wood or chain                      (normal)
 *   6  highlight     specular pass                             (screen)
 *
 * Recolouring: a neutral, desaturated crochet photograph carries the texture and
 * shading; colour comes from a solid fill masked by that photo's alpha, and the
 * photo multiplies back over it so loops and shadows survive. Values where this
 * breaks down declare `render: 'prerendered'` and ship their own body layer —
 * both paths render through the same stack.
 *
 * Until the real .webp files exist, `BagPreview` draws each role as a vector
 * layer on identical geometry, so the configurator is fully usable today. Real
 * craft geometry is preserved when the photographs replace them (plan §31).
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type LayerRole =
  | 'shadow'
  | 'bodyTint'
  | 'bodyTexture'
  | 'bodyPrerendered'
  | 'detail'
  | 'handle'
  | 'highlight';

export type BlendMode = 'normal' | 'multiply' | 'screen' | 'soft-light';

export interface PreviewLayer {
  id: string;
  role: LayerRole;
  src: string | null;
  /** Alpha mask for colour-only layers. */
  maskSrc?: string;
  color?: string;
  blend: BlendMode;
  opacity: number;
}

const kebab = (value: string): string =>
  value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

export function buildPreviewLayers(selection: BagSelection): PreviewLayer[] {
  const model = getModel(selection.model);
  const body = getYarn(selection.body);
  const detail = getDetail(selection.detail);
  const handle = getHandle(selection.handle);
  const dir = model.assetDir;

  const layers: PreviewLayer[] = [
    {
      id: `shadow-${model.id}`,
      role: 'shadow',
      src: `${dir}/base/shadow.webp`,
      blend: 'multiply',
      opacity: 0.9,
    },
  ];

  if (body.render === 'prerendered' && body.prerenderedAsset?.[model.id]) {
    layers.push({
      id: `body-${model.id}-${body.id}`,
      role: 'bodyPrerendered',
      src: `${dir}/base/${body.prerenderedAsset[model.id]}`,
      color: body.hex,
      blend: 'normal',
      opacity: 1,
    });
  } else {
    layers.push(
      {
        id: `tint-${model.id}-${body.id}`,
        role: 'bodyTint',
        src: null,
        maskSrc: `${dir}/base/body-neutral.webp`,
        color: body.hex,
        blend: 'normal',
        opacity: 1,
      },
      {
        id: `texture-${model.id}`,
        role: 'bodyTexture',
        src: `${dir}/base/body-neutral.webp`,
        blend: body.blend ?? 'multiply',
        opacity: 1,
      },
    );
  }

  if (detail.style !== 'none') {
    layers.push({
      id: `detail-${model.id}-${detail.id}`,
      role: 'detail',
      src: `${dir}/details/${kebab(detail.id)}.webp`,
      color: detail.hex,
      blend: 'normal',
      opacity: 1,
    });
  }

  layers.push(
    {
      id: `handle-${model.id}-${handle.id}`,
      role: 'handle',
      src: `${dir}/handles/${kebab(handle.id)}.webp`,
      color: handle.hex,
      blend: 'normal',
      opacity: 1,
    },
    {
      id: `highlight-${model.id}`,
      role: 'highlight',
      src: `${dir}/base/highlights.webp`,
      blend: 'screen',
      opacity: 0.55,
    },
  );

  return layers;
}

/** Every image URL a combination needs — used for preloading. */
export function layerAssetPaths(selection: BagSelection): string[] {
  const paths = new Set<string>();
  for (const layer of buildPreviewLayers(selection)) {
    if (layer.src) paths.add(layer.src);
    if (layer.maskSrc) paths.add(layer.maskSrc);
  }
  return [...paths];
}

/**
 * Layers for the combinations the visitor is most likely to reach next. Fetched
 * at idle once the configurator is on screen, so option changes never flicker —
 * and never on first load (plan §35).
 */
export function adjacentAssetPaths(
  selection: BagSelection,
  options: { bodies: string[]; details: string[]; handles: string[] },
): string[] {
  const current = new Set(layerAssetPaths(selection));
  const paths = new Set<string>();
  const add = (next: BagSelection) =>
    layerAssetPaths(next).forEach((p) => {
      if (!current.has(p)) paths.add(p);
    });

  options.bodies.forEach((body) => add({ ...selection, body }));
  options.details.forEach((detail) => add({ ...selection, detail }));
  options.handles.forEach((handle) => add({ ...selection, handle }));

  return [...paths];
}
