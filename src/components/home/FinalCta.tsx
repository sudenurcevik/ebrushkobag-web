import Link from 'next/link';
import { FINAL } from '@/data/content';
import { ctaClasses, ctaStyle } from '@/components/ui/Cta';
import { Reveal, RevealLines } from '@/components/ui/Reveal';
import { Logo } from '@/components/brand/Logo';

/**
 * The year closes and the customisation begins (plan §25). Back on the brand's
 * blush ground, almost entirely type, with the real logo reappearing at scale.
 */
export function FinalCta() {
  return (
    <section
      className="relative flex min-h-[88svh] flex-col justify-center overflow-hidden bg-blush py-section"
      aria-labelledby="final-title"
    >
      <div className="shell">
        <Reveal amount={0.3} direction="none">
          <Logo size={96} className="mb-12" />
        </Reveal>

        <h2 id="final-title" className="font-display text-display-lg leading-[0.9]">
          <RevealLines lines={FINAL.lines} />
        </h2>

        <Reveal delay={0.2} className="mt-14">
          <Link
            href="/atelier"
            className={ctaClasses('solid', 'lg', 'px-14')}
            style={ctaStyle('solid', { accent: '#FF68C4', ink: '#241A20', onAccent: '#FFFBF4' })}
          >
            {FINAL.cta}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
