const pad = (n: number) => String(n).padStart(2, '0');

function Arrow({ direction }: { direction: 'prev' | 'next' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d={direction === 'prev' ? 'M8.5 3 4.5 7l4 4' : 'M5.5 3l4 4-4 4'}
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const button =
  'grid h-9 w-9 place-items-center rounded-full text-ink-soft ring-1 ring-ink/10 transition duration-300 ease-editorial hover:bg-cream/70 hover:text-ink hover:ring-ink/20 active:translate-y-px';

export function GalleryControls({
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
    <div className="flex items-center justify-center gap-5">
      <button type="button" className={button} onClick={onPrev} aria-label="Önceki çanta">
        <Arrow direction="prev" />
      </button>
      <p className="min-w-[4.5rem] text-center text-micro tabular-nums text-ink-muted">
        <span className="text-ink">{pad(index + 1)}</span> / {pad(total)}
      </p>
      <button type="button" className={button} onClick={onNext} aria-label="Sonraki çanta">
        <Arrow direction="next" />
      </button>
    </div>
  );
}
