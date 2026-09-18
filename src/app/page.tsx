import { Fragment } from 'react';
import { BRIDGES, SEASONS, getSeason } from '@/data/seasons';
import { hasPublicAsset } from '@/lib/assets.server';
import { Navbar } from '@/components/brand/Navbar';
import { Footer } from '@/components/brand/Footer';
import { Hero } from '@/components/home/Hero';
import { Intro } from '@/components/home/Intro';
import { Faq } from '@/components/home/Faq';
import { FinalCta } from '@/components/home/FinalCta';
import { SeasonSection } from '@/components/seasons/SeasonSection';
import { SeasonTransition } from '@/components/seasons/SeasonTransition';
import { SeasonIndicator } from '@/components/seasons/SeasonIndicator';
import { ArchiveGrid } from '@/components/archive/ArchiveGrid';
import { MakerStory } from '@/components/story/MakerStory';
import { EditorialImage } from '@/components/ui/EditorialImage';

/**
 * One year, scrolled through (plan §5):
 *
 *   brand intro → 01 bahar → 02 yaz → 03 sonbahar → 04 kış
 *   → the archive → the maker → questions → create your bag
 *
 * Between each chapter sits a bridge: the outgoing season's thread is followed
 * into the weave, the weave changes colour, and the next season is knitted out
 * of it. The bridges are the signature of the site, so they are the only place
 * GSAP runs on this page.
 */
export default function HomePage() {
  return (
    <>
      <Navbar transparentOnTop />
      <SeasonIndicator seasons={SEASONS} />

      <main id="main">
        <Hero />
        <Intro />

        <div id="koleksiyon">
          {SEASONS.map((season, index) => {
            const bridge = BRIDGES.find((b) => b.from === season.id);
            const next = bridge ? getSeason(bridge.to) : null;

            return (
              <Fragment key={season.id}>
                <SeasonSection season={season} index={index} />

                {bridge && next && (
                  <SeasonTransition
                    bridge={bridge}
                    from={season}
                    to={next}
                    outgoingImage={
                      <EditorialImage
                        image={season.images.product}
                        sizes="(min-width: 1024px) 40vw, 80vw"
                        fill
                        className="h-full w-full"
                        ground={season.surface}
                        ink={season.ink}
                        accent={season.accent}
                      />
                    }
                    incomingImage={
                      <EditorialImage
                        image={next.images.product}
                        sizes="(min-width: 1024px) 40vw, 80vw"
                        fill
                        className="h-full w-full"
                        ground={next.surface}
                        ink={next.ink}
                        accent={next.accent}
                      />
                    }
                    /*
                     * Only hand over a macro photograph when one actually
                     * exists — otherwise the drawn crochet texture stands
                     * alone rather than crossfading into an empty frame.
                     */
                    macroImage={
                      hasPublicAsset(next.images.macro.src) ? (
                        <EditorialImage
                          image={next.images.macro}
                          sizes="100vw"
                          fill
                          className="h-full w-full"
                          ground={next.surface}
                          ink={next.ink}
                          accent={next.accent}
                        />
                      ) : null
                    }
                  />
                )}
              </Fragment>
            );
          })}
        </div>

        <ArchiveGrid />
        <MakerStory />
        <Faq />
        <FinalCta />
      </main>

      <Footer />
    </>
  );
}
