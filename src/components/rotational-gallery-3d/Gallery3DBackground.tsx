import type { SeasonId } from '@/data/types';
import styles from './rotational-gallery-3d.module.css';

/**
 * A restrained backdrop: warm ivory, two slow blurred glows and a pool of
 * light where the reel stands. The active frame's season tints it very
 * slightly (cross-faded over ~2.5s); raise `intensity` to make seasons read.
 */
const SEASON_WASH: Record<SeasonId, string> = {
  spring:
    'radial-gradient(55% 45% at 22% 26%, rgba(252, 208, 220, 0.9), transparent 70%), radial-gradient(50% 40% at 80% 76%, rgba(255, 246, 236, 0.9), transparent 70%)',
  summer:
    'radial-gradient(55% 45% at 22% 26%, rgba(255, 238, 184, 0.9), transparent 70%), radial-gradient(50% 40% at 80% 76%, rgba(255, 248, 228, 0.9), transparent 70%)',
  autumn:
    'radial-gradient(55% 45% at 22% 26%, rgba(250, 218, 196, 0.9), transparent 70%), radial-gradient(50% 40% at 80% 76%, rgba(246, 232, 214, 0.9), transparent 70%)',
  winter:
    'radial-gradient(55% 45% at 22% 26%, rgba(228, 222, 246, 0.9), transparent 70%), radial-gradient(50% 40% at 80% 76%, rgba(240, 240, 246, 0.9), transparent 70%)',
};

const SEASONS = Object.keys(SEASON_WASH) as SeasonId[];

export function Gallery3DBackground({ season, intensity = 0.35 }: { season: SeasonId; intensity?: number }) {
  return (
    <div aria-hidden className={styles.background}>
      {SEASONS.map((id) => (
        <div
          key={id}
          className={styles.wash}
          style={{ background: SEASON_WASH[id], opacity: id === season ? intensity : 0 }}
        />
      ))}
      <div className={`${styles.glow} ${styles.glowPeach}`} />
      <div className={`${styles.glow} ${styles.glowLavender}`} />
      <div className={styles.halo} />
      <div className={styles.grain} />
    </div>
  );
}
