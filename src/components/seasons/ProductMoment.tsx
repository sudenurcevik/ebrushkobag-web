import Link from 'next/link';
import type { Product, Season } from '@/data/types';
import { STATUS_LABEL } from '@/data/products';
import { atelierHref } from '@/lib/url-state';
import { ctaClasses, ctaStyle } from '@/components/ui/Cta';
import { EditorialImage } from '@/components/ui/EditorialImage';
import { Reveal } from '@/components/ui/Reveal';

/**
 * A product as an editorial moment, not a shop card (plan §22).
 *
 * A finished piece is never "sold out" here — it becomes ARŞİV or TEK PARÇA, and
 * the call to action turns it into the starting point for a new commission.
 * That reframes unavailable stock as brand heritage.
 */
export function ProductMoment({
  product,
  season,
  flipped = false,
}: {
  product: Product;
  season: Season;
  flipped?: boolean;
}) {
  const inspire = product.status !== 'current';
  const cta = inspire ? 'Bu tasarımdan ilham al' : 'Benzerini tasarla';

  return (
    <article className="shell">
      <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-x-gutter">
        <Reveal
          className={['lg:col-span-6', flipped ? 'lg:order-2 lg:col-start-7' : 'lg:col-start-1'].join(' ')}
          amount={0.15}
        >
          <EditorialImage
            image={product.image}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="w-full rounded-[2rem]"
            ground={season.surface}
            ink={season.ink}
            accent={season.accent}
          />
        </Reveal>

        <div
          className={['lg:col-span-5', flipped ? 'lg:order-1 lg:col-start-1' : 'lg:col-start-8'].join(' ')}
        >
          <Reveal amount={0.4}>
            <span
              className="inline-block rounded-full px-3 py-1.5 text-[0.5625rem] uppercase tracking-label"
              style={{
                backgroundColor: inspire ? season.accent : 'transparent',
                color: inspire ? season.background : season.inkSoft,
                border: inspire ? 'none' : `1px solid ${season.line}`,
              }}
            >
              {STATUS_LABEL[product.status]}
            </span>

            <h4 className="mt-5 font-display text-3xl leading-tight sm:text-4xl" style={{ color: season.ink }}>
              {product.name}
            </h4>
            <p className="mt-3 text-sm" style={{ color: season.inkSoft }}>
              {product.materials}
            </p>
            <p className="mt-6 max-w-measure text-[0.9375rem] leading-relaxed" style={{ color: season.inkSoft }}>
              {product.note}
            </p>

            <Link
              href={atelierHref({ season: season.id, selection: product.inspires })}
              className={ctaClasses('outline', 'md', 'mt-8')}
              style={ctaStyle('outline', { accent: season.accent, ink: season.ink })}
            >
              {cta}
            </Link>
          </Reveal>
        </div>
      </div>
    </article>
  );
}
