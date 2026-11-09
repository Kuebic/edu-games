// Inline SVG for Practice: a Topic's badge, drawn white on its colour, and the Board chips' little grids.

import { BOARD_COLUMNS, type Board } from '../boards';

const svg = (body: string) => `<svg viewBox="0 0 48 48" aria-hidden="true"><g fill="currentColor">${body}</g></svg>`;

/** Same: two cards the same. Colors: three discs. Kinds: a dog-ish blob with a car-ish block, two cards that differ. */
export function topicBadge(topic: 'same' | 'colors' | 'kinds'): string {
  switch (topic) {
    case 'same':
      return svg('<rect x="4" y="12" width="18" height="24" rx="4"/><rect x="26" y="12" width="18" height="24" rx="4"/><circle cx="13" cy="24" r="5" fill="#0003"/><circle cx="35" cy="24" r="5" fill="#0003"/>');
    case 'colors':
      return svg('<circle cx="14" cy="30" r="9"/><circle cx="34" cy="30" r="9"/><circle cx="24" cy="14" r="9"/>');
    case 'kinds':
      return svg(
        '<rect x="4" y="12" width="18" height="24" rx="4"/><rect x="26" y="12" width="18" height="24" rx="4"/>' +
          '<circle cx="13" cy="24" r="5" fill="#0003"/><rect x="30" y="19" width="10" height="10" rx="2" fill="#0003"/>',
      );
  }
}

/** A Board chip's text: a row of its grid as little squares, then its count, for the grown-up. */
export function boardChip(board: Board): string {
  return `${'▪'.repeat(BOARD_COLUMNS[board])} ${board}`;
}
