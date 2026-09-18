import { SEASONS } from '@/data/seasons';
import { INTRO } from '@/data/content';
import { Reveal, RevealLines } from '@/components/ui/Reveal';

/**
 * The bridge from brand to calendar: it names the through-line — one thread,
 * four chapters — and hands the visitor the year as a table of contents.
 */
export function Intro() {
  return (
    <section id="mevsimler" className="bg-blush py-section" aria-labelledby="intro-title">
      <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-x-gutter">
        <h2 id="intro-title" className="font-display text-display-md lg:col-span-6">
          <RevealLines lines={INTRO.lines} />
        </h2>

        <Reveal className="lg:col-span-5 lg:col-start-8 lg:pt-4" delay={0.1}>
          <p className="max-w-measure text-[0.9375rem] leading-relaxed text-ink-soft">{INTRO.body}</p>
        </Reveal>
      </div>

      <ol className="shell mt-20 grid gap-px overflow-hidden rounded-[2rem] bg-blush-deep sm:grid-cols-2 lg:mt-28 lg:grid-cols-4">
        {SEASONS.map((season, index) => (
          <Reveal
            as="li"
            key={season.id}
            delay={index * 0.07}
            amount={0.3}
            className="relative"
          >
            <a
              href={`#${season.slug}`}
              className="flex h-full flex-col justify-between gap-10 p-7 transition-transform duration-500 ease-editorial hover:-translate-y-1"
              style={{ backgroundColor: season.background, color: season.ink }}
            >
              <span className="label" style={{ color: season.accent }}>
                {season.index} / {season.labelEn}
              </span>
              <span>
                <span className="block font-display text-3xl">{season.label}</span>
                <span className="mt-2 block text-sm" style={{ color: season.inkSoft }}>
                  {season.headline}
                </span>
              </span>
              <span className="flex gap-1.5" aria-hidden>
                {season.palette.slice(0, 5).map((swatch) => (
                  <span
                    key={swatch.hex}
                    className="block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: swatch.hex }}
                  />
                ))}
              </span>
            </a>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
