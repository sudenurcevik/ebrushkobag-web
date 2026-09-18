/**
 * ─────────────────────────────────────────────────────────────────────────────
 * BRAND CONFIGURATION
 *
 * The one file to edit for names, links and lead times. Every headline, meta
 * tag, share message and Instagram button reads from here.
 *
 * ⚠ `instagramHandle` / `instagramUrl` / `instagramOrderUrl` are best guesses
 *   from the brand name — confirm them before launch.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const BRAND = {
  name: 'EBRUSHKOBAG',
  tagline: 'Handmade knit bags, made your way',
  taglineTr: 'El örgüsü çantalar, senin istediğin gibi',

  instagramHandle: '@ebrushkobag',
  instagramUrl: 'https://instagram.com/ebrushkobag',
  instagramOrderUrl: 'https://ig.me/m/ebrushkobag',

  email: 'merhaba@ebrushkobag.com',
  city: 'İzmir',
  country: 'Türkiye',
  siteUrl: 'https://ebrushkobag.com',

  logo: {
    src: '/brand/ebrushkobag-logo.png',
    alt: 'EBRUSHKOBAG — el örgüsü çanta markası logosu',
    width: 500,
    height: 500,
  },

  currency: {
    code: 'TRY',
    symbol: '₺',
    note: 'Başlangıç fiyatıdır. Kesin fiyat seçimlerine göre Instagram üzerinden paylaşılır.',
  },

  production: {
    leadTime: '4–8 iş günü',
    shipping: 'Türkiye içi kargo 1–3 iş günü',
  },
} as const;
