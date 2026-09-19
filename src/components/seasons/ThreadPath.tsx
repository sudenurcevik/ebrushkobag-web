/**
 * The yarn strand that carries one season into the next (plan §11).
 *
 * It is a single loose path with a couple of gentle sags — it should read as a
 * length of yarn lying across the frame, not as a decorative squiggle. Drawing
 * is `stroke-dashoffset` driven by scroll progress.
 *
 * Deliberately NOT `vector-effect: non-scaling-stroke`. That keeps the stroke a
 * constant pixel width, but it moves the dash pattern into screen space as well
 * — so a dash array measured with `getTotalLength()` (user units) no longer
 * spans the path, and the strand can never finish drawing. Letting the stroke
 * scale with the viewBox keeps dash and path in the same coordinate system, and
 * `slice` scaling lands the width between 14px and 21px across every screen
 * this site sees, which is what §37 asks for anyway.
 *
 * Two more things it deliberately is not:
 *
 * - No SVG filter. This carried an `feDropShadow`, which made every frame of
 *   the dash animation re-run a blur over a full-screen surface. The depth now
 *   comes from an offset dark stroke drawn underneath, which costs one more
 *   path and no filter.
 * - No CSS variable for the colour. The transition stacks two of these, one per
 *   palette, and cross-fades them, so the strand changes season without ever
 *   repainting for a colour change.
 */
const STRAND =
  'M -40 250 C 150 130, 250 420, 420 330 C 560 255, 545 95, 660 150 ' +
  'C 775 205, 700 400, 830 395 C 930 399, 980 300, 1060 250';

export function ThreadPath({
  className = '',
  color,
}: {
  className?: string;
  color: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 1000 620"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      aria-hidden
    >
      {/* Depth, as a stroke rather than a filter. Drawn first, offset down. */}
      <path
        d={STRAND}
        transform="translate(0 7)"
        stroke="#000000"
        strokeOpacity="0.16"
        strokeWidth="12"
        strokeLinecap="round"
        data-thread=""
      />
      <path d={STRAND} stroke={color} strokeWidth="11" strokeLinecap="round" data-thread="strand" />
      {/* Fibre highlight, offset slightly so the strand reads as round. */}
      <path
        d={STRAND}
        transform="translate(0 -4)"
        stroke="#FFFFFF"
        strokeOpacity="0.32"
        strokeWidth="2.4"
        strokeLinecap="round"
        data-thread=""
      />
    </svg>
  );
}
