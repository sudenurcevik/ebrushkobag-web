'use client';

import { forwardRef, useEffect, useMemo, useState } from 'react';
import type { BagSelection } from '@/data/types';
import { getDetail, getHandle, getModel, getYarn } from '@/lib/catalog';
import { buildPreviewLayers, type PreviewLayer } from '@/lib/preview';
import { BagVector } from './BagVector';

type SlotId = 'shadow' | 'bodyTint' | 'detail' | 'handle' | 'highlight';

const SLOT_ORDER: SlotId[] = ['shadow', 'bodyTint', 'detail', 'handle', 'highlight'];

const VECTOR_ROLE: Record<SlotId, 'shadow' | 'body' | 'detail' | 'handle' | 'highlight'> = {
  shadow: 'shadow',
  bodyTint: 'body',
  detail: 'detail',
  handle: 'handle',
  highlight: 'highlight',
};

const slotOf = (layer: PreviewLayer): SlotId => {
  if (layer.role === 'bodyTexture' || layer.role === 'bodyPrerendered') return 'bodyTint';
  return layer.role as SlotId;
};

/**
 * A photographed layer that crossfades without ever showing a gap: the outgoing
 * file stays on screen until the incoming one has decoded, then fades under it.
 * This is why option changes have no flash, even on a cold cache.
 */
function CrossfadeLayer({ src }: { src: string }) {
  const [shown, setShown] = useState(src);
  const [incoming, setIncoming] = useState<string | null>(null);
  const [incomingReady, setIncomingReady] = useState(false);

  useEffect(() => {
    if (src === shown) {
      setIncoming(null);
      setIncomingReady(false);
      return;
    }
    setIncoming(src);
    setIncomingReady(false);
  }, [src, shown]);

  useEffect(() => {
    if (!incoming || !incomingReady) return;
    const timer = window.setTimeout(() => setShown(incoming), 260);
    return () => window.clearTimeout(timer);
  }, [incoming, incomingReady]);

  return (
    <>
      <img
        key={shown}
        src={shown}
        alt=""
        className="absolute inset-0 h-full w-full object-contain"
        decoding="async"
        draggable={false}
      />
      {incoming && (
        <img
          key={incoming}
          src={incoming}
          alt=""
          className="absolute inset-0 h-full w-full object-contain transition-opacity duration-[260ms] ease-editorial"
          style={{ opacity: incomingReady ? 1 : 0 }}
          decoding="async"
          draggable={false}
          onLoad={() => setIncomingReady(true)}
        />
      )}
    </>
  );
}

export interface BagPreviewProps {
  selection: BagSelection;
  /** Which configurator assets exist on disk, resolved on the server. */
  presence: Record<string, boolean>;
  className?: string;
  label: string;
}

/**
 * Composites the bag from its layer stack: photographed layers where they exist,
 * vector on identical geometry everywhere else.
 *
 * Free of any JS animation loop — photographed layers crossfade with a CSS
 * transition and vector layers re-colour through CSS transitions on their own
 * paint. Changing an option costs a re-render and nothing else (plan §35).
 */
export const BagPreview = forwardRef<HTMLDivElement, BagPreviewProps>(function BagPreview(
  { selection, presence, className = '', label },
  ref,
) {
  const model = getModel(selection.model);
  const body = getYarn(selection.body);
  const detail = getDetail(selection.detail);
  const handle = getHandle(selection.handle);

  const layers = useMemo(() => buildPreviewLayers(selection), [selection]);

  const slots = useMemo(() => {
    const grouped = new Map<SlotId, PreviewLayer[]>();
    for (const layer of layers) {
      const slot = slotOf(layer);
      grouped.set(slot, [...(grouped.get(slot) ?? []), layer]);
    }
    return grouped;
  }, [layers]);

  const has = (src?: string | null) => Boolean(src && presence[src]);

  return (
    <div
      ref={ref}
      className={`relative aspect-square w-full select-none ${className}`}
      role="img"
      aria-label={label}
    >
      {SLOT_ORDER.map((slot) => {
        const slotLayers = slots.get(slot);
        if (!slotLayers || slotLayers.length === 0) return null;

        const usePhotography = slotLayers.every(
          (l) => (l.src ? has(l.src) : true) && (l.maskSrc ? has(l.maskSrc) : true),
        );

        return (
          <div key={slot} className="absolute inset-0" data-export-role={slot}>
            {usePhotography ? (
              slotLayers.map((layer) => (
                <div
                  key={layer.role}
                  className="absolute inset-0"
                  style={{ mixBlendMode: layer.blend, opacity: layer.opacity }}
                >
                  {layer.src ? (
                    <CrossfadeLayer src={layer.src} />
                  ) : (
                    <div
                      className="absolute inset-0 transition-colors duration-[320ms] ease-editorial"
                      style={{
                        backgroundColor: layer.color,
                        WebkitMaskImage: `url(${layer.maskSrc})`,
                        maskImage: `url(${layer.maskSrc})`,
                        WebkitMaskSize: 'contain',
                        maskSize: 'contain',
                        WebkitMaskRepeat: 'no-repeat',
                        maskRepeat: 'no-repeat',
                        WebkitMaskPosition: 'center',
                        maskPosition: 'center',
                      }}
                    />
                  )}
                </div>
              ))
            ) : (
              <BagVector
                className="absolute inset-0 h-full w-full"
                model={model}
                body={body}
                detail={detail}
                handle={handle}
                roles={{
                  shadow: false,
                  body: false,
                  detail: false,
                  handle: false,
                  highlight: false,
                  [VECTOR_ROLE[slot]]: true,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
});

/**
 * Warms the layers the visitor is most likely to reach next, at idle, once the
 * configurator is on screen — never on first load (plan §35).
 */
export function useLayerPreload(paths: string[], presence: Record<string, boolean>, enabled: boolean) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const targets = paths.filter((p) => presence[p]);
    if (targets.length === 0) return;

    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      for (const path of targets) {
        const img = new Image();
        img.decoding = 'async';
        img.src = path;
      }
    };

    const idle = window.requestIdleCallback?.(run, { timeout: 2500 });
    const timer = idle === undefined ? window.setTimeout(run, 600) : undefined;

    return () => {
      cancelled = true;
      if (idle !== undefined) window.cancelIdleCallback?.(idle);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [paths, presence, enabled]);
}
