const pad = (n: number) => String(n).padStart(2, '0');

const arrow =
  'px-2 py-1 text-base leading-none text-ink-soft transition duration-300 ease-editorial hover:text-ink active:translate-y-px';

/** Quiet ← 03 / 08 → — typographic, no chrome. */
export function Gallery3DControls({
  index,
  total,
  onPrev,
  onNext,
}: {
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-4">
      <button type="button" className={`${arrow} hover:-translate-x-0.5`} onClick={onPrev} aria-label="Önceki çanta">
        ←
      </button>
      <p className="min-w-[4.5rem] text-center text-micro tabular-nums text-ink-muted">
        <span className="text-ink">{pad(index + 1)}</span> / {pad(total)}
      </p>
      <button type="button" className={`${arrow} hover:translate-x-0.5`} onClick={onNext} aria-label="Sonraki çanta">
        →
      </button>
    </div>
  );
}
