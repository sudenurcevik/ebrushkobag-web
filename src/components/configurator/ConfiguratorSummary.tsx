'use client';

import { useState, type RefObject } from 'react';
import { BRAND } from '@/config/brand';
import type { BagSelection, SeasonId } from '@/data/types';
import { getSeason } from '@/data/seasons';
import { priceFor } from '@/lib/catalog';
import { copyText } from '@/lib/clipboard';
import { exportDesignImage } from '@/lib/export-image';
import { formatPrice } from '@/lib/format';
import { buildPreviewLayers } from '@/lib/preview';
import { selectionToShareUrl } from '@/lib/url-state';
import { buildOrderMessage, buildReadableSummary, buildSummary, designFileName } from '@/lib/summary';
import { CtaButton, CtaLink, ctaStyle } from '@/components/ui/Cta';

/**
 * Step five (plan §29, §30).
 *
 * Instagram cannot be relied on to accept a prefilled message, so the order flow
 * is explicit: build the code, build a readable summary, copy it, confirm the
 * copy landed, then open Instagram. The visitor arrives with everything already
 * on their clipboard. No payment is taken anywhere on this site.
 */
export function ConfiguratorSummary({
  selection,
  presence,
  previewRef,
  showToast,
  season,
}: {
  selection: BagSelection;
  presence: Record<string, boolean>;
  previewRef: RefObject<HTMLDivElement | null>;
  showToast: (message: string) => void;
  season: SeasonId | 'all';
}) {
  const [exporting, setExporting] = useState(false);
  const summary = buildSummary(selection);
  const price = priceFor(selection);
  const palette = season === 'all' ? getSeason('spring') : getSeason(season);

  async function handleCopyOrder() {
    const ok = await copyText(buildOrderMessage(selection));
    showToast(ok ? 'Sipariş bilgileri kopyalandı.' : 'Kopyalanamadı, metni elle alabilirsin.');
    return ok;
  }

  async function handleCopyLink() {
    const ok = await copyText(selectionToShareUrl(selection));
    showToast(ok ? 'Tasarım linki kopyalandı.' : 'Link kopyalanamadı.');
  }

  async function handleInstagram() {
    await handleCopyOrder();
    window.setTimeout(() => {
      window.open(BRAND.instagramOrderUrl, '_blank', 'noopener,noreferrer');
    }, 700);
  }

  function handleSave() {
    try {
      const key = 'ebrushkobag.designs.v1';
      const raw = window.localStorage.getItem(key);
      const list = raw ? (JSON.parse(raw) as unknown[]) : [];
      const next = [
        { code: summary.code, selection, savedAt: new Date().toISOString() },
        ...(Array.isArray(list) ? list : []).filter(
          (item) => (item as { code?: string }).code !== summary.code,
        ),
      ].slice(0, 24);
      window.localStorage.setItem(key, JSON.stringify(next));
      showToast('Tasarımın bu cihaza kaydedildi.');
    } catch {
      // Private mode or a full quota — saving is a convenience, never a blocker.
      showToast('Tasarım kaydedilemedi.');
    }
  }

  async function handleExport() {
    if (!previewRef.current) return;
    setExporting(true);
    try {
      await exportDesignImage({
        layers: buildPreviewLayers(selection),
        presence,
        container: previewRef.current,
        designCode: summary.code,
        caption: buildReadableSummary(selection),
        brandName: BRAND.name,
        fileName: designFileName(selection),
        ground: palette.background,
        ink: palette.ink,
        accent: palette.accent,
      });
      showToast('Görsel indirildi.');
    } catch {
      showToast('Görsel oluşturulamadı.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-9">
      <header>
        <p className="label text-hotpink">Tasarımın hazır</p>
        <h3 className="mt-3 font-display text-display-sm leading-none">{summary.modelName}</h3>
        <p className="mt-4 font-sans text-lg font-semibold tracking-[0.3em] text-hotpink">
          {summary.code}
        </p>
      </header>

      <dl className="rounded-3xl border border-blush-deep px-5 py-2">
        {[
          ...summary.lines,
          { label: 'Ölçü', value: summary.dimensions },
          { label: 'Malzeme', value: summary.materials },
          { label: 'Üretim', value: summary.productionTime },
        ].map((line) => (
          <div
            key={line.label}
            className="flex items-baseline justify-between gap-4 border-b border-blush-deep py-3 last:border-b-0"
          >
            <dt className="label text-ink-muted">{line.label}</dt>
            <dd className="text-right text-[0.9375rem] text-ink">{line.value}</dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-4 border-t border-blush-deep py-4">
          <dt className="label text-ink-muted">Tahmini fiyat</dt>
          <dd className="font-display text-2xl tabular-nums text-ink">{formatPrice(price.total)}</dd>
        </div>
      </dl>

      <p className="text-xs leading-relaxed text-ink-muted">{BRAND.currency.note}</p>

      <div className="space-y-3">
        <CtaButton
          variant="solid"
          size="lg"
          className="w-full"
          style={ctaStyle('solid', { accent: '#FF68C4', ink: '#241A20', onAccent: '#FFFBF4' })}
          onClick={handleInstagram}
        >
          Instagram&apos;dan Sipariş Ver
        </CtaButton>
        <p className="text-center text-xs text-ink-muted">
          Sipariş bilgilerin panoya kopyalanır, sonra Instagram açılır.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <CtaButton
          variant="outline"
          className="w-full"
          style={ctaStyle('outline', { accent: '#E7D9DB', ink: '#241A20' })}
          onClick={handleCopyOrder}
        >
          Sipariş Bilgilerini Kopyala
        </CtaButton>
        <CtaButton
          variant="outline"
          className="w-full"
          style={ctaStyle('outline', { accent: '#E7D9DB', ink: '#241A20' })}
          onClick={handleCopyLink}
        >
          Linki Kopyala
        </CtaButton>
        <CtaButton
          variant="outline"
          className="w-full"
          style={ctaStyle('outline', { accent: '#E7D9DB', ink: '#241A20' })}
          onClick={handleSave}
        >
          Tasarımı Kaydet
        </CtaButton>
        <CtaButton
          variant="outline"
          className="w-full"
          style={ctaStyle('outline', { accent: '#E7D9DB', ink: '#241A20' })}
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? 'Hazırlanıyor' : 'Görseli Kaydet'}
        </CtaButton>
      </div>

      <p className="text-center text-xs text-ink-muted">
        Ya da doğrudan{' '}
        <CtaLink
          href={BRAND.instagramUrl}
          external
          variant="ghost"
          size="sm"
          className="px-0 py-0 normal-case tracking-normal underline"
          style={{ color: '#E9429F' }}
        >
          {BRAND.instagramHandle}
        </CtaLink>{' '}
        hesabımıza yazabilirsin.
      </p>
    </div>
  );
}
