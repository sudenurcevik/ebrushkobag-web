import Image from 'next/image';
import type { Ref } from 'react';
import { SEASON_LABEL_3D, type Gallery3DItem as Item } from '@/data/gallery-3d-items';
import styles from './rotational-gallery-3d.module.css';

/**
 * One frame on the cylinder. Its place on the reel is fixed (`rotateY` by its
 * index, pushed out by the radius); the reel turns around it. The front face
 * carries the photograph; the back face is the frame seen from behind, so the
 * far side of the installation reads as more frames rather than a void.
 *
 * Light and fade are written to the front face by RotationalGallery3D each
 * frame — this component renders once.
 */
export function Gallery3DItem({
  item,
  index,
  total,
  angle,
  radius,
  priority,
  frontRef,
}: {
  item: Item;
  index: number;
  total: number;
  angle: number;
  radius: number;
  priority: boolean;
  frontRef: Ref<HTMLDivElement>;
}) {
  const frame = String(index + 1).padStart(2, '0');

  return (
    <div
      className={styles.item}
      data-index={index}
      data-active="false"
      role="group"
      aria-roledescription="slide"
      aria-label={`${frame} / ${String(total).padStart(2, '0')} — ${item.title}`}
      style={{
        width: 'var(--g3-w)',
        height: 'var(--g3-h)',
        left: 'calc(var(--g3-w) / -2)',
        top: 'calc(var(--g3-h) / -2)',
        transform: `rotateY(${angle}rad) translateZ(${radius}px)`,
      }}
    >
      <div ref={frontRef} className={`${styles.face} ${styles.front}`}>
        <div className={styles.perfs} />
        <div className={styles.photo}>
          <Image
            src={item.image}
            alt={item.alt}
            fill
            draggable={false}
            priority={priority}
            // Lazy loading misjudges visibility inside 3D transforms; eight
            // photographs are cheap enough to fetch up front.
            loading={priority ? undefined : 'eager'}
            sizes="(max-width: 640px) 72vw, 520px"
            className="object-cover"
          />
          <div className={styles.sheen} />
        </div>
        <div className={styles.perfs} />
        <div className={styles.meta}>
          <span>{frame}</span>
          <span>{SEASON_LABEL_3D[item.season].short}</span>
        </div>
      </div>
      <div aria-hidden className={`${styles.face} ${styles.back}`} />
    </div>
  );
}
