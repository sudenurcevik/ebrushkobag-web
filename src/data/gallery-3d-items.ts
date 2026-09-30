import type { SeasonId } from './types';

/**
 * Frames for the /rotationalGallery3D experiment.
 *
 * Deliberately its own file, not shared with /rotationalGallery: the two
 * experiments are compared side by side, and either one can be deleted
 * without breaking the other. The photographs are the vitrin placeholders in
 * public/images/products/<season>/<id>.jpg.
 */
export interface Gallery3DItem {
  id: string;
  image: string;
  alt: string;
  title: string;
  season: SeasonId;
  description: string;
}

export const SEASON_LABEL_3D: Record<SeasonId, { full: string; short: string }> = {
  spring: { full: 'SPRING', short: 'SPR' },
  summer: { full: 'SUMMER', short: 'SUM' },
  autumn: { full: 'AUTUMN', short: 'AUT' },
  winter: { full: 'WINTER', short: 'WIN' },
};

export const GALLERY_3D_ITEMS: Gallery3DItem[] = [
  {
    id: 'fuchsia-ring',
    image: '/images/products/spring/halka-01.jpg',
    alt: 'Pembe saten üzerinde halka saplı, örgü kordon askılı fuşya kroşe çanta',
    title: 'Fuşya Mini Halka',
    season: 'spring',
    description: 'Canlı renkler, yumuşak örgü ve oyunbaz bir siluet.',
  },
  {
    id: 'seafoam-beaded',
    image: '/images/products/spring/seafoam-02.jpg',
    alt: 'Mint saten üzerinde renkli boncuk saplı, kapaklı deniz köpüğü örgü çanta',
    title: 'Deniz Köpüğü Boncuk',
    season: 'spring',
    description: 'Renk renk boncuktan bir sap; bahardan yaza geçen parça.',
  },
  {
    id: 'raffia-tote',
    image: '/images/products/summer/hasir-03.jpg',
    alt: 'Şampanya rengi saten üzerinde dama desenli doğal hasır tote çanta',
    title: 'Doğal Hasır Tote',
    season: 'summer',
    description: 'Kum tonlarında dama örgü. Plajda rahat, şehirde şık.',
  },
  {
    id: 'tan-wood-handle',
    image: '/images/products/summer/resort-04.jpg',
    alt: 'Krem saten üzerinde yuvarlak ahşap saplı, çapraz ilmekli taba örgü çanta',
    title: 'Ahşap Saplı Resort',
    season: 'summer',
    description: 'Çapraz ilmekler, yuvarlak ahşap sap; uzun yaz akşamları için.',
  },
  {
    id: 'chocolate-crochet',
    image: '/images/products/autumn/yelpaze-05.jpg',
    alt: 'Bronz saten üzerinde yelpaze ilmekli, deri saplı çikolata kahvesi tote',
    title: 'Çikolata Yelpaze',
    season: 'autumn',
    description: 'Yelpaze ilmekleri ve deri saplar; sonbaharın en sıcak tonu.',
  },
  {
    id: 'marled-patch',
    image: '/images/products/autumn/kircilli-06.jpg',
    alt: 'Altın saten üzerinde kahve çerçeveli, sarı kırçıllı kare panelli tote',
    title: 'Kırçıllı Kareler',
    season: 'autumn',
    description: 'Sarı-kahve kırçıllı paneller, elde örülmüş bir sonbahar paleti.',
  },
  {
    id: 'black-sequin-hobo',
    image: '/images/products/winter/midnight-08.jpg',
    alt: 'Gümüş saten üzerinde kat kat siyah pullu hobo çanta',
    title: 'Gece Payeti',
    season: 'winter',
    description: 'Kat kat siyah pul; gece ışığında her adımda başka parlar.',
  },
  {
    id: 'silver-clutch',
    image: '/images/products/winter/shine-07.jpg',
    alt: 'Gümüş saten üzerinde zincir askılı metalik örgü clutch',
    title: 'Gümüş Clutch',
    season: 'winter',
    description: 'Metalik iple örülmüş, ışığı yansıtan küçük bir akşam parçası.',
  },
];
