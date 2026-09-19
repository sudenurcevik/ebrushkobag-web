'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BRAND } from '@/config/brand';
import { ctaClasses, ctaStyle } from '@/components/ui/Cta';

const NAV_ITEMS = [
  { label: 'Koleksiyon', hash: '#koleksiyon' },
  { label: 'Mevsimler', hash: '#mevsimler' },
  { label: 'Hikâyemiz', hash: '#hikayemiz' },
  { label: 'Arşiv', hash: '#arsiv' },
] as const;

/**
 * Sticky, compact, transparent over the hero — it settles into a solid blush
 * bar once the visitor commits to scrolling (plan §6). Blush stays constant
 * through every season, so the bar reads as the brand's frame around a changing
 * year rather than as part of any one chapter.
 *
 * Two deliberate absences at the top of the page:
 *
 * - The logo lives in the hero, not here. The bar carries the wordmark only, so
 *   the mark itself gets one uncontested appearance instead of two competing
 *   ones.
 * - "Çantanı Tasarla" only appears once the hero is behind you. While the hero
 *   is on screen its own large call to action is the single thing to press;
 *   showing both at once would ask the same question twice.
 */
export function Navbar({ transparentOnTop = false }: { transparentOnTop?: boolean }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(!transparentOnTop);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!transparentOnTop) return;

    // Reading scrollY in a passive listener forces no layout, so no animation
    // frame trampoline is needed — and the bar is right on the first paint.
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.65);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [transparentOnTop]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onHome = pathname === '/';
  const href = (hash: string) => (onHome ? hash : `/${hash}`);
  const solid = scrolled || menuOpen;
  const tone = solid ? 'text-ink' : 'text-cream';

  return (
    <>
      <header
        className={[
          'fixed inset-x-0 top-0 z-50 h-[var(--nav-height)]',
          'transition-[background-color,border-color] duration-500 ease-editorial',
          solid ? 'border-b border-blush-deep bg-blush' : 'border-b border-transparent bg-transparent',
        ].join(' ')}
      >
        <nav className="shell flex h-full items-center justify-between gap-4" aria-label="Ana menü">
          <Link
            href="/"
            className={`font-display text-lg font-semibold tracking-[0.2em] ${tone} transition-colors duration-500 sm:text-xl`}
            onClick={() => setMenuOpen(false)}
          >
            {BRAND.name}
            <span className="sr-only"> — ana sayfa</span>
          </Link>

          <ul className={`hidden items-center gap-9 md:flex ${tone} transition-colors duration-500`}>
            {NAV_ITEMS.map((item) => (
              <li key={item.hash}>
                <Link href={href(item.hash)} className="link-underline label">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            {/* Hidden while the hero owns the call to action; `inert` keeps it
                out of the tab order too, not just out of sight. */}
            <Link
              href="/atelier"
              inert={!solid}
              aria-hidden={!solid}
              tabIndex={solid ? undefined : -1}
              className={ctaClasses(
                'solid',
                'sm',
                `px-4 transition-[opacity,transform] duration-500 sm:px-6 ${
                  solid ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-1 opacity-0'
                }`,
              )}
              style={ctaStyle('solid', { accent: '#FF68C4', ink: '#241A20', onAccent: '#FFFBF4' })}
            >
              <span className="sm:hidden">Tasarla</span>
              <span className="hidden sm:inline">Çantanı Tasarla</span>
            </Link>

            <button
              type="button"
              className={`-mr-2 flex h-11 w-11 items-center justify-center md:hidden ${tone}`}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="sr-only">{menuOpen ? 'Menüyü kapat' : 'Menüyü aç'}</span>
              <span className="relative block h-3 w-6" aria-hidden>
                <span
                  className={`absolute left-0 block h-[2px] w-full rounded-full bg-current transition-all duration-400 ease-editorial ${
                    menuOpen ? 'top-1.5 rotate-45' : 'top-0'
                  }`}
                />
                <span
                  className={`absolute left-0 block h-[2px] w-full rounded-full bg-current transition-all duration-400 ease-editorial ${
                    menuOpen ? 'top-1.5 -rotate-45' : 'top-3'
                  }`}
                />
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/*
        Always mounted: showing and hiding is a CSS transition, and `inert` keeps
        the closed sheet out of the focus order without an animation library.
      */}
      <div
        id="mobile-menu"
        inert={!menuOpen}
        aria-hidden={!menuOpen}
        className={[
          'fixed inset-0 z-40 flex flex-col justify-between bg-blush px-gutter pb-12',
          'pt-[calc(var(--nav-height)+3rem)] md:hidden',
          'transition-opacity duration-400 ease-editorial',
          menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
      >
        <ul className="space-y-1">
          {NAV_ITEMS.map((item, index) => (
            <li key={item.hash} className="overflow-hidden border-b border-blush-deep">
              <span
                className="block transition-transform duration-500 ease-editorial"
                style={{
                  transform: menuOpen ? 'none' : 'translateY(100%)',
                  transitionDelay: menuOpen ? `${0.05 * index}s` : '0s',
                }}
              >
                <Link
                  href={href(item.hash)}
                  className="block py-5 font-display text-4xl text-ink"
                  onClick={() => setMenuOpen(false)}
                  tabIndex={menuOpen ? undefined : -1}
                >
                  {item.label}
                </Link>
              </span>
            </li>
          ))}
          <li className="overflow-hidden border-b border-blush-deep">
            <a
              href={BRAND.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block py-5 font-display text-4xl text-ink"
              tabIndex={menuOpen ? undefined : -1}
            >
              Instagram
            </a>
          </li>
        </ul>

        <Link
          href="/atelier"
          className={ctaClasses('solid', 'lg', 'w-full')}
          style={ctaStyle('solid', { accent: '#FF68C4', ink: '#241A20', onAccent: '#FFFBF4' })}
          onClick={() => setMenuOpen(false)}
          tabIndex={menuOpen ? undefined : -1}
        >
          Çantanı Tasarla
        </Link>
      </div>
    </>
  );
}
