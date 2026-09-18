import Image from 'next/image';
import { BRAND } from '@/config/brand';

/**
 * The real EBRUSHKOBAG logo — never redrawn, recreated or reinterpreted
 * (plan §3). The artwork is circular on a blush field, so a round crop trims
 * only the corners and lets it sit on any seasonal background like a stamp.
 */
export function Logo({
  size = 48,
  className = '',
  priority = false,
  withWordmark = false,
}: {
  size?: number;
  className?: string;
  priority?: boolean;
  withWordmark?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <Image
        src={BRAND.logo.src}
        alt={withWordmark ? '' : BRAND.logo.alt}
        aria-hidden={withWordmark || undefined}
        width={size}
        height={size}
        priority={priority}
        className="rounded-full"
        style={{ width: size, height: size }}
      />
      {withWordmark && (
        <span className="font-display text-lg font-semibold tracking-[0.18em]">{BRAND.name}</span>
      )}
    </span>
  );
}
