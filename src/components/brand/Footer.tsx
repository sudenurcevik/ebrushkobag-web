import Link from 'next/link';
import { BRAND } from '@/config/brand';
import { Logo } from './Logo';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-blush-deep bg-cream">
      <div className="shell grid gap-12 py-16 md:grid-cols-[1.6fr_1fr_1fr] md:py-20">
        <div>
          <Logo size={56} withWordmark />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-ink-soft">
            {BRAND.taglineTr}. Her çanta tek tek, elde örülür.
          </p>
          <p className="mt-6 text-sm text-ink-muted">
            {BRAND.city}, {BRAND.country}
          </p>
        </div>

        <nav aria-label="Alt menü">
          <h2 className="label text-ink-muted">Gezin</h2>
          <ul className="mt-5 space-y-3 text-sm text-ink-soft">
            <li>
              <Link href="/#mevsimler" className="link-underline">
                Mevsimler
              </Link>
            </li>
            <li>
              <Link href="/#arsiv" className="link-underline">
                Arşiv
              </Link>
            </li>
            <li>
              <Link href="/#hikayemiz" className="link-underline">
                Hikâyemiz
              </Link>
            </li>
            <li>
              <Link href="/#sorular" className="link-underline">
                Sık sorulanlar
              </Link>
            </li>
            <li>
              <Link href="/atelier" className="link-underline">
                Çantanı Tasarla
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="label text-ink-muted">İletişim</h2>
          <ul className="mt-5 space-y-3 text-sm text-ink-soft">
            <li>
              <a
                href={BRAND.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline"
              >
                {BRAND.instagramHandle}
              </a>
            </li>
            <li>
              <a href={`mailto:${BRAND.email}`} className="link-underline">
                {BRAND.email}
              </a>
            </li>
          </ul>
          <p className="mt-6 max-w-[24ch] text-xs leading-relaxed text-ink-muted">
            Sitede ödeme alınmaz. Siparişler Instagram üzerinden tamamlanır.
          </p>
        </div>
      </div>

      <div className="shell flex flex-col gap-2 border-t border-blush-deep py-6 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {year} {BRAND.name}
        </p>
        <p className="tracking-wider">Made by hand. Chosen by you.</p>
      </div>
    </footer>
  );
}
