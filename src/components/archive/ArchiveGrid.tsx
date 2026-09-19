import Link from 'next/link';
import { ARCHIVE } from '@/data/products';
import { ARCHIVE_INTRO } from '@/data/content';
import { BRAND } from '@/config/brand';
import { atelierHref } from '@/lib/url-state';
import { CtaLink, ctaClasses, ctaStyle } from '@/components/ui/Cta';
import { EditorialImage } from '@/components/ui/EditorialImage';
import { Reveal, RevealLines } from '@/components/ui/Reveal';

/**
 * THE ARCHIVE (plan §23).
 *
 * After Winter the page returns to the brand's blush ground. These are older
 * pieces, most of them one of one — a curated mosaic rather than a rigid grid,
 * and nothing here is framed as unavailable stock.
 *
 * The mosaic is laid out deliberately rather than left to auto-placement. Each
 * row's spans add to twelve, and every cell's aspect ratio is `span / height`
 * in the same arbitrary height unit, so cells in a row are exactly as tall as
 * each other and each row ends flush with the right edge. Auto-placement with
 * mixed spans left a ragged margin down the right-hand side.
 */
const LAYOUT: { span: 4 | 5 | 7; height: number }[] = [
  { span: 7, height: 5 },
  { span: 5, height: 5 },
  { span: 4, height: 4 },
  { span: 4, height: 4 },
  { span: 4, height: 4 },
  { span: 5, height: 5 },
  { span: 7, height: 5 },
];

/** Spelled out so Tailwind can see every class it has to generate. */
const SPAN_CLASS: Record<4 | 5 | 7, string> = {
  4: 'lg:col-span-4',
  5: 'lg:col-span-5',
  7: 'lg:col-span-7',
};

export function ArchiveGrid() {
  return (
    <section id="arsiv" className="bg-blush py-section" aria-labelledby="archive-title">
      <div className="shell">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="label text-hotpink">{ARCHIVE_INTRO.title}</p>
            <h2 id="archive-title" className="mt-6 font-display text-display-md">
              <RevealLines lines={ARCHIVE_INTRO.lines} />
            </h2>
          </div>
          <Reveal delay={0.1} className="lg:max-w-measure">
            <p className="text-[0.9375rem] leading-relaxed text-ink-soft">{ARCHIVE_INTRO.body}</p>
            <CtaLink
              href={BRAND.instagramUrl}
              external
              variant="outline"
              className="mt-8"
              style={ctaStyle('outline', { accent: '#FF68C4', ink: '#241A20' })}
            >
              Instagram&apos;da tamamı
            </CtaLink>
          </Reveal>
        </div>

        <ul className="mt-20 grid grid-cols-2 gap-3 sm:gap-4 lg:mt-24 lg:grid-cols-12 lg:gap-5">
          {ARCHIVE.map((item, index) => {
            const cell = LAYOUT[index] ?? { span: 4, height: 4 };
            return (
              <Reveal
                as="li"
                key={item.id}
                delay={(index % 3) * 0.06}
                amount={0.08}
                className={[
                  'group relative overflow-hidden rounded-[1.5rem]',
                  // Mobile keeps it simple: the opening frame runs full width,
                  // everything after it is a matched pair.
                  index === 0 ? 'col-span-2' : 'col-span-1',
                  SPAN_CLASS[cell.span],
                  '[aspect-ratio:var(--cell-sm)] lg:[aspect-ratio:var(--cell-lg)]',
                ].join(' ')}
                style={
                  {
                    '--cell-sm': index === 0 ? '16 / 10' : '4 / 5',
                    '--cell-lg': `${cell.span} / ${cell.height}`,
                  } as React.CSSProperties
                }
              >
                <EditorialImage
                  image={item.image}
                  sizes="(min-width: 1024px) 45vw, (min-width: 640px) 50vw, 100vw"
                  fill
                  className="h-full w-full"
                  ground="#FBD9DC"
                  ink="#241A20"
                  accent="#FF68C4"
                />

                {/* Caption lives on the frame so a long line can never make one
                    cell taller than its neighbour. */}
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/70 via-black/10 to-transparent p-4"
                  aria-hidden={false}
                >
                  <span className="text-[0.5625rem] uppercase tracking-label text-cream">
                    {item.label}
                  </span>
                  <span className="line-clamp-2 max-w-[22ch] text-right text-[0.6875rem] leading-snug text-cream/75">
                    {item.caption}
                  </span>
                </div>
              </Reveal>
            );
          })}
        </ul>

        <Reveal className="mt-16 text-center" amount={0.3}>
          <p className="font-display text-2xl italic text-ink-soft">
            Beğendiğin bir kare mi var? Aynısını değil ama çok yakınını birlikte kurabiliriz.
          </p>
          <Link
            href={atelierHref()}
            className={ctaClasses('solid', 'md', 'mt-7')}
            style={ctaStyle('solid', { accent: '#FF68C4', ink: '#241A20', onAccent: '#FFFBF4' })}
          >
            Benzerini tasarla
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
