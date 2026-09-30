import Image from 'next/image';
import type { Ref } from 'react';
import { SEASON_LABEL, type GalleryItem as Item } from '@/data/gallery-items';
import styles from './rotational-gallery.module.css';

/**
 * One frame on the reel. Position, tilt, depth and fade are written straight
 * to the element by RotationalGallery on every animation frame, so this
 * component renders once and never re-renders while the reel turns.
 */
export function GalleryItem({
  item,
  index,
  total,
  priority,
  ref,
}: {
  item: Item;
  index: number;
  total: number;
  priority: boolean;
  ref: Ref<HTMLDivElement>;
}) {
  const frame = String(index + 1).padStart(2, '0');

  return (
    <div
      ref={ref}
      className={styles.item}
      data-index={index}
      data-active="false"
      role="group"
      aria-roledescription="slide"
      aria-label={`${frame} / ${String(total).padStart(2, '0')} — ${item.title}`}
      style={{ opacity: 0 }}
    >
      <div className={styles.frame}>
        <div className={styles.perfs} />
        <div className={styles.photo}>
          <Image
            src={item.image}
            alt={item.alt}
            fill
            draggable={false}
            priority={priority}
            sizes="(max-width: 640px) 70vw, 380px"
            className="object-cover"
          />
        </div>
        <div className={styles.perfs} />
        <div className={styles.frameMeta}>
          <span>{frame}</span>
          <span>{SEASON_LABEL[item.season]}</span>
        </div>
      </div>
    </div>
  );
}
