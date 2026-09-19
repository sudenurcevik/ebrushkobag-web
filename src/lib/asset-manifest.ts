import { SEASONS } from '../data/seasons';
import { ARCHIVE, PRODUCTS } from '../data/products';
import { HERO, STORY } from '../data/content';
import type { ImageRef } from '../data/types';
import { MODELS } from '../data/configurator';
import { allConfiguratorAssetPaths } from './asset-index';

/**
 * The single, derived answer to "what photography does this site need?".
 *
 * Built from the seasons, the catalog and the editorial content rather than
 * written by hand, so it cannot drift: add a season, a product or a yarn and it
 * shows up here, in docs/ASSET-MANIFEST.md and on /asset-manifest automatically.
 */

export interface AssetSpec {
  path: string;
  width: number;
  height: number;
  ratio: string;
  transparent: boolean;
  usedIn: string;
  purpose: string;
  /** Blocks launch — the plan forbids faking these (§32). */
  critical: boolean;
}

const ratio = (w: number, h: number): string => {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const d = gcd(w, h);
  return `${w / d}:${h / d}`;
};

const fromImage = (
  image: ImageRef,
  usedIn: string,
  purpose: string,
  critical = false,
): AssetSpec => ({
  path: image.src,
  width: image.width,
  height: image.height,
  ratio: ratio(image.width, image.height),
  transparent: false,
  usedIn,
  purpose,
  critical,
});

export function seasonAssets(): AssetSpec[] {
  const specs: AssetSpec[] = [
    fromImage(
      HERO.image,
      'Açılış',
      'Markayı tanıtan tam ekran kare. Sol alt üçte biri boş kalmalı; başlık oraya oturuyor.',
      true,
    ),
  ];

  for (const season of SEASONS) {
    specs.push(
      fromImage(
        season.images.hero,
        `${season.label} — bölüm görseli`,
        'Bölümün büyük editoryal karesi. Kadrajın bir kenarı ekrandan taşacak şekilde kullanılıyor.',
        true,
      ),
      fromImage(
        season.images.product,
        `${season.label} — geçiş ürünü`,
        'Mevsim geçişinde içine zoom yapılan kare. Örgü dokusu net görünmeli; çanta ortalanmış olmalı.',
        true,
      ),
      fromImage(
        season.images.macro,
        `${season.label} — makro doku`,
        'Geçişin tam ekran olduğu an. İlmeklerin ayırt edildiği çok yakın makro çekim. ' +
          'Dosya yoksa site çizilmiş örgü dokusunu kullanır — ama gerçek doku bu bölümün imzası.',
        true,
      ),
    );
  }

  return specs;
}

/** The four clips that play in the home page's film strip. */
export function seasonVideoAssets(): AssetSpec[] {
  return SEASONS.map((season) => ({
    path: season.video.src,
    width: season.video.width,
    height: season.video.height,
    ratio: ratio(season.video.width, season.video.height),
    transparent: false,
    usedIn: `${season.label} — film şeridi`,
    purpose:
      'Sessiz, 6–12 saniyelik döngü. H.264 MP4, 1920×1080, < 5 MB. Kare 3:2 olarak ' +
      'kırpılıyor, bu yüzden önemli şeyler ortada kalsın. Dosya yoksa o kare film ' +
      'başındaki geri sayım görseliyle bekler.',
    critical: false,
  }));
}

export function productAssets(): AssetSpec[] {
  return PRODUCTS.map((product) =>
    fromImage(
      product.image,
      `${product.season.toUpperCase()} — ${product.name}`,
      'Ürünün editoryal karesi. Gerçek çantanın kendi geometrisi korunmalı; yeniden tasarlanmış ' +
        'bir çanta üretilmemeli (plan §31).',
      true,
    ),
  );
}

export function archiveAssets(): AssetSpec[] {
  return ARCHIVE.map((item) =>
    fromImage(item.image, `Arşiv — ${item.label}`, 'Eski Instagram karesi. Kadrajlar birbirinden farklı olsun.'),
  );
}

export function storyAssets(): AssetSpec[] {
  return [
    fromImage(STORY.images.hands, 'Hikâyemiz', 'Örgü ören eller, yakın plan.'),
    fromImage(STORY.images.workspace, 'Hikâyemiz', 'Atölye masası, geniş kare.'),
    fromImage(STORY.images.yarn, 'Hikâyemiz', 'İp rafı ya da yumaklar.'),
  ];
}

const LAYER_PURPOSE: Record<string, string> = {
  'shadow.webp': 'Zemin gölgesi. Yalnızca gölge, çanta yok.',
  'body-neutral.webp':
    'Nötr (doygunluğu alınmış) örgü gövde. Renk buradan türetilir: doku, ilmek ve gölgeler bu katmanda yaşar.',
  'highlights.webp': 'Parlaklık geçişi. Yalnızca açık tonlar; screen olarak bindirilir.',
  'body-black.webp': 'Siyah gövdenin kendi çekimi. Koyu tonlarda renklendirme dokuyu yok ediyor.',
};

export function configuratorAssets(): AssetSpec[] {
  return allConfiguratorAssetPaths().map((path) => {
    const model = MODELS.find((m) => path.startsWith(`${m.assetDir}/`));
    const file = path.split('/').pop() ?? path;
    const group = path.includes('/handles/') ? 'sap' : path.includes('/details/') ? 'detay' : 'gövde';

    const purpose =
      LAYER_PURPOSE[file] ??
      (group === 'sap'
        ? 'Yalnızca sap. Gövde olmadan, halkalar dahil.'
        : 'Yalnızca detay katmanı. Gövdenin üzerine, aynı hizada.');

    return {
      path,
      width: model?.canvas.width ?? 2000,
      height: model?.canvas.height ?? 2000,
      ratio: '1:1',
      transparent: true,
      usedIn: `Atölye önizleme — ${model?.name ?? '—'} (${group})`,
      purpose,
      critical: false,
    };
  });
}

export interface AssetGroup {
  id: string;
  title: string;
  note: string;
  assets: AssetSpec[];
}

export function assetGroups(): AssetGroup[] {
  return [
    {
      id: 'seasons',
      title: 'Mevsim görselleri',
      note:
        'Sitenin omurgası. Her mevsimin üç karesi var: bölüm görseli, geçişte zoom yapılan ürün ' +
        've makro doku. WebP, kalite 80–85.',
      assets: seasonAssets(),
    },
    {
      id: 'videos',
      title: 'Mevsim videoları',
      note:
        'Ana sayfadaki film şeridinde oynuyor. Sessiz ve döngüsel; sesli ya da uzun ' +
        'videolar bu bölüm için uygun değil. Gelmediği sürece kare boş kalmaz, film ' +
        'geri sayım görseliyle bekler.',
      assets: seasonVideoAssets(),
    },
    {
      id: 'products',
      title: 'Ürün görselleri',
      note:
        'Gerçek ürün kimliği korunmalı. Arka plan temizleme, ışık dengeleme ve kompozisyon ' +
        'düzenlemesi serbest; çantanın kendisi yeniden üretilmemeli (plan §31).',
      assets: productAssets(),
    },
    {
      id: 'archive',
      title: 'Arşiv',
      note: 'Eski Instagram kareleri. Mozaikte farklı boyutlarda kullanılıyor.',
      assets: archiveAssets(),
    },
    {
      id: 'story',
      title: 'Hikâye',
      note: 'Üretim ve atölye kareleri.',
      assets: storyAssets(),
    },
    {
      id: 'configurator',
      title: 'Atölye katmanları',
      note:
        'Hepsi şeffaf WebP/PNG ve hepsi aynı 2000×2000 tuvale, aynı hizada. Çanta karenin ' +
        'yaklaşık %80’ini doldurur. Tek bir çekimden maskelenerek üretilmeli: çanta, kamera ve ' +
        'ışık sabit kalsın, yalnızca sap ve detay katmanları ayrılsın. ' +
        'Bir katman eksikse arayüz onu vektör olarak çizer — site hiçbir zaman bozulmaz.',
      assets: configuratorAssets(),
    },
  ];
}

export const assetCount = (): number =>
  assetGroups().reduce((total, group) => total + group.assets.length, 0);
