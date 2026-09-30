import { SEASONS } from '@/data/seasons';
import { getProduct } from '@/data/products';
import { EditorialImage } from '@/components/ui/EditorialImage';
import { HeroReel, type ReelFrame } from './HeroReel';

/**
 * The first viewport introduces the brand before the year starts (plan §7):
 * two lines of type, one action, and the logo as the reel the four seasons are
 * wound on. Scrolling unwinds it into the film strip below.
 *
 * Frames are rendered here, on the server, so the photographs keep next/image
 * optimisation and the placeholder check; the reel only moves them. Each
 * season shows the first bag of its chapter.
 */
export function Hero() {
  const frames: ReelFrame[] = SEASONS.map((season) => {
    const product = getProduct(season.productIds[0]);
    return {
      season,
      image: product ? (
        <EditorialImage
          image={product.image}
          sizes="(min-width: 1024px) 14rem, 36vw"
          // Wound above the clip, the frames never enter the viewport the way
          // lazy loading expects, and would arrive late mid-unwind.
          priority
          fill
          className="h-full w-full"
          ground={season.surface}
          ink={season.ink}
          accent={season.accent}
        />
      ) : null,
    };
  });

  return <HeroReel frames={frames} />;
}
