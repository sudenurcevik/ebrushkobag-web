import type { Season, SeasonBridge, SeasonId } from './types';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * THE FOUR SEASONS
 *
 * Every colour on the site is read from here. Components receive a `Season` and
 * ask it for its accent, ground and knit palette — no component contains a
 * seasonal hex value (plan §33).
 *
 * `required: true` on an image marks an asset the brand still owes us; until it
 * lands the site draws a clearly-labelled placeholder rather than faking it
 * (plan §32).
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const SEASON_ORDER: SeasonId[] = ['spring', 'summer', 'autumn', 'winter'];

export const SEASONS: Season[] = [
  {
    id: 'spring',
    slug: 'bahar',
    index: '01',
    label: 'BAHAR',
    labelEn: 'SPRING',
    headline: 'Renk geri döndü.',
    body: 'Kış boyunca bekleyen ipler masaya geri çıktı. Bahar koleksiyonu pastel ama uslu değil: patchwork gövdeler, ahşap boncuklar, birbirine hiç benzemeyen parçalar.',
    mood: ['patchwork', 'tığ işi', 'ahşap boncuk', 'pastel'],

    background: '#FEE9EA',
    surface: '#FFF5F5',
    accent: '#A0DB6B',
    accentSoft: '#FFDE5A',
    ink: '#241A20',
    inkSoft: '#5A4B53',
    line: '#F3D3D6',

    palette: [
      { name: 'Blush', hex: '#FEE9EA' },
      { name: 'Lime', hex: '#A0DB6B' },
      { name: 'Sunny', hex: '#FFDE5A' },
      { name: 'Lilac', hex: '#CBB8F5' },
      { name: 'Cream', hex: '#FFFBF4' },
    ],
    knit: { yarn: '#A0DB6B', shade: '#7FBC4B', ground: '#FEE9EA' },

    images: {
      hero: {
        src: '/images/seasons/spring/hero.webp',
        alt: 'Renkli patchwork tığ işi çanta, açık pembe bir zeminde',
        width: 2000,
        height: 2500,
        placeholderLabel: 'BAHAR — HERO',
        required: true,
      },
      product: {
        src: '/images/seasons/spring/product.webp',
        alt: 'Patchwork çantanın tam boy ürün çekimi',
        width: 1800,
        height: 1800,
        placeholderLabel: 'BAHAR — ÜRÜN',
        required: true,
      },
      macro: {
        src: '/images/seasons/spring/macro.webp',
        alt: 'Bahar ipinin makro dokusu',
        width: 2400,
        height: 1600,
        placeholderLabel: 'NEEDS_MACRO_ASSET — BAHAR',
        required: true,
      },
    },
    productIds: ['patchwork-01', 'bloom-02'],
  },

  {
    id: 'summer',
    slug: 'yaz',
    index: '02',
    label: 'YAZ',
    labelEn: 'SUMMER',
    headline: 'Güneş batınca da renk kalır.',
    body: 'Daha hafif ipler, daha yüksek kontrast. Yaz parçaları gün boyunca çantada, akşam omuzda. Periwinkle mavisi ile sıcak sarı yan yana durabiliyor.',
    mood: ['resort', 'gün batımı', 'boncuk', 'hafif ip'],

    background: '#88ADFE',
    surface: '#C3D4FE',
    accent: '#FFDE5A',
    accentSoft: '#FF68C4',
    ink: '#151B33',
    inkSoft: '#2E3A5C',
    line: '#A7C1FE',

    palette: [
      { name: 'Periwinkle', hex: '#88ADFE' },
      { name: 'Sunny', hex: '#FFDE5A' },
      { name: 'Hot Pink', hex: '#FF68C4' },
      { name: 'Turquoise', hex: '#5FD3D0' },
      { name: 'Cream', hex: '#FFFBF4' },
    ],
    knit: { yarn: '#FFDE5A', shade: '#F5C92E', ground: '#88ADFE' },

    images: {
      hero: {
        src: '/images/seasons/summer/hero.webp',
        alt: 'Gün batımında, açık mavi tonlarda yaz çantası',
        width: 2000,
        height: 2500,
        placeholderLabel: 'YAZ — HERO',
        required: true,
      },
      product: {
        src: '/images/seasons/summer/product.webp',
        alt: 'Yaz koleksiyonundan bir çantanın ürün çekimi',
        width: 1800,
        height: 1800,
        placeholderLabel: 'YAZ — ÜRÜN',
        required: true,
      },
      macro: {
        src: '/images/seasons/summer/macro.webp',
        alt: 'Yaz ipinin makro dokusu',
        width: 2400,
        height: 1600,
        placeholderLabel: 'NEEDS_MACRO_ASSET — YAZ',
        required: true,
      },
    },
    productIds: ['sorbet-03', 'marina-04'],
  },

  {
    id: 'autumn',
    slug: 'sonbahar',
    index: '03',
    label: 'SONBAHAR',
    labelEn: 'AUTUMN',
    headline: 'Doku biraz daha derinleşir.',
    body: 'İp kalınlaşıyor, ilmekler büyüyor. Sonbahar parçaları elde daha ağır durur; çikolata kahvesi ve bordo, kremle birlikte çalışır.',
    mood: ['kalın ilmek', 'bordo', 'çikolata', 'sıcak ışık'],

    background: '#4A2E22',
    surface: '#5E3D2E',
    accent: '#D69AA0',
    accentSoft: '#7A2338',
    ink: '#FFFBF4',
    inkSoft: '#E4CFC4',
    line: '#6B4A38',

    palette: [
      { name: 'Chocolate', hex: '#4A2E22' },
      { name: 'Burgundy', hex: '#7A2338' },
      { name: 'Dusty Rose', hex: '#D69AA0' },
      { name: 'Warm Cream', hex: '#FFFBF4' },
      { name: 'Olive', hex: '#6E7345' },
    ],
    knit: { yarn: '#D69AA0', shade: '#A96F76', ground: '#4A2E22' },

    images: {
      hero: {
        src: '/images/seasons/autumn/hero.webp',
        alt: 'Gün batımı ışığında kahverengi el örgüsü çanta',
        width: 2000,
        height: 2500,
        placeholderLabel: 'SONBAHAR — HERO',
        required: true,
      },
      product: {
        src: '/images/seasons/autumn/product.webp',
        alt: 'Kahverengi örgü çantanın ürün çekimi',
        width: 1800,
        height: 1800,
        placeholderLabel: 'SONBAHAR — ÜRÜN',
        required: true,
      },
      macro: {
        src: '/images/seasons/autumn/macro.webp',
        alt: 'Kalın sonbahar ipinin makro dokusu',
        width: 2400,
        height: 1600,
        placeholderLabel: 'NEEDS_MACRO_ASSET — SONBAHAR',
        required: true,
      },
    },
    productIds: ['sunset-05', 'ember-06'],
  },

  {
    id: 'winter',
    slug: 'kis',
    index: '04',
    label: 'KIŞ',
    labelEn: 'WINTER',
    headline: 'Gece biraz daha parlar.',
    body: 'Yılın en gösterişli bölümü. Metalik gümüş, siyah pul, lacivert. Kış parçaları gündüz sakin durur, ışık altında değişir.',
    mood: ['metalik', 'pul', 'gece', 'yansıma'],

    background: '#161823',
    surface: '#2A2D3A',
    accent: '#C7CCD6',
    accentSoft: '#FF68C4',
    ink: '#FFFBF4',
    inkSoft: '#B9BECD',
    line: '#343849',

    palette: [
      { name: 'Deep Navy', hex: '#161823' },
      { name: 'Charcoal', hex: '#2A2D3A' },
      { name: 'Silver', hex: '#C7CCD6' },
      { name: 'Periwinkle', hex: '#88ADFE' },
      { name: 'Hot Pink', hex: '#FF68C4' },
    ],
    knit: { yarn: '#C7CCD6', shade: '#8A909E', ground: '#161823' },

    images: {
      hero: {
        src: '/images/seasons/winter/hero.webp',
        alt: 'Gece ışığında siyah pullu çanta, kampanya karesi',
        width: 2000,
        height: 2500,
        placeholderLabel: 'KIŞ — HERO',
        required: true,
      },
      product: {
        src: '/images/seasons/winter/product.webp',
        alt: 'Gümüş metalik clutch ürün çekimi',
        width: 1800,
        height: 1800,
        placeholderLabel: 'KIŞ — ÜRÜN',
        required: true,
      },
      macro: {
        src: '/images/seasons/winter/macro.webp',
        alt: 'Metalik kış ipinin makro dokusu',
        width: 2400,
        height: 1600,
        placeholderLabel: 'NEEDS_MACRO_ASSET — KIŞ',
        required: true,
      },
    },
    productIds: ['shine-07', 'midnight-08'],
  },
];

/**
 * The three signature bridges. Colour stops come straight from plan §14 — the
 * thread leaves one season in its own accent and arrives wearing the next one's.
 */
export const BRIDGES: SeasonBridge[] = [
  {
    id: 'spring-summer',
    from: 'spring',
    to: 'summer',
    threadStops: ['#A0DB6B', '#FFDE5A', '#88ADFE'],
    groundStops: ['#FEE9EA', '#FFF3D6', '#88ADFE'],
    knitFrom: { yarn: '#A0DB6B', shade: '#7FBC4B', ground: '#FEE9EA' },
    knitTo: { yarn: '#FFDE5A', shade: '#F5C92E', ground: '#88ADFE' },
    whisper: 'Aynı iplik, başka bir mevsim.',
  },
  {
    id: 'summer-autumn',
    from: 'summer',
    to: 'autumn',
    threadStops: ['#FF68C4', '#D69AA0', '#7A2338', '#4A2E22'],
    groundStops: ['#88ADFE', '#D69AA0', '#7A2338', '#4A2E22'],
    knitFrom: { yarn: '#FFDE5A', shade: '#F5C92E', ground: '#88ADFE' },
    knitTo: { yarn: '#D69AA0', shade: '#A96F76', ground: '#4A2E22' },
    whisper: 'İlmek kalınlaşıyor.',
  },
  {
    id: 'autumn-winter',
    from: 'autumn',
    to: 'winter',
    threadStops: ['#7A2338', '#161823', '#2A2D3A', '#C7CCD6'],
    groundStops: ['#4A2E22', '#2A2D3A', '#161823', '#161823'],
    knitFrom: { yarn: '#D69AA0', shade: '#A96F76', ground: '#4A2E22' },
    knitTo: { yarn: '#C7CCD6', shade: '#8A909E', ground: '#161823' },
    whisper: 'Işık ipe giriyor.',
  },
];

export const getSeason = (id: SeasonId): Season =>
  SEASONS.find((season) => season.id === id) ?? SEASONS[0];

export const bridgeAfter = (id: SeasonId): SeasonBridge | undefined =>
  BRIDGES.find((bridge) => bridge.from === id);
