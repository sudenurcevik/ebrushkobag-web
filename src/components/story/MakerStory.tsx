import { STORY } from '@/data/content';
import { EditorialImage } from '@/components/ui/EditorialImage';
import { Reveal, RevealLines } from '@/components/ui/Reveal';

/**
 * The maker, not the company (plan §24). First person, hands and a table rather
 * than a team photo, and no mission statements anywhere near it.
 */
export function MakerStory() {
  return (
    <section id="hikayemiz" className="bg-cream py-section" aria-labelledby="story-title">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-gutter">
          <Reveal className="lg:col-span-5" amount={0.12}>
            <EditorialImage
              image={STORY.images.hands}
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="w-full rounded-[2rem]"
              ground="#FEE9EA"
              ink="#241A20"
              accent="#A0DB6B"
            />
          </Reveal>

          <div className="lg:col-span-6 lg:col-start-7 lg:pt-20">
            <p className="label text-hotpink">{STORY.eyebrow}</p>
            <h2 id="story-title" className="mt-6 font-display text-display-md">
              <RevealLines lines={STORY.headline} />
            </h2>

            <div className="mt-10 max-w-measure space-y-5">
              {STORY.paragraphs.map((paragraph, index) => (
                <Reveal
                  as="p"
                  key={index}
                  delay={index * 0.07}
                  amount={0.35}
                  className="text-[0.9375rem] leading-[1.85] text-ink-soft"
                >
                  {paragraph}
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-6 sm:mt-24 lg:grid-cols-12 lg:gap-x-gutter">
          <Reveal className="lg:col-span-7 lg:col-start-2" amount={0.12}>
            <EditorialImage
              image={STORY.images.workspace}
              sizes="(min-width: 1024px) 56vw, 100vw"
              className="w-full rounded-[2rem]"
              ground="#FEE9EA"
              ink="#241A20"
              accent="#FFDE5A"
            />
          </Reveal>

          <Reveal
            className="ml-auto w-[62%] sm:w-[46%] lg:col-span-3 lg:col-start-10 lg:mt-24 lg:w-full"
            delay={0.1}
            amount={0.12}
          >
            <EditorialImage
              image={STORY.images.yarn}
              sizes="(min-width: 1024px) 24vw, 62vw"
              className="w-full rounded-[2rem]"
              ground="#FEE9EA"
              ink="#241A20"
              accent="#88ADFE"
            />
          </Reveal>
        </div>

        <Reveal className="mt-20 text-center" amount={0.4}>
          <p className="font-display text-display-sm leading-tight">
            {STORY.closing.map((line) => (
              <span key={line} className="block italic">
                {line}
              </span>
            ))}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
