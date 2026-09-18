import type { ArchiveItem, Product } from './types';

/**
 * Products are editorial moments, not shop cards (plan §22).
 *
 * `status` decides the language: nothing is ever "SOLD OUT" here — a finished
 * piece becomes ARŞİV or TEK PARÇA, and the call to action turns it into the
 * starting point for a new commission instead of dead inventory.
 *
 * The four pieces with real photography (plan §39) are patchwork-01,
 * sunset-05, shine-07 and midnight-08.
 */
export const PRODUCTS: Product[] = [
  {
    id: 'patchwork-01',
    name: 'PATCHWORK NO. 01',
    materials: 'Pamuk ipi / Ahşap boncuk / El yapımı',
    note: 'Her karesi ayrı örülür, sonra tek tek birleştirilir. İki tanesi asla aynı çıkmıyor.',
    season: 'spring',
    status: 'oneOfOne',
    image: {
      src: '/images/products/patchwork/patchwork-01.webp',
      alt: 'Renkli patchwork tığ işi çanta',
      width: 1600,
      height: 2000,
      placeholderLabel: 'PATCHWORK NO. 01',
      required: true,
    },
    inspires: { model: 'patch', body: 'lime', detail: 'woodBeads', handle: 'knitStrap' },
  },
  {
    id: 'bloom-02',
    name: 'BLOOM NO. 02',
    materials: 'Pamuk ipi / Ahşap sap / El yapımı',
    note: 'Merkezden dışa doğru örülen daire gövde. Bahar paletindeki en sakin parça.',
    season: 'spring',
    status: 'current',
    image: {
      src: '/images/products/patchwork/bloom-02.webp',
      alt: 'Pastel tonlarda yuvarlak tığ işi çanta',
      width: 1600,
      height: 2000,
      placeholderLabel: 'BLOOM NO. 02',
      required: true,
    },
    inspires: { model: 'bloom', body: 'blush', detail: 'pearl', handle: 'woodHandle' },
  },
  {
    id: 'sorbet-03',
    name: 'SORBET NO. 03',
    materials: 'Hafif pamuk ipi / Cam boncuk / El yapımı',
    note: 'Yaz paletinin en yüksek kontrastlı parçası: periwinkle gövde, sarı detay.',
    season: 'summer',
    status: 'current',
    image: {
      src: '/images/products/patchwork/sorbet-03.webp',
      alt: 'Mavi ve sarı tonlarda yaz çantası',
      width: 1600,
      height: 2000,
      placeholderLabel: 'SORBET NO. 03',
      required: true,
    },
    inspires: { model: 'bloom', body: 'periwinkle', detail: 'gold', handle: 'knitStrap' },
  },
  {
    id: 'marina-04',
    name: 'MARINA NO. 04',
    materials: 'Hafif pamuk ipi / Deri sap / El yapımı',
    note: 'Gün boyu taşınacak kadar hafif, akşam için yeterince iddialı.',
    season: 'summer',
    status: 'archive',
    image: {
      src: '/images/products/patchwork/marina-04.webp',
      alt: 'Turkuaz detaylı yaz çantası',
      width: 1600,
      height: 2000,
      placeholderLabel: 'MARINA NO. 04',
      required: true,
    },
    inspires: { model: 'sunset', body: 'turquoise', detail: 'none', handle: 'brownLeather' },
  },
  {
    id: 'sunset-05',
    name: 'SUNSET NO. 05',
    materials: 'Kalın pamuk ipi / Deri sap / El yapımı',
    note: 'Gün batımında çekildi, o yüzden bu ismi aldı. Sonbaharın imza parçası.',
    season: 'autumn',
    status: 'oneOfOne',
    image: {
      src: '/images/products/brown-knit/sunset-05.webp',
      alt: 'Gün batımı ışığında kahverengi el örgüsü çanta',
      width: 1600,
      height: 2000,
      placeholderLabel: 'SUNSET NO. 05',
      required: true,
    },
    inspires: { model: 'sunset', body: 'chocolate', detail: 'none', handle: 'brownLeather' },
  },
  {
    id: 'ember-06',
    name: 'EMBER NO. 06',
    materials: 'Kalın pamuk ipi / Örgü sap / El yapımı',
    note: 'Bordo gövde, krem astar. Kalın ilmek elde hissedilecek kadar belirgin.',
    season: 'autumn',
    status: 'current',
    image: {
      src: '/images/products/brown-knit/ember-06.webp',
      alt: 'Bordo kalın örgü çanta',
      width: 1600,
      height: 2000,
      placeholderLabel: 'EMBER NO. 06',
      required: true,
    },
    inspires: { model: 'patch', body: 'burgundy', detail: 'woodBeads', handle: 'knitStrap' },
  },
  {
    id: 'shine-07',
    name: 'SHINE NO. 07',
    materials: 'Metalik ip / Zincir sap / El yapımı',
    note: 'Gümüş metalik clutch. Işığı doğrudan yansıtan tek parçamız.',
    season: 'winter',
    status: 'current',
    image: {
      src: '/images/products/silver-clutch/shine-07.webp',
      alt: 'Gümüş metalik clutch çanta, ürün çekimi',
      width: 1600,
      height: 2000,
      placeholderLabel: 'SHINE NO. 07',
      required: true,
    },
    inspires: { model: 'shine', body: 'silver', detail: 'silver', handle: 'chain' },
  },
  {
    id: 'midnight-08',
    name: 'MIDNIGHT NO. 08',
    materials: 'Pul işlemeli ip / Zincir sap / El yapımı',
    note: 'Siyah pullu gövde. Kampanya karesinde omuzda görünüyor — ölçü fikri için iyi bir referans.',
    season: 'winter',
    status: 'oneOfOne',
    image: {
      src: '/images/products/black-sequin/midnight-08.webp',
      alt: 'Siyah pullu çantayı omzunda taşıyan bir kişi',
      width: 1600,
      height: 2000,
      placeholderLabel: 'MIDNIGHT NO. 08',
      required: true,
    },
    inspires: { model: 'shine', body: 'black', detail: 'silver', handle: 'chain' },
  },
];

export const getProduct = (id: string): Product | undefined =>
  PRODUCTS.find((product) => product.id === id);

export const productsForSeason = (ids: string[]): Product[] =>
  ids.map((id) => getProduct(id)).filter((p): p is Product => Boolean(p));

/** Language for a finished piece — heritage, never dead stock (plan §22). */
export const STATUS_LABEL: Record<Product['status'], string> = {
  current: 'ÜRETİLEBİLİR',
  archive: 'ARŞİV',
  oneOfOne: 'TEK PARÇA',
};

/**
 * The archive mosaic (plan §23). These are older Instagram frames — curated,
 * not a rigid grid. `weight` drives how much room a frame takes.
 */
export const ARCHIVE: ArchiveItem[] = [
  {
    id: 'archive-01',
    label: "SUMMER '25",
    caption: 'İlk patchwork denemesi. Renkleri elde kalan iplerden seçtik.',
    weight: 3,
    image: {
      src: '/images/archive/archive-01.webp',
      alt: 'Arşivden renkli patchwork çanta',
      width: 1600,
      height: 2000,
      placeholderLabel: 'ARŞİV 01',
      required: true,
    },
  },
  {
    id: 'archive-02',
    label: 'TEK PARÇA',
    caption: 'Bir daha aynısı örülmedi.',
    weight: 1,
    image: {
      src: '/images/archive/archive-02.webp',
      alt: 'Arşivden tek parça çanta',
      width: 1400,
      height: 1400,
      placeholderLabel: 'ARŞİV 02',
      required: true,
    },
  },
  {
    id: 'archive-03',
    label: 'EL YAPIMI',
    caption: 'Ahşap boncuk denemeleri.',
    weight: 2,
    image: {
      src: '/images/archive/archive-03.webp',
      alt: 'Ahşap boncuk detaylı arşiv çantası',
      width: 1600,
      height: 1200,
      placeholderLabel: 'ARŞİV 03',
      required: true,
    },
  },
  {
    id: 'archive-04',
    label: 'ÖNCEKİ TASARIM',
    caption: 'Zincir sapla ilk deneme.',
    weight: 1,
    image: {
      src: '/images/archive/archive-04.webp',
      alt: 'Zincir saplı arşiv çantası',
      width: 1400,
      height: 1750,
      placeholderLabel: 'ARŞİV 04',
      required: true,
    },
  },
  {
    id: 'archive-05',
    label: 'ARŞİV',
    caption: 'Kış paletiyle çalıştığımız ilk sezon.',
    weight: 2,
    image: {
      src: '/images/archive/archive-05.webp',
      alt: 'Koyu tonlarda arşiv çantası',
      width: 1600,
      height: 1200,
      placeholderLabel: 'ARŞİV 05',
      required: true,
    },
  },
  {
    id: 'archive-06',
    label: 'TEK PARÇA',
    caption: 'Sipariş üzerine, tek sayı.',
    weight: 1,
    image: {
      src: '/images/archive/archive-06.webp',
      alt: 'Arşivden özel sipariş çanta',
      width: 1400,
      height: 1750,
      placeholderLabel: 'ARŞİV 06',
      required: true,
    },
  },
  {
    id: 'archive-07',
    label: "SPRING '25",
    caption: 'Pastel dönem.',
    weight: 2,
    image: {
      src: '/images/archive/archive-07.webp',
      alt: 'Pastel tonlarda arşiv çantası',
      width: 1600,
      height: 2000,
      placeholderLabel: 'ARŞİV 07',
      required: true,
    },
  },
];
