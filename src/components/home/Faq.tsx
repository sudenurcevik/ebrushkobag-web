'use client';

import { useId, useState } from 'react';
import { FAQ } from '@/data/content';
import { Reveal, RevealLines } from '@/components/ui/Reveal';

/**
 * Plain buttons and regions: `aria-expanded` on the control, `aria-labelledby`
 * on the panel, real focus order. Opening is a CSS grid-row transition
 * (0fr → 1fr) rather than a measured JS height animation (plan §38).
 */
export function Faq() {
  const uid = useId();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="sorular" className="bg-cream py-section" aria-labelledby="faq-title">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-x-gutter">
        <div className="lg:col-span-4">
          <p className="label text-hotpink">Sık sorulanlar</p>
          <h2 id="faq-title" className="mt-6 font-display text-display-sm">
            <RevealLines lines={['Merak', 'edilenler.']} />
          </h2>
        </div>

        <Reveal className="lg:col-span-7 lg:col-start-6" amount={0.1}>
          <dl className="border-t border-blush-deep">
            {FAQ.map((item, index) => {
              const expanded = open === index;
              const buttonId = `${uid}-q-${index}`;
              const panelId = `${uid}-a-${index}`;

              return (
                <div key={item.question} className="border-b border-blush-deep">
                  <dt>
                    <button
                      type="button"
                      id={buttonId}
                      aria-expanded={expanded}
                      aria-controls={panelId}
                      onClick={() => setOpen(expanded ? null : index)}
                      className={`flex w-full items-baseline justify-between gap-6 py-6 text-left transition-colors duration-300 ${
                        expanded ? 'text-ink' : 'text-ink-soft hover:text-hotpink'
                      }`}
                    >
                      <span className="font-display text-xl leading-snug sm:text-2xl">
                        {item.question}
                      </span>
                      <span
                        className={`relative mt-2 block h-3 w-3 shrink-0 transition-transform duration-500 ease-editorial ${
                          expanded ? 'rotate-90' : ''
                        }`}
                        aria-hidden
                      >
                        <span className="absolute left-0 top-1/2 block h-[2px] w-full -translate-y-1/2 rounded-full bg-current" />
                        <span
                          className={`absolute left-1/2 top-0 block h-full w-[2px] -translate-x-1/2 rounded-full bg-current transition-opacity duration-500 ${
                            expanded ? 'opacity-0' : 'opacity-100'
                          }`}
                        />
                      </span>
                    </button>
                  </dt>

                  <dd
                    id={panelId}
                    aria-labelledby={buttonId}
                    className="grid transition-[grid-template-rows] duration-500 ease-editorial"
                    style={{ gridTemplateRows: expanded ? '1fr' : '0fr' }}
                  >
                    <div className="overflow-hidden">
                      <p
                        className={`max-w-measure pb-7 text-[0.9375rem] leading-[1.8] text-ink-soft transition-opacity duration-500 ${
                          expanded ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        {item.answer}
                      </p>
                    </div>
                  </dd>
                </div>
              );
            })}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
