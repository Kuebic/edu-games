// Inline SVG so icons look identical on every phone (emoji arrows don't).

/** Next, the same arrow as in every Game. */
export const nextIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4.5 19 12 8 19.5Z" fill="currentColor"/></svg>';

/** Back to the Track list or a Track's Races. The house picture means only the Hub. */
export const backIcon =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5 7 12l7 7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/** Home's flag, at the end of the Track. */
export const flagIcon =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 21V3" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>' +
  '<path d="M7 4h11l-3 4 3 4H7Z" fill="#f0604d"/></svg>';

/**
 * The Spinner's face: the 1 half on the left with one dot, the 2 half on the right with two.
 * The arrow is drawn apart, so it can turn over the face.
 */
export const spinnerFace =
  '<svg viewBox="0 0 100 100" aria-hidden="true">' +
  '<path d="M50 4a46 46 0 0 0 0 92Z" fill="#ffc94a"/><path d="M50 4a46 46 0 0 1 0 92Z" fill="#8fd0ff"/>' +
  '<circle cx="50" cy="50" r="46" fill="none" stroke="#fff" stroke-width="5"/>' +
  '<path d="M50 4v92" stroke="#fff" stroke-width="4"/>' +
  '<circle cx="26" cy="50" r="8" fill="#2b3445"/>' +
  '<circle cx="74" cy="38" r="8" fill="#2b3445"/><circle cx="74" cy="62" r="8" fill="#2b3445"/></svg>';

export const spinnerArrow =
  '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 12 58 50 50 56 42 50Z" fill="#2b3445"/>' +
  '<circle cx="50" cy="50" r="7" fill="#fff" stroke="#2b3445" stroke-width="4"/></svg>';
