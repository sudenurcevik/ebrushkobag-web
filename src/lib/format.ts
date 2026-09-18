import { BRAND } from '@/config/brand';

const formatter = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });

export const formatPrice = (value: number): string =>
  `${formatter.format(value)} ${BRAND.currency.symbol}`;

export const pad2 = (n: number): string => String(n).padStart(2, '0');
