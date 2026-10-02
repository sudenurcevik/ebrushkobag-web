/**
 * Per-frame state of the descent, written by CameraRig and read by the cards,
 * the name and the seasonal effects in the same frame. Kept outside React:
 * it changes every frame.
 */
export const reel = {
  /** How far the opening name has unravelled into the spine (0–1). */
  intro: 0,
  /** Which card is at the front, as a continuous value (2.5 = halfway 2 → 3). */
  position: 0,
  /** The camera's angle around the yarn (radians) and the height it looks at. */
  angle: 0,
  y: 0,
  /** How fast the descent is moving, in cards per second (signed). */
  speed: 0,
  /**
   * When the chapter overlay's animation began (performance.now(), ms), or
   * -1 when none is playing, and its length (s): ChapterBlur follows it.
   */
  chapterStart: -1,
  chapterLength: 4,
};
