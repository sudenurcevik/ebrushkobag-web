import type { Metadata } from 'next';
import { BRAND } from '@/config/brand';
import { Navbar } from '@/components/brand/Navbar';
import { hasPublicAsset } from '@/lib/assets.server';
import { assetCount, assetGroups } from '@/lib/asset-manifest';

export const metadata: Metadata = {
  title: 'Görsel listesi',
  robots: { index: false, follow: false },
};

/**
 * Internal working page: the full asset manifest with live delivery status.
 * Not linked from the site and excluded from indexing — it exists so whoever is
 * shooting the photography can see exactly what is still missing.
 */
export default function AssetManifestPage() {
  const groups = assetGroups();
  const all = groups.flatMap((group) => group.assets);
  const delivered = all.filter((asset) => hasPublicAsset(asset.path)).length;
  const criticalMissing = all.filter((a) => a.critical && !hasPublicAsset(a.path)).length;

  return (
    <>
      <Navbar />
      <main id="main" className="bg-cream pt-[var(--nav-height)]">
        <div className="shell py-16">
          <p className="label text-hotpink">Dahili</p>
          <h1 className="mt-4 font-display text-display-sm">Görsel listesi</h1>
          <p className="mt-6 max-w-measure text-sm leading-relaxed text-ink-soft">
            {BRAND.name} için gereken tüm görseller. Mevsim, ürün ve katalog verisinden türetilir —
            yeni bir mevsim ya da renk eklendiğinde bu liste kendiliğinden güncellenir.
          </p>
          <p className="mt-5 flex flex-wrap gap-x-6 gap-y-1 text-sm tabular-nums">
            <span className="text-ink">
              {delivered} / {assetCount()} dosya teslim edildi
            </span>
            {criticalMissing > 0 && (
              <span className="text-burgundy">{criticalMissing} kritik dosya eksik</span>
            )}
          </p>

          {groups.map((group) => (
            <section key={group.id} className="mt-16">
              <h2 className="font-display text-3xl">{group.title}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-soft">{group.note}</p>

              <div className="mt-8 overflow-x-auto">
                <table className="w-full min-w-[54rem] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-y border-blush-deep">
                      {['Durum', 'Dosya', 'Ölçü', 'Şeffaf', 'Nerede'].map((head) => (
                        <th key={head} scope="col" className="label py-3 pr-4 font-normal text-ink-muted">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {group.assets.map((asset) => {
                      const present = hasPublicAsset(asset.path);
                      return (
                        <tr key={asset.path} className="border-b border-blush-deep/60 align-top">
                          <td className="py-3 pr-4">
                            <span
                              className={`text-[0.625rem] uppercase tracking-label ${
                                present ? 'text-lime-deep' : asset.critical ? 'text-burgundy' : 'text-ink-muted'
                              }`}
                            >
                              {present ? 'var' : asset.critical ? 'kritik' : 'eksik'}
                            </span>
                          </td>
                          <td className="py-3 pr-4 font-mono text-xs text-ink">{asset.path}</td>
                          <td className="py-3 pr-4 tabular-nums text-ink-soft">
                            {asset.width}×{asset.height}
                            <span className="ml-2 text-ink-muted">{asset.ratio}</span>
                          </td>
                          <td className="py-3 pr-4 text-ink-soft">{asset.transparent ? 'Evet' : 'Hayır'}</td>
                          <td className="py-3 text-ink-soft">
                            {asset.usedIn}
                            <span className="mt-1 block max-w-[38ch] text-xs text-ink-muted">
                              {asset.purpose}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
