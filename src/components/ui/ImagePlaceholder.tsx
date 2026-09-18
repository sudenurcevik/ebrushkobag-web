import type { ImageRef } from '@/data/types';

/**
 * Stand-in for photography the brand has not delivered yet.
 *
 * It states the asset's name and required dimensions, and marks anything flagged
 * `required` so a missing product or macro frame reads as *reserved*, never as
 * broken or — worse — as a faked product (plan §32).
 */
export function ImagePlaceholder({
  image,
  ground,
  ink,
  accent,
  align = 'center',
  className = '',
}: {
  image: Pick<ImageRef, 'src' | 'width' | 'height' | 'placeholderLabel' | 'alt' | 'required'>;
  /** Background, taken from the surrounding season. */
  ground: string;
  ink: string;
  accent: string;
  /** `top` keeps the caption clear of type that sits over a full-bleed frame. */
  align?: 'center' | 'top';
  className?: string;
}) {
  const label = image.placeholderLabel ?? image.src.split('/').pop() ?? 'Görsel';

  return (
    <div
      className={`relative flex h-full w-full justify-center overflow-hidden ${
        align === 'top' ? 'items-start pt-[14vh]' : 'items-center'
      } ${className}`}
      style={{ backgroundColor: ground, color: ink }}
      role="img"
      aria-label={image.alt}
    >
      {/* A loose stitch mark, so an empty frame still belongs to this brand. */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.18]" aria-hidden>
        <defs>
          <pattern id={`ph-${label}`} width="34" height="26" patternUnits="userSpaceOnUse">
            <path
              d="M 3 21 Q 9 4 17 21 Q 25 4 31 21"
              fill="none"
              stroke={accent}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#ph-${label})`} />
      </svg>

      <div
        className="pointer-events-none absolute inset-[0.7rem] border"
        style={{ borderColor: accent, opacity: 0.4 }}
        aria-hidden
      />

      <div className="relative px-6 text-center">
        <span
          className="mx-auto mb-3 block h-1 w-10 rounded-full"
          style={{ backgroundColor: accent }}
          aria-hidden
        />
        <span className="block font-sans text-micro uppercase tracking-label">{label}</span>
        <span className="mt-2 block text-[0.625rem] tabular-nums tracking-wider opacity-60">
          {image.width} × {image.height}
        </span>
        {image.required && (
          <span
            className="mt-3 inline-block px-2 py-1 text-[0.5625rem] uppercase tracking-label"
            style={{ backgroundColor: accent, color: ground }}
          >
            Görsel bekleniyor
          </span>
        )}
      </div>
    </div>
  );
}
