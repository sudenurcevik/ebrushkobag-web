import { BRAND } from '@/config/brand';
import { assetCount, assetGroups } from './asset-manifest';

/**
 * Renders the manifest as docs/ASSET-MANIFEST.md. Generated rather than written
 * so it cannot drift from the data — regenerate with `npm run assets:manifest`.
 */
export function assetManifestMarkdown(): string {
  const lines: string[] = [];

  lines.push(`# ${BRAND.name} — Görsel Listesi`);
  lines.push('');
  lines.push(
    '> Bu dosya `src/lib/asset-manifest.ts` üzerinden üretilir. Elle düzenlemeyin; ' +
      'mevsim/ürün/katalog verisi değiştiğinde `npm run assets:manifest` ile yenileyin.',
  );
  lines.push('');
  lines.push(
    `Toplam **${assetCount()} dosya**. Hepsi \`public/\` altına, tabloda yazan yola birebir aynı ` +
      'adla konur. Eksik dosyalar tasarlanmış yer tutucularla karşılanır, bu yüzden görseller ' +
      'parça parça teslim edilebilir.',
  );
  lines.push('');
  lines.push('**Kritik** işaretli dosyalar markanın gerçek ürün kimliğini taşır ve uydurulamaz.');
  lines.push('Canlı durumu `npm run dev` çalışırken `/asset-manifest` adresinde görebilirsiniz.');
  lines.push('');

  for (const group of assetGroups()) {
    lines.push(`## ${group.title}`);
    lines.push('');
    lines.push(group.note);
    lines.push('');
    lines.push('| Dosya | Ölçü | Oran | Şeffaf | Kritik | Nerede | Amaç |');
    lines.push('| --- | --- | --- | --- | --- | --- | --- |');
    for (const asset of group.assets) {
      lines.push(
        `| \`${asset.path}\` | ${asset.width}×${asset.height} | ${asset.ratio} | ` +
          `${asset.transparent ? 'Evet' : 'Hayır'} | ${asset.critical ? 'Evet' : '—'} | ` +
          `${asset.usedIn} | ${asset.purpose} |`,
      );
    }
    lines.push('');
  }

  lines.push('## Teslim notları');
  lines.push('');
  lines.push('- Biçim: editoryal görseller için WebP (kalite 80–85), katmanlar için şeffaf WebP/PNG.');
  lines.push('- Renk profili: sRGB.');
  lines.push('- Dosya adlarını değiştirmeyin; kod bu yollara göre arıyor.');
  lines.push(
    '- Makro dokular geçişin tam ekran olduğu an için. Gelmediği sürece site çizilmiş örgü ' +
      'dokusunu kullanır; gerçek doku geldiğinde üstüne çapraz geçişle biner.',
  );
  lines.push(
    '- Logo `public/brand/ebrushkobag-logo.png` olarak duruyor ve yeniden çizilmemeli.',
  );
  lines.push('');

  return lines.join('\n');
}
