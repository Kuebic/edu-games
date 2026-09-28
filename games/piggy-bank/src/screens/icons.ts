// Inline SVG, so the pigs look the same on every phone. The money itself is photos (pictures.ts).

/** Back to Practice. The house picture means only the Hub. */
export const backIcon =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5 7 12l7 7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/** The Next button's arrow. */
export const nextIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4.5 19 12 8 19.5Z" fill="currentColor"/></svg>';

/** The speaker in the pig's bubble: tap to hear the Ask again. */
export const speakerIcon =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4Z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

const INK = '#d9588f';
const BODY = 'M58 26c26 0 44 13 44 30s-18 30-44 30S14 73 14 56s18-30 44-30Z';

/**
 * The pig's back half: its far legs and the inside of its see-through body. Coins that went in lie on
 * top of this, and pigFront covers them with a pink film, so they show through.
 */
export const pigBack =
  '<svg viewBox="0 0 120 100" aria-hidden="true">' +
  `<rect x="32" y="74" width="12" height="18" rx="5" fill="#f38bb3"/><rect x="74" y="74" width="12" height="18" rx="5" fill="#f38bb3"/>` +
  `<path d="${BODY}" fill="#fff0f5"/>` +
  '</svg>';

/** The pig's front half: the pink film, its outline and shine, the slot on its back, its head and tail. */
export const pigFront =
  '<svg viewBox="0 0 120 100" aria-hidden="true">' +
  `<path d="${BODY}" fill="#ff8fbb" fill-opacity="0.3" stroke="${INK}" stroke-width="3"/>` +
  '<path d="M27 42c6-8 16-11 26-11" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.8"/>' +
  `<path d="M15 52c-7 0-9-7-5-9s5 4 1 5" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>` +
  '<rect x="46" y="24" width="24" height="6" rx="3" fill="#7a2e4f"/>' +
  `<path d="M88 34 94 19 103 33Z" fill="#ff9cc0" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>` +
  `<circle cx="97" cy="50" r="16" fill="#ffb8d2" stroke="${INK}" stroke-width="3"/>` +
  '<circle cx="99" cy="45" r="2.7" fill="#2b3445"/>' +
  `<ellipse cx="111" cy="54" rx="7" ry="8.5" fill="#ff9cc0" stroke="${INK}" stroke-width="2.5"/>` +
  '<ellipse cx="109" cy="52" rx="1.4" ry="2.4" fill="#a33d69"/><ellipse cx="113.5" cy="52" rx="1.4" ry="2.4" fill="#a33d69"/>' +
  '</svg>';

/** Practice's badge (unused with one Topic, but every Topic has one): a pig's face, drawn white. */
export const moneyBadge =
  '<svg viewBox="0 0 48 48" aria-hidden="true"><g fill="currentColor"><circle cx="24" cy="26" r="16"/><path d="M11 16 14 5l8 8ZM37 16 34 5l-8 8Z"/></g></svg>';
