'use client';

import { useEffect, useState } from 'react';
import { SEASON_LABEL, type GalleryItem } from '@/data/gallery-items';
import styles from './rotational-gallery.module.css';

const OUT_MS = 200;

/**
 * The line under the front frame. It never swaps text in place: the old
 * caption fades up and out, and the new one rises in once the reel has
 * settled on a frame — spinning past several frames only fades it once.
 */
export function GalleryCaption({ item, index }: { item: GalleryItem; index: number }) {
  const [shown, setShown] = useState({ item, index });
  const leaving = shown.item.id !== item.id;

  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(() => setShown({ item, index }), OUT_MS);
    return () => window.clearTimeout(timer);
  }, [leaving, item, index]);

  return (
    <div
      className={`${styles.caption} mx-auto w-full max-w-[26rem] px-6 text-center`}
      data-leaving={leaving}
      aria-live="polite"
    >
      <div key={shown.item.id} className={styles.captionIn}>
        <p className="flex items-center justify-center gap-2 text-micro font-medium uppercase text-ink-muted">
          <span aria-hidden className="h-1 w-1 rounded-full bg-hotpink" />
          {SEASON_LABEL[shown.item.season]} / {String(shown.index + 1).padStart(2, '0')}
        </p>
        <h2 className="mt-2 font-display text-[clamp(1.5rem,2.4vw,2rem)] font-normal leading-tight tracking-[-0.01em] text-ink">
          {shown.item.title}
        </h2>
        <p className="mx-auto mt-1.5 max-w-[22rem] text-[0.8125rem] leading-relaxed text-ink-soft">
          {shown.item.description}
        </p>
      </div>
    </div>
  );
}
