import Image from 'next/image';
import type { ImageRef } from '@/data/types';
import { hasPublicAsset } from '@/lib/assets.server';
import { ImagePlaceholder } from './ImagePlaceholder';

interface EditorialImageProps {
  image: ImageRef;
  /** Always pass one — it is what keeps mobile payloads small (plan §35). */
  sizes: string;
  /** Only the opening hero should set this. */
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  /** Placeholder colours, normally taken from the surrounding season. */
  ground?: string;
  ink?: string;
  accent?: string;
  /** Fill the parent instead of holding the image's own aspect ratio. */
  fill?: boolean;
  /** Placeholder caption position — `top` when type sits over the frame. */
  placeholderAlign?: 'center' | 'top';
}

/**
 * Every photograph renders through this: fixed aspect box (no layout shift),
 * responsive sizes, lazy by default, and a designed placeholder while the asset
 * is missing.
 */
export function EditorialImage({
  image,
  sizes,
  priority = false,
  className = '',
  imageClassName = '',
  ground = '#FEE9EA',
  ink = '#241A20',
  accent = '#FF68C4',
  fill = false,
  placeholderAlign = 'center',
}: EditorialImageProps) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={fill ? undefined : { aspectRatio: `${image.width} / ${image.height}` }}
    >
      {hasPublicAsset(image.src) ? (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          quality={82}
          className={`object-cover ${imageClassName}`}
        />
      ) : (
        <ImagePlaceholder
          image={image}
          ground={ground}
          ink={ink}
          accent={accent}
          align={placeholderAlign}
        />
      )}
    </div>
  );
}
