import type { Season } from '@/data/types';
import { productsForSeason } from '@/data/products';
import { EditorialImage } from '@/components/ui/EditorialImage';
import { Reveal, RevealLines } from '@/components/ui/Reveal';
import { ProductMoment } from './ProductMoment';

/**
 * One chapter of the year (plan §8).
 *
 * Every colour arrives from the `Season` record — nothing here knows what green
 * is. The composition mirrors itself on alternate chapters so four seasons in a
 * row never read as the same template four times, and the chapter image is
 * allowed to run off the edge of the viewport rather than sitting in a box.
 */
export function SeasonSection({ season, index }: { season: Season; index: number }) {
  const products = productsForSeason(season.productIds);
  const flipped = index % 2 === 1;

  return (
    <section
      id={season.slug}
      data-season={season.id}
      className="relative overflow-hidden pb-section pt-section lg:pr-24 xl:pr-28"
      style={{ backgroundColor: season.background, color: season.ink }}
      aria-labelledby={`${season.id}-title`}
    >
      {/* ── Chapter head ───────────────────────────────────────────────── */}
      {/*
        The name takes a full-width line of its own. At this size it is not a
        heading sitting above the content, it *is* the composition — so it needs
        the whole measure rather than a column (plan §4).
      */}
      <div className="shell">
        <Reveal amount={0.6}>
          <p className="label" style={{ color: season.accent }}>
            {season.index} / {season.labelEn}
          </p>
        </Reveal>

        <h2
          id={`${season.id}-title`}
          className="mt-5 font-display leading-[0.85] text-[clamp(3.5rem,16vw,14rem)]"
          style={{ letterSpacing: '0.02em' }}
        >
          <RevealLines lines={[season.label]} />
        </h2>

        <div
          className={[
            'mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-x-gutter',
          ].join(' ')}
        >
          <Reveal
            className={flipped ? 'lg:col-span-5 lg:col-start-7' : 'lg:col-span-5'}
            delay={0.08}
          >
            <p className="font-display text-2xl italic leading-snug sm:text-3xl">
              {season.headline}
            </p>
            <p
              className="mt-5 max-w-measure text-[0.9375rem] leading-relaxed"
              style={{ color: season.inkSoft }}
            >
              {season.body}
            </p>
          </Reveal>

          {/* The season's palette, stated plainly. */}
          <Reveal
            className={[
              'flex items-start',
              flipped ? 'lg:col-span-4 lg:col-start-1 lg:row-start-1' : 'lg:col-span-4 lg:col-start-9',
            ].join(' ')}
            delay={0.16}
          >
            <ul className="flex flex-wrap items-center gap-x-4 gap-y-2.5">
              {season.palette.map((swatch) => (
                <li key={swatch.hex} className="flex items-center gap-2">
                  <span
                    className="block h-5 w-5 rounded-full"
                    style={{ backgroundColor: swatch.hex, boxShadow: `0 0 0 1px ${season.line}` }}
                    aria-hidden
                  />
                  <span
                    className="text-[0.6875rem] uppercase tracking-wider"
                    style={{ color: season.inkSoft }}
                  >
                    {swatch.name}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>

      {/* ── Chapter image, deliberately running off one edge ───────────── */}
      <div className="mt-20 sm:mt-28">
        <div className="mx-auto grid w-full max-w-editorial items-end gap-8 px-gutter lg:grid-cols-12 lg:gap-x-gutter">
          <Reveal
            className={[
              'relative',
              flipped
                ? 'lg:col-span-7 lg:col-start-1 lg:-ml-[6vw]'
                : 'lg:col-span-7 lg:col-start-6 lg:-mr-[6vw]',
            ].join(' ')}
            amount={0.12}
          >
            <EditorialImage
              image={season.images.hero}
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="w-full rounded-[2.5rem]"
              ground={season.surface}
              ink={season.ink}
              accent={season.accent}
            />
          </Reveal>

          <Reveal
            className={[
              'flex flex-wrap gap-2 lg:col-span-4',
              flipped ? 'lg:col-start-9' : 'lg:col-start-1 lg:row-start-1',
            ].join(' ')}
            delay={0.12}
            amount={0.3}
          >
            {season.mood.map((word) => (
              <span
                key={word}
                className="rounded-full px-3.5 py-2 text-[0.625rem] uppercase tracking-label"
                style={{ border: `1px solid ${season.line}`, color: season.inkSoft }}
              >
                {word}
              </span>
            ))}
          </Reveal>
        </div>
      </div>

      {/* ── Products ───────────────────────────────────────────────────── */}
      <div className="mt-24 space-y-24 sm:mt-32 sm:space-y-32">
        {products.map((product, productIndex) => (
          <ProductMoment
            key={product.id}
            product={product}
            season={season}
            flipped={flipped ? productIndex % 2 === 0 : productIndex % 2 === 1}
          />
        ))}
      </div>
    </section>
  );
}
