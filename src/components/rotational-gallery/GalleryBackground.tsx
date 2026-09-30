import type { SeasonId } from '@/data/types';
import styles from './rotational-gallery.module.css';

/**
 * Seasonal washes, ready for the second iteration: when the active frame
 * changes season, its wash cross-fades in over the neutral base. Raising
 * `intensity` towards 1 is all it takes to make the seasons read; today it is
 * kept low enough to register only as a shift in temperature.
 */
const SEASON_WASH: Record<SeasonId, string> = {
  spring:
    'radial-gradient(60% 50% at 18% 30%, rgba(251, 196, 214, 0.9), transparent 70%), radial-gradient(50% 45% at 82% 70%, rgba(200, 236, 170, 0.7), transparent 70%)',
  summer:
    'radial-gradient(60% 50% at 20% 25%, rgba(255, 236, 170, 0.9), transparent 70%), radial-gradient(50% 45% at 80% 72%, rgba(190, 212, 255, 0.7), transparent 70%)',
  autumn:
    'radial-gradient(60% 50% at 18% 30%, rgba(240, 214, 190, 0.9), transparent 70%), radial-gradient(50% 45% at 82% 70%, rgba(214, 170, 196, 0.7), transparent 70%)',
  winter:
    'radial-gradient(60% 50% at 20% 28%, rgba(222, 214, 246, 0.9), transparent 70%), radial-gradient(50% 45% at 80% 72%, rgba(206, 210, 222, 0.8), transparent 70%)',
};

const SEASONS = Object.keys(SEASON_WASH) as SeasonId[];

export function GalleryBackground({
  season,
  intensity = 0.3,
}: {
  season: SeasonId;
  intensity?: number;
}) {
  return (
    <div aria-hidden className={styles.background}>
      {SEASONS.map((id) => (
        <div
          key={id}
          className={styles.seasonWash}
          style={{ background: SEASON_WASH[id], opacity: id === season ? intensity : 0 }}
        />
      ))}
      <div className={`${styles.blob} ${styles.blobPeach}`} />
      <div className={`${styles.blob} ${styles.blobLavender}`} />
      <div className={`${styles.blob} ${styles.blobBlush}`} />
      <div className={styles.grain} />
    </div>
  );
}
