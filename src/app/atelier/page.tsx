import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BRAND } from '@/config/brand';
import { Configurator } from '@/components/configurator/Configurator';
import { Navbar } from '@/components/brand/Navbar';
import { Footer } from '@/components/brand/Footer';
import { assetPresence } from '@/lib/assets.server';
import { allConfiguratorAssetPaths, allThumbnailPaths } from '@/lib/asset-index';
import { parseSelection } from '@/lib/catalog';
import { buildDesignCode } from '@/lib/design-code';
import { buildReadableSummary } from '@/lib/summary';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const single = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const selection = parseSelection({
    model: single(params.model),
    body: single(params.body),
    detail: single(params.detail),
    handle: single(params.handle),
  });

  // A shared link should describe the actual bag, not the generic page.
  const code = buildDesignCode(selection);
  const summary = buildReadableSummary(selection);

  return {
    title: `Atölye — ${code}`,
    description: `${summary}. ${BRAND.name} atölyesinde kendi çantanı tasarla.`,
    openGraph: { title: `${code} — ${BRAND.name}`, description: summary },
  };
}

export default function AtelierPage() {
  // Resolved once, on the server: which layer and material files actually exist.
  const presence = assetPresence([...allConfiguratorAssetPaths(), ...allThumbnailPaths()]);

  return (
    <>
      <Navbar />
      <main id="main" className="pt-[var(--nav-height)]">
        <h1 className="sr-only">Çantanı tasarla</h1>
        <Suspense fallback={<ConfiguratorFallback />}>
          <Configurator presence={presence} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

function ConfiguratorFallback() {
  return (
    <div className="lg:grid lg:grid-cols-[3fr_2fr]">
      <div className="h-[38svh] min-h-[248px] bg-blush lg:h-[calc(100svh-var(--nav-height))]" />
      <div className="bg-cream px-gutter py-14">
        <p className="label text-ink-muted">Atölye hazırlanıyor</p>
      </div>
    </div>
  );
}
