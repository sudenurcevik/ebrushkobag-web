import type { Metadata, Viewport } from 'next';
import { Fraunces, Manrope } from 'next/font/google';
import { BRAND } from '@/config/brand';
import './globals.css';

/** Playful but sophisticated variable serif — seasonal titles and statements. */
const display = Fraunces({
  subsets: ['latin', 'latin-ext'],
  // Variable across the full weight range; SOFT and WONK are what keep Fraunces
  // playful rather than merely bookish, and opsz tunes it for display sizes.
  axes: ['SOFT', 'WONK', 'opsz'],
  variable: '--font-display',
  display: 'swap',
});

/** Clean modern sans — navigation, body copy, labels, configurator controls. */
const sans = Manrope({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.siteUrl),
  title: {
    default: `${BRAND.name} — ${BRAND.tagline}`,
    template: `%s — ${BRAND.name}`,
  },
  description:
    'Her mevsim başka bir hikâye. El örgüsü çantalar; modelini, ipini, detayını ve sapını sen seç, biz örelim.',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: BRAND.name,
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: 'Dört mevsim. Sonsuz kombinasyon. Bir tane seninki.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#FEE9EA',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="tr"
      className={`${display.variable} ${sans.variable}`}
      // `scroll-behavior: smooth` is set globally for in-page anchors. Since
      // Next 16 no longer suppresses it during route transitions on its own,
      // this opts back in — without it, going to /atelier would smooth-scroll
      // to the top instead of landing there.
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body>
        {/*
          Marks the document as scripted before first paint. Every reveal's
          hidden state is scoped to `[data-js]`, so a blocked or failed bundle
          leaves the page fully readable instead of blank. Set outside React,
          hence `suppressHydrationWarning` on <html>.
        */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.dataset.js='1'" }} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-2.5 focus:text-sm focus:text-cream"
        >
          İçeriğe geç
        </a>
        {children}
      </body>
    </html>
  );
}
