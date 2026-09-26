// The level select: the Box list, with the two Boxes as Groups of Rounds, and the gear.

import { showLevelSelect, type LevelSelectGame, type LevelSelectView } from '@shared/level-select';
import type { App } from '../app';
import { BOXES, type BoxKind } from '../rounds';

/** One colour per Box: Numbers in the Math Shelf's orange, Letters in the Reading Shelf's violet. */
export const BOX_COLOURS: Readonly<Record<BoxKind, string>> = { number: '#ff8a3d', letter: '#7a6cf0' };

const BEAN = (cx: number, cy: number) => `<ellipse cx="${cx}" cy="${cy}" rx="6.5" ry="4.5" transform="rotate(-15 ${cx} ${cy})"/>`;

/** A Box's badge, drawn white: a 3 over three beans for Numbers, an A over a small a for Letters. */
export function boxBadge(kind: BoxKind): string {
  const text = (body: string, y: number, size: number) =>
    `<text x="24" y="${y}" font-size="${size}" font-weight="900" text-anchor="middle" fill="currentColor">${body}</text>`;
  const body =
    kind === 'number'
      ? text('3', 27, 28) + `<g fill="currentColor">${BEAN(10, 39)}${BEAN(24, 39)}${BEAN(38, 39)}</g>`
      : text('A', 30, 30) + text('a', 44, 15);
  return `<svg viewBox="0 0 48 48" aria-hidden="true">${body}</svg>`;
}

/** Find It as the level select sees it: Boxes and Rounds count from 0 there, as here. */
export function findItSelect(app: App): LevelSelectGame {
  return {
    title: 'Find It',
    levelWord: 'Round',
    groups: () =>
      BOXES.map((box, b) => ({
        name: box.name,
        colour: BOX_COLOURS[box.kind],
        badge: () => boxBadge(box.kind),
        levels: app.progress.marks(b),
      })),
    everyLevelOpen: () => app.progress.settings.everyLevelOpen,
    tools: () => [app.corner.gear()],
    play: (b, round) => app.play(b, round),
  };
}

/** The Box list, or with `box` that Box's Rounds. */
export function showSelect(app: App, box?: number): LevelSelectView {
  return showLevelSelect(app.root, findItSelect(app), box);
}
