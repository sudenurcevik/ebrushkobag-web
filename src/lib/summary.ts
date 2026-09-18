import { BRAND } from '@/config/brand';
import type { BagSelection } from '../data/types';
import { getDetail, getHandle, getModel, getYarn, priceFor } from './catalog';
import { buildDesignCode } from './design-code';
import { formatPrice } from './format';
import { selectionToShareUrl } from './url-state';

export interface DesignSummary {
  code: string;
  modelName: string;
  bodyName: string;
  detailName: string;
  handleName: string;
  dimensions: string;
  materials: string;
  productionTime: string;
  price: string;
  lines: { label: string; value: string }[];
}

export function buildSummary(selection: BagSelection): DesignSummary {
  const model = getModel(selection.model);
  const body = getYarn(selection.body);
  const detail = getDetail(selection.detail);
  const handle = getHandle(selection.handle);

  return {
    code: buildDesignCode(selection),
    modelName: model.name,
    bodyName: body.name,
    detailName: detail.name,
    handleName: handle.name,
    dimensions: model.dimensions,
    materials: model.materials,
    productionTime: model.productionTime,
    price: formatPrice(priceFor(selection).total),
    lines: [
      { label: 'Model', value: model.name },
      { label: 'İp', value: body.name },
      { label: 'Detay', value: detail.name },
      { label: 'Sap', value: handle.name },
    ],
  };
}

/**
 * The text copied before Instagram opens. Instagram cannot be relied on to
 * accept a prefilled message, so the visitor arrives with everything already on
 * their clipboard (plan §30).
 */
export function buildOrderMessage(selection: BagSelection, origin?: string): string {
  const s = buildSummary(selection);
  return [
    'Merhaba, bu tasarımı oluşturdum:',
    '',
    `Tasarım: ${s.code}`,
    `Model: ${s.modelName}`,
    `İp: ${s.bodyName}`,
    `Detay: ${s.detailName}`,
    `Sap: ${s.handleName}`,
    '',
    selectionToShareUrl(selection, origin),
  ].join('\n');
}

export function buildReadableSummary(selection: BagSelection): string {
  const s = buildSummary(selection);
  const detailPart = s.detailName === 'Detaysız' ? 'detaysız' : `${s.detailName.toLowerCase()} detaylı`;
  return `${s.modelName}, ${s.bodyName.toLowerCase()} ip, ${detailPart}, ${s.handleName.toLowerCase()}`;
}

export const designFileName = (selection: BagSelection): string =>
  `ebrushkobag-${buildDesignCode(selection).toLowerCase()}.png`;

export const brandName = BRAND.name;
