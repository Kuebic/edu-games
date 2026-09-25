// The level select: the Stage list, with the Stages as Groups of four Rounds, the gear, and the Sticker Book under the list.

import { holdToActivate } from '@shared/hold';
import { showLevelSelect, type LevelSelectGame, type LevelSelectView } from '@shared/level-select';
import type { App } from '../app';
import { h } from '../dom';
import { STAGES, type Stage } from '../problems';
import { roundsDone } from '../progress';
import { unlockAudio } from '../sfx';
import { unlockSpeech } from '../speech';
import { gearIcon } from './icons';

/**
 * One colour per Stage, from the Game's own palette: adding is mint, taking away is coral, and mixed
 * is lilac. The Stages up to 10 take a deeper shade of the same colour.
 */
export const STAGE_COLOURS = ['#43b085', '#e0584a', '#9479d6', '#2a8f68', '#c2413a', '#7156c2'] as const;

const PLUS = '<path d="M15 12h18M24 3v18"/>';
const MINUS = '<path d="M15 12h18"/>';
const PLUS_MINUS = '<path d="M17.5 8.5h13M24 3v11M17.5 20.5h13" stroke-width="4.5"/>';

/**
 * A Stage's badge: its sign (+, − or ±) over a little Plate holding 5 Snacks, or the Plate's two
 * rows of 5 for the Stages up to 10. Drawn white, with the Snacks in the Stage's colour.
 */
export function stageBadge(stage: Stage, colour: string): string {
  const sign = stage.ops.length > 1 ? PLUS_MINUS : stage.ops[0] === 'add' ? PLUS : MINUS;
  const rows = stage.max > 5 ? [32.5, 40.5] : [36.5];
  const top = rows[0]! - 6;
  const plate = `<rect x="5" y="${top}" width="38" height="${rows.length * 8 + 4}" rx="6"/>`;
  const dots = rows.flatMap((y) => [10.5, 17.25, 24, 30.75, 37.5].map((x) => `<circle cx="${x}" cy="${y}" r="2.6"/>`)).join('');
  return (
    '<svg viewBox="0 0 48 48" aria-hidden="true">' +
    `<g fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round">${sign}</g>` +
    `<g fill="currentColor">${plate}</g><g fill="${colour}">${dots}</g></svg>`
  );
}

/** Sound and speech start inside a tap, on phones. */
function start(): void {
  unlockAudio();
  unlockSpeech();
}

/** Snack Math as the level select sees it: Stages and Rounds count from 0 there, as here. */
export function snackMathSelect(app: App): LevelSelectGame {
  return {
    title: 'Snack Math',
    levelWord: 'Round',
    groups: () =>
      STAGES.map((stage, s) => ({
        name: stage.label,
        colour: STAGE_COLOURS[s]!,
        badge: () => stageBadge(stage, STAGE_COLOURS[s]!),
        levels: roundsDone(app.save, s).map((done) => ({ done })),
      })),
    tools(stage) {
      const gear = h('button', { class: 'site-tool', label: 'Grown-Up Corner (press and hold)', html: gearIcon });
      holdToActivate(gear, 3000, () => app.grownup(stage));
      return [gear];
    },
    underList() {
      const count = app.save.stickers.length;
      const book = h(
        'button',
        { class: 'book-btn', label: 'Sticker Book' },
        h('span', { class: 'book-icon', text: '📒' }),
        count > 0 && h('span', { class: 'book-count', text: String(count) }),
      );
      book.addEventListener('click', () => {
        start();
        app.stickers();
      });
      return book;
    },
    play(s, round) {
      start();
      app.play(s, round);
    },
  };
}

/** The Stage list, or with `stage` that Stage's Rounds. */
export function showSelect(app: App, stage?: number): LevelSelectView {
  return showLevelSelect(app.root, snackMathSelect(app), stage);
}
