import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';

type Variant = 'solid' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

/**
 * Buttons read as printed labels: tracked-out caps, a generous pill only where
 * the brand's playfulness earns it, never a SaaS gradient or a drop shadow.
 * Colour always arrives from the surrounding season via `style`.
 */
export function ctaClasses(variant: Variant = 'solid', size: Size = 'md', extra = ''): string {
  const base =
    'inline-flex items-center justify-center gap-3 rounded-full font-sans font-medium uppercase ' +
    'tracking-label transition-[background-color,color,border-color,transform] duration-400 ' +
    'ease-editorial hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-40 ' +
    'disabled:hover:translate-y-0';

  const sizes: Record<Size, string> = {
    sm: 'px-5 py-2.5 text-[0.625rem]',
    md: 'px-7 py-3.5 text-[0.6875rem]',
    lg: 'px-10 py-5 text-[0.75rem]',
  };

  const variants: Record<Variant, string> = {
    solid: 'border border-transparent',
    outline: 'border',
    ghost: 'border border-transparent underline-offset-4 hover:underline',
  };

  return [base, sizes[size], variants[variant], extra].filter(Boolean).join(' ');
}

/** Season-aware colour sets, kept next to the classes so they stay in step. */
export function ctaStyle(
  variant: Variant,
  colors: { accent: string; ink: string; onAccent?: string },
): CSSProperties {
  if (variant === 'solid') {
    return { backgroundColor: colors.accent, color: colors.onAccent ?? '#241A20' };
  }
  if (variant === 'outline') {
    return { borderColor: colors.accent, color: colors.ink };
  }
  return { color: colors.ink };
}

interface CtaLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  external?: boolean;
}

export function CtaLink({
  href,
  variant = 'solid',
  size = 'md',
  className = '',
  children,
  external = false,
  ...rest
}: CtaLinkProps) {
  const classes = ctaClasses(variant, size, className);

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes} {...rest}>
        {children}
        <span className="sr-only">(yeni sekmede açılır)</span>
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}

export function CtaButton({
  variant = 'solid',
  size = 'md',
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}) {
  return (
    <button className={ctaClasses(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}
