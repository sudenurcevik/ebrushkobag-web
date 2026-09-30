import type { ArchiveItem, ImageRef, Product, SeasonId } from './types';

/**
 * Products are editorial moments, not shop cards (plan §22).
 *
 * `status` decides the language: nothing is ever "SOLD OUT" here — a finished
 * piece becomes ARŞİV or TEK PARÇA, and the call to action turns it into the
 * starting point for a new commission instead of dead inventory.
 *
 * The current eight come from the vitrin placeholder pack
 * (EBRUSHKOBAG_VITRIN_PLACEHOLDERS/docs/manifest.csv): each bag sits under its
 * `season_primary`, its photograph in /public/images/products/<season>/<id>.jpg.
 * They are stand-ins on satin until the final shoot; the frame sizes below are
 * still the ones that shoot should deliver.
 *
 * HALKA NO. 01 — the fuchsia ring-handle bag — stays in the collection for good.
 */
const productPhoto = (season: SeasonId, id: string, alt: string, label: string): ImageRef => ({
  src: `/images/products/${season}/${id}.jpg`,
  alt,
  width: 1600,
  height: 2000,
  placeholderLabel: label,
  required: true,
});

export const PRODUCTS: Product[] = [
  {
    id: 'halka-01',
    name: 'HALKA NO. 01',
    materials: 'Fuşya pamuk ipi / Halka sap / Örgü kordon askı',
    note: 'Halka sap, örgü kordon askı ve baştan sona fuşya. Koleksiyonun sabit parçası; her bahar vitrinin başında.',
    season: 'spring',
    status: 'current',
    image: productPhoto(
      'spring',
      'halka-01',
      'Pembe saten üzerinde halka saplı, örgü kordon askılı fuşya kroşe çanta',
      'HALKA NO. 01',
    ),
    inspires: { model: 'bloom', body: 'hotpink', detail: 'none', handle: 'knitStrap' },
  },
  {
    id: 'seafoam-02',
    name: 'SEAFOAM NO. 02',
    materials: 'Pamuk ipi / Boncuk sap / Altın kilit',
    note: 'Deniz köpüğü gövde, renk renk boncuktan sap. Bahardan yaza geçerken elde taşınacak parça.',
    season: 'spring',
    status: 'oneOfOne',
    image: productPhoto(
      'spring',
      'seafoam-02',
      'Mint saten üzerinde renkli boncuk saplı, kapaklı deniz köpüğü örgü çanta',
      'SEAFOAM NO. 02',
    ),
    inspires: { model: 'bloom', body: 'turquoise', detail: 'woodBeads', handle: 'knitStrap' },
  },
  {
    id: 'hasir-03',
    name: 'HASIR NO. 03',
    materials: 'Doğal hasır ip / Örgü sap / El yapımı',
    note: 'Dama desenli hasır örgü, kum tonları. Plajda rahat, şehirde de şık.',
    season: 'summer',
    status: 'current',
    image: productPhoto(
      'summer',
      'hasir-03',
      'Şampanya rengi saten üzerinde dama desenli doğal hasır tote çanta',
      'HASIR NO. 03',
    ),
    inspires: { model: 'patch', body: 'cream', detail: 'none', handle: 'knitStrap' },
  },
  {
    id: 'resort-04',
    name: 'RESORT NO. 04',
    materials: 'Doğal örgü ip / Ahşap sap / El yapımı',
    note: 'Çapraz ilmekli doğal örgü, yuvarlak ahşap sap. Resort akşamlarının çantası.',
    season: 'summer',
    status: 'archive',
    image: productPhoto(
      'summer',
      'resort-04',
      'Krem saten üzerinde yuvarlak ahşap saplı, çapraz ilmekli taba örgü çanta',
      'RESORT NO. 04',
    ),
    inspires: { model: 'sunset', body: 'cream', detail: 'none', handle: 'woodHandle' },
  },
  {
    id: 'yelpaze-05',
    name: 'YELPAZE NO. 05',
    materials: 'Kalın pamuk ipi / Deri sap / El yapımı',
    note: 'Yelpaze ilmekleri ve deri saplar. Sonbaharın en sıcak, en dokulu tonu.',
    season: 'autumn',
    status: 'oneOfOne',
    image: productPhoto(
      'autumn',
      'yelpaze-05',
      'Bronz saten üzerinde yelpaze ilmekli, deri saplı çikolata kahvesi tote',
      'YELPAZE NO. 05',
    ),
    inspires: { model: 'sunset', body: 'chocolate', detail: 'none', handle: 'brownLeather' },
  },
  {
    id: 'kircilli-06',
    name: 'KIRÇILLI NO. 06',
    materials: 'Kırçıllı ip / Deri sap / Kare paneller',
    note: 'Sarı-kahve kırçıllı kareler, kahve çerçeve. Elde örülmüş bir sonbahar paleti.',
    season: 'autumn',
    status: 'current',
    image: productPhoto(
      'autumn',
      'kircilli-06',
      'Altın saten üzerinde kahve çerçeveli, sarı kırçıllı kare panelli tote',
      'KIRÇILLI NO. 06',
    ),
    inspires: { model: 'patch', body: 'olive', detail: 'none', handle: 'brownLeather' },
  },
  {
    id: 'shine-07',
    name: 'SHINE NO. 07',
    materials: 'Metalik ip / Zincir sap / El yapımı',
    note: 'Gümüş metalik clutch. Işığı doğrudan yansıtan tek parçamız.',
    season: 'winter',
    status: 'current',
    image: productPhoto(
      'winter',
      'shine-07',
      'Gümüş saten üzerinde zincir askılı metalik örgü clutch',
      'SHINE NO. 07',
    ),
    inspires: { model: 'shine', body: 'silver', detail: 'silver', handle: 'chain' },
  },
  {
    id: 'midnight-08',
    name: 'MIDNIGHT NO. 08',
    materials: 'Pul işlemeli ip / Örgü sap / El yapımı',
    note: 'Kat kat siyah pul, örgü sap. Gece ışığında her adımda değişiyor.',
    season: 'winter',
    status: 'oneOfOne',
    image: productPhoto(
      'winter',
      'midnight-08',
      'Gümüş saten üzerinde kat kat siyah pullu hobo çanta',
      'MIDNIGHT NO. 08',
    ),
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
