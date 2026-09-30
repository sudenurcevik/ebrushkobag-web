'use client';

import { useEffect, useState } from 'react';
import { SEASON_LABEL_3D, type Gallery3DItem } from '@/data/gallery-3d-items';
import styles from './rotational-gallery-3d.module.css';

const OUT_MS = 220;

/**
 * Season, name and a line of copy for the frame facing the viewer. The old
 * caption lifts away before the new one rises in; a fast spin past several
 * frames fades it once and lands on the frame the reel settles on.
 */
export function Gallery3DCaption({ item, index }: { item: Gallery3DItem; index: number }) {
  const [shown, setShown] = useState({ item, index });
  const leaving = shown.item.id !== item.id;

  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(() => setShown({ item, index }), OUT_MS);
    return () => window.clearTimeout(timer);
  }, [leaving, item, index]);

  return (
    <div
      className={`${styles.caption} mx-auto w-full max-w-[28rem] px-6 text-center`}
      data-leaving={leaving}
      aria-live="polite"
    >
      <div key={shown.item.id} className={styles.captionIn}>
        <p className="text-micro font-medium uppercase tabular-nums text-ink-muted">
          {SEASON_LABEL_3D[shown.item.season].full} / {String(shown.index + 1).padStart(2, '0')}
        </p>
        <span aria-hidden className="mx-auto mt-3 block h-px w-8 bg-[#B8966A]/60" />
        <h2 className="mt-3 font-display text-[clamp(1.5rem,2.5vw,2.125rem)] font-normal leading-tight tracking-[-0.01em] text-ink">
          {shown.item.title}
        </h2>
        <p className="mx-auto mt-1.5 max-w-[22rem] text-[0.8125rem] leading-relaxed text-ink-soft">
          {shown.item.description}
        </p>
      </div>
    </div>
  );
}
