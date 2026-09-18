import { DETAILS, HANDLES, MODELS, YARNS } from '../data/configurator';
import type { BagSelection } from '../data/types';
import { getAvailability } from './catalog';
import { layerAssetPaths } from './preview';

/**
 * Every configurator asset the catalog can actually ask for. Combinations that
 * compatibility rules exclude are skipped, so the manifest never asks the brand
 * to photograph a bag we would refuse to make.
 */
export function allConfiguratorAssetPaths(): string[] {
  const paths = new Set<string>();

  for (const model of MODELS) {
    for (const body of YARNS) {
      const partial = { model: model.id, body: body.id } as BagSelection;
      if (!getAvailability('body', body.id, partial).available) continue;

      for (const detail of DETAILS) {
        const withDetail = { ...partial, detail: detail.id } as BagSelection;
        if (!getAvailability('detail', detail.id, withDetail).available) continue;

        for (const handle of HANDLES) {
          const full: BagSelection = { ...withDetail, handle: handle.id };
          if (!getAvailability('handle', handle.id, full).available) continue;
          layerAssetPaths(full).forEach((path) => paths.add(path));
        }
      }
    }
  }

  return [...paths].sort();
}

export function allThumbnailPaths(): string[] {
  return [...YARNS, ...DETAILS, ...HANDLES]
    .map((option) => option.thumbnail?.src)
    .filter((src): src is string => Boolean(src))
    .sort();
}
