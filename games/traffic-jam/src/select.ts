// Traffic Jam's level select: its Chapters as Groups, with the gear in the header.

import type { GrownUpCorner } from '@shared/grownup';
import { showLevelSelect, type LevelSelectGame, type LevelSelectView } from '@shared/level-select';
import { CHAPTERS, LEVELS_PER_CHAPTER } from './chapters';
import { chapterColor } from './play';
import type { Progress } from './progress';
import { chapterIcon } from './view';

export interface SelectHooks {
  progress: Progress;
  /** Play a Level, numbered across all Chapters from 0. */
  open(index: number): void;
  corner: GrownUpCorner;
}

/** Traffic Jam as the level select sees it. Its saves number Levels across Chapters: Chapter c, Level i is c·8 + i. */
export function trafficJamSelect(hooks: SelectHooks): LevelSelectGame {
  return {
    title: 'Traffic Jam',
    groups: () =>
      CHAPTERS.map((spec, c) => ({
        name: spec.name,
        colour: chapterColor(c),
        badge: () => chapterIcon(c),
        levels: hooks.progress.marks(c),
      })),
    tools: () => [hooks.corner.gear()],
    play: (c, i) => hooks.open(c * LEVELS_PER_CHAPTER + i),
  };
}

/** The Chapter list, or with `chapter` (from 0) that Chapter's Levels. */
export function showSelect(root: HTMLElement, hooks: SelectHooks, chapter?: number): LevelSelectView {
  return showLevelSelect(root, trafficJamSelect(hooks), chapter);
}
