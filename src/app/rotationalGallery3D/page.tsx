import type { Metadata } from 'next';
import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { RotationalGallery3D } from '@/components/rotational-gallery-3d/RotationalGallery3D';

/**
 * Design experiment — the vitrin bags on a cylindrical 3D reel, to compare
 * against the flat /rotationalGallery. Independent of that route and of the
 * main site: deleting this folder, components/rotational-gallery-3d and
 * data/gallery-3d-items.ts removes it.
 */
export const metadata: Metadata = {
  title: 'Dönen Arşiv 3D',
  robots: { index: false, follow: false },
};

const NAV = [
  { href: '/rotationalGallery', label: '2D Galeri' },
  { href: '/rotationalGallery3D', label: '3D Galeri', current: true },
  { href: '/', label: 'Ana Sayfa' },
];

export default function RotationalGallery3DPage() {
  return (
    <main id="main" className="relative flex h-[100svh] min-h-[36rem] flex-col overflow-hidden text-ink">
      <header className="relative z-10 flex items-center justify-between gap-4 px-5 pt-5 sm:px-10 sm:pt-7">
        <Link href="/rotationalGallery3D" className="flex shrink-0 items-center gap-3" aria-label="EBRUSHKOBAG — 3D galeri">
          <Logo size={32} priority />
          <span className="hidden font-display text-[0.95rem] font-semibold tracking-[0.18em] sm:inline">
            EBRUSHKOBAG
          </span>
        </Link>
        <nav aria-label="Deneyler">
          <ul className="flex items-center gap-4 text-[0.625rem] font-medium uppercase tracking-label sm:gap-7 sm:text-micro">
            {NAV.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={link.current ? 'page' : undefined}
                  className={`border-b pb-1 transition-colors duration-300 ${
                    link.current
                      ? 'border-[#B8966A] text-ink'
                      : 'border-transparent text-ink-muted hover:text-ink'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <RotationalGallery3D />
    </main>
  );
}
