import type { BlendMode, PreviewLayer } from './preview';

/**
 * Renders the live preview to a downloadable PNG card.
 *
 * It composites from the *layer model*, not from a screenshot: each layer is
 * drawn in order with its blend mode. Photographed layers come from their file;
 * vector layers are serialised out of the DOM node already on screen, so the
 * export is faithful both before and after the photography lands.
 */

const CARD = { width: 1400, height: 1750 };
const BAG_BOX = { x: 140, y: 210, size: 1120 };

const COMPOSITE: Record<BlendMode, GlobalCompositeOperation> = {
  normal: 'source-over',
  multiply: 'multiply',
  screen: 'screen',
  'soft-light': 'soft-light',
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Katman yüklenemedi: ${src}`));
    img.src = src;
  });
}

function svgToImage(svg: SVGSVGElement, size: number): Promise<HTMLImageElement> {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', String(size));
  clone.setAttribute('height', String(size));
  const markup = new XMLSerializer().serializeToString(clone);
  return loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`);
}

/** Colour fill clipped to a mask image's alpha — the recolouring step, offscreen. */
async function tintedLayer(maskSrc: string, color: string, size: number): Promise<HTMLCanvasElement> {
  const mask = await loadImage(maskSrc);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas kullanılamıyor.');

  ctx.drawImage(mask, 0, 0, size, size);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

export interface ExportOptions {
  layers: PreviewLayer[];
  presence: Record<string, boolean>;
  container: HTMLElement;
  designCode: string;
  caption: string;
  brandName: string;
  fileName: string;
  /** Card background — normally the season the design started from. */
  ground?: string;
  ink?: string;
  accent?: string;
}

export async function exportDesignImage(options: ExportOptions): Promise<void> {
  const {
    layers,
    presence,
    container,
    designCode,
    caption,
    brandName,
    fileName,
    ground = '#FEE9EA',
    ink = '#241A20',
    accent = '#FF68C4',
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = CARD.width;
  canvas.height = CARD.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas kullanılamıyor.');

  ctx.fillStyle = ground;
  ctx.fillRect(0, 0, CARD.width, CARD.height);

  const drawnRoles = new Set<string>();

  for (const layer of layers) {
    const hasImage = layer.src ? presence[layer.src] : false;
    const hasMask = layer.maskSrc ? presence[layer.maskSrc] : false;
    ctx.globalCompositeOperation = COMPOSITE[layer.blend] ?? 'source-over';
    ctx.globalAlpha = layer.opacity;

    try {
      if (layer.src && hasImage) {
        const img = await loadImage(layer.src);
        ctx.drawImage(img, BAG_BOX.x, BAG_BOX.y, BAG_BOX.size, BAG_BOX.size);
        continue;
      }

      if (layer.maskSrc && hasMask && layer.color) {
        const tint = await tintedLayer(layer.maskSrc, layer.color, BAG_BOX.size);
        ctx.drawImage(tint, BAG_BOX.x, BAG_BOX.y);
        continue;
      }

      // Vector fallback: one SVG covers tint + texture, so draw each role once.
      const role =
        layer.role === 'bodyTexture' || layer.role === 'bodyPrerendered' ? 'bodyTint' : layer.role;
      if (drawnRoles.has(role)) continue;
      drawnRoles.add(role);

      const node = container.querySelector<SVGSVGElement>(`[data-export-role="${role}"] svg`);
      if (!node) continue;
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      const img = await svgToImage(node, BAG_BOX.size);
      ctx.drawImage(img, BAG_BOX.x, BAG_BOX.y, BAG_BOX.size, BAG_BOX.size);
    } catch {
      // A single unreachable layer must not lose the whole export.
      continue;
    }
  }

  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.textAlign = 'center';

  ctx.fillStyle = accent;
  ctx.font = '600 28px Manrope, system-ui, sans-serif';
  ctx.fillText(brandName.split('').join(' '), CARD.width / 2, 140);

  ctx.fillStyle = ink;
  ctx.font = '600 76px Fraunces, Georgia, serif';
  ctx.fillText(designCode, CARD.width / 2, CARD.height - 210);

  ctx.fillStyle = ink;
  ctx.globalAlpha = 0.7;
  ctx.font = '400 30px Manrope, system-ui, sans-serif';
  ctx.fillText(caption, CARD.width / 2, CARD.height - 150);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Görsel oluşturulamadı.');

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
