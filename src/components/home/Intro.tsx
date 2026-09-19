import { SEASONS } from '@/data/seasons';
import { INTRO } from '@/data/content';
import { assetPresence } from '@/lib/assets.server';
import { Reveal, RevealLines } from '@/components/ui/Reveal';
import { SeasonFilmStrip } from './SeasonFilmStrip';

/**
 * The bridge from brand to calendar: it names the through-line — one thread,
 * four chapters — and then hands the visitor the year as a reel of film.
 */
export function Intro() {
  // Resolved on the server so the strip knows which clips it can actually play.
  const videoPresence = assetPresence(SEASONS.map((season) => season.video.src));

  return (
    <section id="mevsimler" className="bg-blush py-section" aria-labelledby="intro-title">
      <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-x-gutter">
        <h2 id="intro-title" className="font-display text-display-md lg:col-span-6">
          <RevealLines lines={INTRO.lines} />
        </h2>

        <Reveal className="lg:col-span-5 lg:col-start-8 lg:pt-4" delay={0.08}>
          <p className="max-w-measure text-[0.9375rem] leading-relaxed text-ink-soft">{INTRO.body}</p>
        </Reveal>
      </div>

      <Reveal className="mt-16 lg:mt-20" amount={0.08}>
        <SeasonFilmStrip seasons={SEASONS} videoPresence={videoPresence} />
      </Reveal>
    </section>
  );
}
