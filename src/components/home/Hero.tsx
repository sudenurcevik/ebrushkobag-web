import Link from 'next/link';
import { BRAND } from '@/config/brand';
import { HERO } from '@/data/content';
import { ctaClasses, ctaStyle } from '@/components/ui/Cta';
import { EditorialImage } from '@/components/ui/EditorialImage';
import { RevealLines } from '@/components/ui/Reveal';
import { HeroMedia } from './HeroMedia';

/**
 * The first viewport introduces the brand before the year starts (plan §7).
 * Full bleed, cinematic crop, two lines of type and one action — nothing else.
 */
export function Hero() {
  return (
    <section className="relative isolate flex h-[100svh] min-h-[34rem] flex-col justify-end overflow-hidden bg-chocolate">
      <HeroMedia>
        <EditorialImage
          image={HERO.image}
          sizes="100vw"
          priority
          fill
          placeholderAlign="top"
          className="h-full w-full"
          ground="#4A2E22"
          ink="#FFFBF4"
          accent="#FF68C4"
        />
      </HeroMedia>

      {/* Two stops only: the type has to hold, the photograph has to breathe. */}
      <div
        className="absolute inset-0 -z-[1] bg-gradient-to-t from-chocolate/85 via-chocolate/20 to-chocolate/40"
        aria-hidden
      />

      <div className="shell relative z-10 pb-16 sm:pb-20">
        <h1 className="font-display text-display-lg text-cream">
          <RevealLines lines={HERO.lines} />
        </h1>

        <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-measure font-sans text-lg text-cream/85 sm:text-xl">{HERO.subline}</p>

          <Link
            href="/atelier"
            className={ctaClasses('solid', 'lg', 'self-start sm:self-auto')}
            style={ctaStyle('solid', { accent: '#FF68C4', ink: '#241A20', onAccent: '#FFFBF4' })}
          >
            {HERO.cta}
          </Link>
        </div>

        <a
          href="#mevsimler"
          className="group mt-12 inline-flex items-center gap-3 text-cream/75 transition-colors duration-500 hover:text-cream"
        >
          <span className="label">{HERO.scrollHint}</span>
          <span className="animate-scroll-hint text-sm leading-none" aria-hidden>
            ↓
          </span>
        </a>
      </div>

      <span className="sr-only">{BRAND.taglineTr}</span>
    </section>
  );
}
