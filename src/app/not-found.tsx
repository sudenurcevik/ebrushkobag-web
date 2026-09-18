import Link from 'next/link';
import { Navbar } from '@/components/brand/Navbar';
import { Footer } from '@/components/brand/Footer';
import { ctaClasses, ctaStyle } from '@/components/ui/Cta';

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main id="main" className="flex min-h-[70svh] flex-col justify-center bg-blush pt-[var(--nav-height)]">
        <div className="shell">
          <p className="label text-hotpink">404</p>
          <h1 className="mt-6 max-w-[20ch] font-display text-display-sm">
            Aradığın sayfa burada değil.
          </h1>
          <p className="mt-6 max-w-measure text-sm leading-relaxed text-ink-soft">
            Bağlantı taşınmış olabilir. Mevsimlere dönebilir ya da doğrudan kendi çantanı
            tasarlayabilirsin.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/atelier"
              className={ctaClasses('solid', 'md')}
              style={ctaStyle('solid', { accent: '#FF68C4', ink: '#241A20', onAccent: '#FFFBF4' })}
            >
              Çantanı Tasarla
            </Link>
            <Link
              href="/#mevsimler"
              className={ctaClasses('outline', 'md')}
              style={ctaStyle('outline', { accent: '#FF68C4', ink: '#241A20' })}
            >
              Mevsimler
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
