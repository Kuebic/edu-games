// Inline SVG so pictures look identical on every phone (emoji arrows don't).

import { ANGLE, type Arrow } from '../trips';

/** Back to Practice. The house picture means only the Hub. */
export const backIcon =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5 7 12l7 7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/** The Arrow shape pointing up in a 48-box: a shaft and a head. */
const SHAFT = 'M24 40V20';
const HEAD = '10,24 24,7 38,24';

/** The Arrow: white with a dark edge, like Traffic Jam's, turned to point its way. */
export function arrowSvg(arrow: Arrow): string {
  return (
    `<svg viewBox="0 0 48 48" aria-hidden="true"><g transform="rotate(${ANGLE[arrow]} 24 24)" stroke-linejoin="round" stroke-linecap="round">` +
    `<path d="${SHAFT}" stroke="#1f2937" stroke-width="15" fill="none"/>` +
    `<polygon points="${HEAD}" fill="#1f2937" stroke="#1f2937" stroke-width="7"/>` +
    `<path d="${SHAFT}" stroke="#fff" stroke-width="8" fill="none"/>` +
    `<polygon points="${HEAD}" fill="#fff"/>` +
    '</g></svg>'
  );
}

/** Traffic Jam's car from above, facing up: red, with its windows and headlights. */
export const carSvg =
  '<svg viewBox="0 0 48 48" aria-hidden="true">' +
  '<rect x="13" y="5" width="24" height="40" rx="8" fill="#00000030"/>' +
  '<rect x="12" y="3" width="24" height="40" rx="8" fill="#ef4444"/>' +
  '<rect x="16" y="13" width="16" height="6" rx="2" fill="#d6ecff"/>' +
  '<rect x="16.5" y="33" width="15" height="4" rx="2" fill="#d6ecff"/>' +
  '<circle cx="17" cy="5.5" r="2.4" fill="#fff7b0"/><circle cx="31" cy="5.5" r="2.4" fill="#fff7b0"/>' +
  '</svg>';

/** The Topic's badge, drawn white: an Arrow pointing right. Practice has one Topic, so it shows only to screen readers. */
export const badge =
  '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 24h26M24 12l12 12-12 12" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
