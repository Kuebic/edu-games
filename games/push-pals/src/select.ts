// Push Pals' level select: its Chapters as Groups, each with its own colour and its boxes as the badge.

import type { GrownUpCorner } from '@shared/grownup';
import { showLevelSelect, type LevelSelectGame, type LevelSelectView } from '@shared/level-select';
import { CHAPTERS, FIRST } from './levels';
import type { Progress } from './progress';
import { play } from './sound';

/**
 * One colour per Chapter, easiest first: round the colour wheel from the grass green to the red of the
 * Pal's shirt, missing out the sky blue of the page and the crates' orange, then darker for the last two.
 */
export const CHAPTER_COLOURS = [
  '#27ae60',
  '#0d9488',
  '#3a5bd0',
  '#6c5ce7',
  '#8e44ad',
  '#c4379a',
  '#e0457b',
  '#e74c3c',
  '#a93226',
  '#34495e',
] as const;

export interface SelectHooks {
  progress: Progress;
  /** Play a Level, numbered across all Chapters from 0. */
  open(index: number): void;
  corner: GrownUpCorner;
}

/** A Chapter's badge: its 2, 3 or 4 crates, side by side, stacked, or in a square. */
function crates(boxes: number): string {
  return `<span class="pp-crates pp-crates-${boxes}">${'<i></i>'.repeat(boxes)}</span>`;
}

/** Push Pals as the level select sees it. Its saves number Levels across Chapters: Chapter c, Level i is FIRST[c] + i. */
export function pushPalsSelect(hooks: SelectHooks): LevelSelectGame {
  return {
    title: 'Push Pals',
    groups: () =>
      CHAPTERS.map((chapter, c) => ({
        name: `Chapter ${c + 1}, ${chapter.boxes} boxes`,
        colour: CHAPTER_COLOURS[c % CHAPTER_COLOURS.length]!,
        badge: () => crates(chapter.boxes),
        levels: hooks.progress.marks(c),
      })),
    tools: () => [hooks.corner.gear()],
    play(c, i) {
      play('tap');
      hooks.open(FIRST[c]! + i);
    },
  };
}

/** The Chapter list, or with `chapter` (from 0) that Chapter's Levels. */
export function showSelect(root: HTMLElement, hooks: SelectHooks, chapter?: number): LevelSelectView {
  return showLevelSelect(root, pushPalsSelect(hooks), chapter);
}
