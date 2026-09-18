import { ARCHIVE } from '@/data/products';
import { ARCHIVE_INTRO } from '@/data/content';
import { BRAND } from '@/config/brand';
import { atelierHref } from '@/lib/url-state';
import { ctaClasses, ctaStyle } from '@/components/ui/Cta';
import { CtaLink } from '@/components/ui/Cta';
import { EditorialImage } from '@/components/ui/EditorialImage';
import { Reveal, RevealLines } from '@/components/ui/Reveal';
import Link from 'next/link';

/**
 * THE ARCHIVE (plan §23).
 *
 * After Winter the page returns to the brand's blush ground. These are older
 * pieces, most of them one of one — laid out as a curated mosaic rather than a
 * rigid grid, with treatment and scale doing the curating. Nothing here is
 * framed as unavailable stock; every frame is a starting point.
 */
const PLACEMENT: Record<number, string> = {
  3: 'sm:col-span-2 lg:col-span-6 lg:row-span-2',
  2: 'sm:col-span-1 lg:col-span-4',
  1: 'sm:col-span-1 lg:col-span-3',
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
          <Reveal delay={0.12} className="lg:max-w-measure">
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

        <ul className="mt-20 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-24 lg:auto-rows-[minmax(0,auto)] lg:grid-cols-12">
          {ARCHIVE.map((item, index) => (
            <Reveal
              as="li"
              key={item.id}
              delay={(index % 3) * 0.07}
              amount={0.15}
              className={`group relative ${PLACEMENT[item.weight]}`}
            >
              <EditorialImage
                image={item.image}
                sizes="(min-width: 1024px) 40vw, (min-width: 640px) 50vw, 100vw"
                className="w-full rounded-[1.75rem]"
                ground="#FBD9DC"
                ink="#241A20"
                accent="#FF68C4"
              />
              <div className="mt-4 flex items-baseline justify-between gap-4">
                <span className="label text-hotpink">{item.label}</span>
                <span className="text-right text-xs text-ink-muted">{item.caption}</span>
              </div>
            </Reveal>
          ))}
        </ul>

        <Reveal className="mt-16 text-center" amount={0.4}>
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
