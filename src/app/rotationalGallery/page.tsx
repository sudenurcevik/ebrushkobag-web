import type { Metadata } from 'next';
import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { RotationalGallery } from '@/components/rotational-gallery/RotationalGallery';

/**
 * Design experiment — a rotating reel of the vitrin bags. Independent of the
 * main site: nothing links here, and deleting this folder, the
 * rotational-gallery components and data/gallery-items.ts removes it.
 */
export const metadata: Metadata = {
  title: 'Dönen Arşiv',
  robots: { index: false, follow: false },
};

export default function RotationalGalleryPage() {
  return (
    <main id="main" className="relative flex h-[100svh] min-h-[34rem] flex-col overflow-hidden text-ink">
      <header className="relative z-10 flex items-center justify-between px-5 pt-5 sm:px-10 sm:pt-7">
        <Link href="/rotationalGallery" className="flex items-center gap-3" aria-label="EBRUSHKOBAG — dönen arşiv">
          <Logo size={34} priority />
          <span className="font-display text-[0.95rem] font-semibold tracking-[0.18em]">EBRUSHKOBAG</span>
        </Link>
        <Link
          href="/"
          className="group flex items-center gap-2 text-micro font-medium uppercase text-ink-soft transition-colors hover:text-ink"
        >
          <span aria-hidden className="transition-transform duration-300 ease-editorial group-hover:-translate-x-0.5">
            ←
          </span>
          Ana Sayfa
        </Link>
      </header>

      <p className="pointer-events-none absolute left-10 top-[22%] z-10 hidden max-w-[13rem] font-display text-[1.35rem] font-light leading-snug text-ink-soft xl:block">
        Dönen bir arşiv.
        <br />
        Dört mevsim.
        <br />
        <span className="italic text-ink">Bir sürü hikâye.</span>
      </p>
      <p className="pointer-events-none absolute right-10 top-[22%] z-10 hidden text-right text-micro uppercase text-ink-muted xl:block">
        Sürükle · Kaydır · ← →
      </p>

      <RotationalGallery />
    </main>
  );
}
