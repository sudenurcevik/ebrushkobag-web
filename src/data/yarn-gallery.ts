import type { SeasonId } from './types';

/**
 * Data for the /yarnGallery experiment: one yarn running down through four
 * seasons, with the bag photographs floating around it on 3D cards.
 *
 * Deliberately independent of the other gallery experiments so any of them
 * can be deleted alone. All positions are in scene units (the yarn runs down
 * the y axis; the camera looks at it from +z).
 */

export interface YarnPhoto {
  id: string;
  /** Frame number shown on the card and in the caption. */
  number: number;
  image: string;
  alt: string;
  title: string;
  season: SeasonId;
  description: string;
}

export const YARN_PHOTOS: YarnPhoto[] = [
  {
    id: 'fuchsia-ring',
    number: 1,
    image: '/images/products/spring/halka-01.jpg',
    alt: 'Pembe saten üzerinde halka saplı, örgü kordon askılı fuşya kroşe çanta',
    title: 'Fuşya Mini Halka',
    season: 'spring',
    description: 'Canlı renkler, yumuşak örgü ve oyunbaz bir siluet.',
  },
  {
    id: 'seafoam-beaded',
    number: 2,
    image: '/images/products/spring/seafoam-02.jpg',
    alt: 'Mint saten üzerinde renkli boncuk saplı, kapaklı deniz köpüğü örgü çanta',
    title: 'Deniz Köpüğü Boncuk',
    season: 'spring',
    description: 'Renk renk boncuktan bir sap; bahardan yaza geçen parça.',
  },
  {
    id: 'raffia-tote',
    number: 3,
    image: '/images/products/summer/hasir-03.jpg',
    alt: 'Şampanya rengi saten üzerinde dama desenli doğal hasır tote çanta',
    title: 'Doğal Hasır Tote',
    season: 'summer',
    description: 'Kum tonlarında dama örgü. Plajda rahat, şehirde şık.',
  },
  {
    id: 'tan-wood-handle',
    number: 4,
    image: '/images/products/summer/resort-04.jpg',
    alt: 'Krem saten üzerinde yuvarlak ahşap saplı, çapraz ilmekli taba örgü çanta',
    title: 'Ahşap Saplı Resort',
    season: 'summer',
    description: 'Çapraz ilmekler, yuvarlak ahşap sap; uzun yaz akşamları için.',
  },
  {
    id: 'chocolate-crochet',
    number: 5,
    image: '/images/products/autumn/yelpaze-05.jpg',
    alt: 'Bronz saten üzerinde yelpaze ilmekli, deri saplı çikolata kahvesi tote',
    title: 'Çikolata Yelpaze',
    season: 'autumn',
    description: 'Yelpaze ilmekleri ve deri saplar; sonbaharın en sıcak tonu.',
  },
  {
    id: 'marled-patch',
    number: 6,
    image: '/images/products/autumn/kircilli-06.jpg',
    alt: 'Altın saten üzerinde kahve çerçeveli, sarı kırçıllı kare panelli tote',
    title: 'Kırçıllı Kareler',
    season: 'autumn',
    description: 'Sarı-kahve kırçıllı paneller, elde örülmüş bir sonbahar paleti.',
  },
  {
    id: 'black-sequin-hobo',
    number: 7,
    image: '/images/products/winter/midnight-08.jpg',
    alt: 'Gümüş saten üzerinde kat kat siyah pullu hobo çanta',
    title: 'Gece Payeti',
    season: 'winter',
    description: 'Kat kat siyah pul; gece ışığında her adımda başka parlar.',
  },
  {
    id: 'silver-clutch',
    number: 8,
    image: '/images/products/winter/shine-07.jpg',
    alt: 'Gümüş saten üzerinde zincir askılı metalik örgü clutch',
    title: 'Gümüş Clutch',
    season: 'winter',
    description: 'Metalik iple örülmüş, ışığı yansıtan küçük bir akşam parçası.',
  },
];

// ── Seasons along the yarn ─────────────────────────────────────────────────

export const YARN_SEASONS: SeasonId[] = ['spring', 'summer', 'autumn', 'winter'];

export const SEASON_NAME: Record<SeasonId, string> = {
  spring: 'SPRING',
  summer: 'SUMMER',
  autumn: 'AUTUMN',
  winter: 'WINTER',
};

/** Vertical distance between neighbouring cards within a season. */
export const CARD_SPACING = 2.2;
/**
 * Extra yarn between one season's last card and the next season's first,
 * around the knot: seasons are separate places on the reel, not one run of
 * cards.
 */
export const SEASON_GAP = 5;
/** Height of one season's stretch of yarn, in scene units. */
export const SEASON_SPAN = 5 * CARD_SPACING + SEASON_GAP;
/** The yarn's first season starts at y = 0 and runs down. */
export const seasonTop = (i: number) => -i * SEASON_SPAN;

export interface YarnPreset {
  /**
   * The yarn is a cord of two strands twisted round each other; each strand
   * is itself three plies. Colours per strand, ply by ply.
   */
  strands: [string[], string[]];
  /** Short fibres standing off the surface; colour and relative density. */
  fuzz: string;
  fuzzDensity: number;
  roughness: number;
  metalness: number;
  sheen: number;
  sheenColor: string;
  /** Winter only: tiny sequins caught in the yarn. */
  sequins?: string;
}

/**
 * The yarn changes fibre with the season, always as two contrasting strands:
 * fuchsia and fresh green cotton, sand raffia and sun yellow, chocolate and
 * caramel wool, silver and charcoal metallic.
 */
export const YARN_PRESETS: Record<SeasonId, YarnPreset> = {
  spring: {
    strands: [
      ['#E9429F', '#FF7FCB', '#F25CB0'],
      ['#8FCF5E', '#B5E08E', '#7FBC4B'],
    ],
    fuzz: '#FFB3DC',
    fuzzDensity: 0.8,
    roughness: 0.78,
    metalness: 0,
    sheen: 1,
    sheenColor: '#FFD1EA',
  },
  summer: {
    strands: [
      ['#D9B77E', '#E8CD96', '#C79E62'],
      ['#F7C94A', '#FFDF85', '#EDB52E'],
    ],
    fuzz: '#F2DDAA',
    fuzzDensity: 0.45,
    roughness: 0.85,
    metalness: 0,
    sheen: 0.8,
    sheenColor: '#FFF1CF',
  },
  autumn: {
    strands: [
      ['#5B3524', '#6B4029', '#4A2E22'],
      ['#B8672F', '#D08A4A', '#9E5528'],
    ],
    fuzz: '#A0704A',
    fuzzDensity: 1.6,
    roughness: 0.85,
    metalness: 0,
    sheen: 1,
    sheenColor: '#E7B98C',
  },
  winter: {
    strands: [
      ['#C7CCD6', '#DDE1EA', '#AEB4C2'],
      ['#2A2D3A', '#3A3E4C', '#1F2230'],
    ],
    fuzz: '#D9DEE8',
    fuzzDensity: 0.35,
    roughness: 0.38,
    metalness: 0.55,
    sheen: 0.6,
    sheenColor: '#F2F4FA',
    sequins: '#E6E9F0',
  },
};

/**
 * Each season's glass for the info cards, and the ink written on it — in
 * the same bright colours as the yarn: hot pink with fresh green for spring,
 * sun yellow with turquoise for summer, rust with plum for autumn,
 * periwinkle with lilac for winter. `accent` inks the etched motif in the
 * corner of the text: a blossom sprig, a sun, a veined leaf, a frost fern.
 */
export interface CardTheme {
  glass: string;
  rim: string;
  ink: string;
  inkSoft: string;
  inkMuted: string;
  accent: string;
}

export const CARD_THEME: Record<SeasonId, CardTheme> = {
  spring: { glass: '#FFF4FA', rim: '#FF68C4', ink: '#2E1A2A', inkSoft: '#57414F', inkMuted: '#E9429F', accent: '#7FBC4B' },
  summer: { glass: '#FFFBEC', rim: '#F5B82E', ink: '#2A2418', inkSoft: '#54492F', inkMuted: '#E0901C', accent: '#2FB5C9' },
  autumn: { glass: '#FFF3E6', rim: '#D2692A', ink: '#33200F', inkSoft: '#5C4130', inkMuted: '#C0561F', accent: '#9C4A6E' },
  winter: { glass: '#F3F6FF', rim: '#5F8BF5', ink: '#1C2133', inkSoft: '#434A63', inkMuted: '#5F8BF5', accent: '#8C7BD8' },
};

/**
 * The opening's sky: warm ivory paper with a soft light in the middle — no
 * season yet, so the pink and periwinkle name stands clear of it and spring
 * visibly arrives when the ball comes down onto the spine.
 */
export const OPENING_SKY = [
  'radial-gradient(55% 45% at 50% 42%, rgba(255, 255, 255, 0.85), transparent 70%)',
  'linear-gradient(180deg, #FAF7F2 0%, #F4F0E9 100%)',
].join(',');

/**
 * Each season's sky, painted in DOM behind the transparent canvas — as
 * bright as the yarn, but still colour and light, never scenery:
 *
 * - spring: pools of hot pink, sun yellow, fresh green and periwinkle
 * - summer: a clear blue sky, a strong sun high on the right, coral and a
 *   turquoise sea-light low down
 * - autumn: golden hour — amber, rust and a touch of plum
 * - winter: periwinkle and lilac light under a bright white sky
 *
 * `fog` matches the sky around the reel, so distant cards melt into it.
 */
export const SEASON_BACKDROP: Record<SeasonId, { fog: string; sky: string }> = {
  spring: {
    fog: '#FBE9F2',
    sky: [
      'radial-gradient(45% 40% at 14% 16%, rgba(255, 104, 196, 0.55), transparent 70%)',
      'radial-gradient(42% 38% at 88% 14%, rgba(255, 216, 77, 0.55), transparent 70%)',
      'radial-gradient(48% 42% at 86% 88%, rgba(160, 219, 107, 0.6), transparent 70%)',
      'radial-gradient(45% 40% at 10% 90%, rgba(136, 173, 254, 0.5), transparent 70%)',
      'linear-gradient(180deg, #FFF3F8 0%, #FDF1F6 100%)',
    ].join(','),
  },
  summer: {
    fog: '#E6F4F2',
    sky: [
      'radial-gradient(circle at 80% 14%, #FFFBE0 0 4%, rgba(255, 216, 77, 0.95) 8%, rgba(255, 176, 32, 0.45) 20%, transparent 44%)',
      'radial-gradient(50% 40% at 8% 92%, rgba(255, 138, 92, 0.45), transparent 70%)',
      'radial-gradient(90% 35% at 50% 100%, rgba(95, 211, 208, 0.45), transparent 70%)',
      'linear-gradient(180deg, #7FCBEF 0%, #BFE7F4 38%, #F4F4E6 72%, #FFEFCF 100%)',
    ].join(','),
  },
  autumn: {
    fog: '#F8DEC6',
    sky: [
      'radial-gradient(60% 50% at 12% 90%, rgba(232, 163, 61, 0.7), transparent 70%)',
      'radial-gradient(45% 40% at 90% 30%, rgba(210, 105, 42, 0.45), transparent 70%)',
      'radial-gradient(45% 40% at 70% 4%, rgba(156, 74, 110, 0.35), transparent 70%)',
      'linear-gradient(180deg, #FCE9D2 0%, #F8DCC0 55%, #F3CFAE 100%)',
    ].join(','),
  },
  winter: {
    fog: '#E4EAFA',
    sky: [
      'radial-gradient(60% 45% at 50% 0%, rgba(255, 255, 255, 0.95), transparent 70%)',
      'radial-gradient(45% 40% at 10% 30%, rgba(136, 173, 254, 0.55), transparent 70%)',
      'radial-gradient(45% 40% at 88% 80%, rgba(203, 184, 245, 0.55), transparent 70%)',
      'radial-gradient(60% 35% at 50% 100%, rgba(95, 139, 245, 0.25), transparent 70%)',
      'linear-gradient(180deg, #EEF3FF 0%, #E6ECFB 55%, #DCE3F7 100%)',
    ].join(','),
  },
};

// ── The spine the yarn follows ─────────────────────────────────────────────

/** Top and bottom of the yarn. */
// Low enough that the spine's top is out of view during the opening; the
// ball of yarn comes to rest on it.
export const YARN_TOP = 4.5;
export const YARN_BOTTOM = -YARN_SEASONS.length * SEASON_SPAN - 9;

/** A gentle S down the y axis — the line both the yarn and the camera follow. */
export function spine(y: number): [number, number, number] {
  return [0.85 * Math.sin(y * 0.17), y, 0.55 * Math.sin(y * 0.11 + 1.2)];
}

// ── Cards ──────────────────────────────────────────────────────────────────

/**
 * The cards climb down the yarn in a helix, like the steps of a spiral
 * stair: each one a fifth of a turn round from the last and a card's height
 * lower. Scrolling turns the camera round the yarn as it descends, so one
 * card after another swings to the front.
 *
 * Between seasons the stair breaks: a longer drop (SEASON_GAP) and an extra
 * half turn, so by the time the new season's first card faces the camera the
 * last season's cards are high above it and round the far side of the yarn.
 */
export const CARDS_PER_SEASON = 5;
export const CARD_COUNT = CARDS_PER_SEASON * YARN_SEASONS.length;
export const HELIX_STEP = (72 * Math.PI) / 180;
const SEASON_TURN = Math.PI;

export const seasonOfCard = (i: number) =>
  Math.min(YARN_SEASONS.length - 1, Math.max(0, Math.floor(i / CARDS_PER_SEASON)));

/** Height and angle of card `n` (a whole card index). */
const heightOf = (n: number) => {
  const s = seasonOfCard(n);
  return seasonTop(s) - SEASON_GAP / 2 - CARD_SPACING * (n - s * CARDS_PER_SEASON + 0.5);
};
const angleOf = (n: number) => n * HELIX_STEP + seasonOfCard(n) * SEASON_TURN;

/** Interpolates a per-card value for any position, including between cards. */
const between = (of: (n: number) => number, p: number) => {
  const n0 = Math.floor(p);
  const f = p - n0;
  return f === 0 ? of(n0) : of(n0) + (of(n0 + 1) - of(n0)) * f;
};

/** Height of the helix at a position of the descent (in cards, may be fractional). */
export const cardY = (p: number) => between(heightOf, p);
/** Angle round the yarn at a position of the descent. */
export const cardAngle = (p: number) => between(angleOf, p);

/**
 * The first stretch of the scroll belongs to the opening: the name written in
 * yarn unravels into the spine. The descent through the cards takes the rest.
 */
export const INTRO_SHARE = 0.07;

/** Scroll progress (0–1) → how far the name has unravelled (0–1). */
export const introOf = (progress: number) => Math.min(1, Math.max(0, progress / INTRO_SHARE));
/**
 * The descent lingers at each change of season: around every knot the
 * scroll carries the camera more slowly, so the new sky, the chapter title
 * and the change of yarn have room to happen. `DWELL` is the extra scroll,
 * in card-lengths, given to each knot.
 */
const DWELL = 1.6;
const DWELL_WIDTH = 0.45;

/** Cumulative scroll weight along the descent, sampled finely, for both directions of the mapping. */
const descentTable = (() => {
  const steps = 2400;
  const end = CARD_COUNT - 1;
  const knots = YARN_SEASONS.slice(1).map((_, i) => (i + 1) * CARDS_PER_SEASON - 0.5);
  const cum = [0];
  for (let k = 1; k <= steps; k++) {
    const p = ((k - 0.5) / steps) * end;
    const weight = 1 + knots.reduce((w, b) => w + DWELL * Math.exp(-(((p - b) / DWELL_WIDTH) ** 2)) / (DWELL_WIDTH * Math.sqrt(Math.PI)), 0);
    cum.push(cum[k - 1] + weight * (end / steps));
  }
  return { cum, steps, end, total: cum[steps] };
})();

/** Scroll progress (0–1) → position of the descent, in cards. */
export function descentOf(progress: number) {
  const { cum, steps, end, total } = descentTable;
  const target = Math.min(1, Math.max(0, (progress - INTRO_SHARE) / (1 - INTRO_SHARE))) * total;
  let lo = 0;
  let hi = steps;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] <= target) lo = mid;
    else hi = mid;
  }
  const f = (target - cum[lo]) / Math.max(1e-9, cum[hi] - cum[lo]);
  return ((lo + f) / steps) * end;
}

/** Scroll progress (0–1) that brings card `i` to the front. */
export function progressForCard(i: number) {
  const { cum, steps, end, total } = descentTable;
  const k = Math.min(steps, Math.max(0, (i / end) * steps));
  const k0 = Math.floor(k);
  const at = cum[k0] + (cum[Math.min(steps, k0 + 1)] - cum[k0]) * (k - k0);
  return INTRO_SHARE + (at / total) * (1 - INTRO_SHARE);
}

/** How much longer the descent's scroll is than one card-length per card. */
export const DESCENT_STRETCH = descentTable.total / (CARD_COUNT - 1);
/** Scroll progress that brings a season's first card to the front. */
export const seasonProgress = (s: number) => progressForCard(s * CARDS_PER_SEASON);

/**
 * Where the descent crosses from season `s - 1` into season `s`, in card
 * positions (halfway between the last card of one and the first of the next).
 */
export const seasonBoundary = (s: number) => s * CARDS_PER_SEASON - 0.5;

/**
 * The beats of a change of season, in seconds from the moment the sky
 * changes (the chapter keyframes in the module CSS follow these times):
 *
 * - `open`: the new sky and the chapter have opened, as one circle from the
 *   middle of the screen, the season's name large in front of a blurred scene
 * - `leave`: the chapter starts closing, the same circle run back
 * - `settled`: closed on the spine, the name settled behind it; the page
 *   holds the scroll until here
 */
export const CHAPTER = { open: 1.3, leave: 2.9, settled: 4 };

/** Card size: landscape info cards on wide screens, portrait on phones. */
export const cardSize = (compact: boolean) =>
  compact ? { width: 2.5, height: 4.0 } : { width: 4.4, height: 2.75 };

/** Camera distance from the yarn, and height above the point it looks at. */
export const cameraDistance = (compact: boolean) => (compact ? 9.8 : 11.8);
export const CAMERA_LIFT = 1.5;

export interface YarnCard {
  key: string;
  index: number;
  photo: YarnPhoto;
  season: SeasonId;
  position: [number, number, number];
  /**
   * Orientation (radians, applied Y then X then Z). Each card faces straight
   * out from the yarn, so the one at the front faces the viewer and those
   * either side turn away along the curve; all tip back a touch towards the
   * raised camera.
   */
  rotationY: number;
  rotationX: number;
  /** Slight lean. */
  rotationZ: number;
  width: number;
  height: number;
}

/**
 * Each season shows its own two bags twice and one visitor: a bag whose
 * secondary season (from the vitrin manifest) is this one.
 */
const SEASON_CARDS: Record<SeasonId, string[]> = {
  spring: ['fuchsia-ring', 'seafoam-beaded', 'raffia-tote', 'fuchsia-ring', 'seafoam-beaded'],
  summer: ['raffia-tote', 'tan-wood-handle', 'fuchsia-ring', 'tan-wood-handle', 'raffia-tote'],
  autumn: ['chocolate-crochet', 'marled-patch', 'black-sequin-hobo', 'marled-patch', 'chocolate-crochet'],
  winter: ['black-sequin-hobo', 'silver-clutch', 'chocolate-crochet', 'silver-clutch', 'black-sequin-hobo'],
};

/** Small deterministic jitter so the layout never reads as a grid. */
function jitter(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

/**
 * Distance of the cards from the yarn — wide enough that neighbours a fifth
 * of a turn apart (chord ≈ 1.18 × radius) clear each other's edges.
 */
export const helixRadius = (compact: boolean) => (compact ? 2.5 : 3.9);

export function buildCards(compact: boolean): YarnCard[] {
  const cards: YarnCard[] = [];
  const radius = helixRadius(compact);
  const size = cardSize(compact);
  YARN_SEASONS.forEach((season, s) => {
    SEASON_CARDS[season].forEach((photoId, k) => {
      const index = s * CARDS_PER_SEASON + k;
      const photo = YARN_PHOTOS.find((p) => p.id === photoId)!;
      const angle = cardAngle(index);
      const y = cardY(index);
      const [sx, , sz] = spine(y);
      cards.push({
        key: `${season}-${k}`,
        index,
        photo,
        season,
        position: [sx + Math.sin(angle) * radius, y, sz + Math.cos(angle) * radius],
        rotationY: angle,
        rotationX: -0.1,
        rotationZ: jitter(index + 7) * 0.035,
        width: size.width,
        height: size.height,
      });
    });
  });
  return cards;
}
