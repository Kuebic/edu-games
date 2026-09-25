// Traffic Jam's level select: its Chapters as Groups, with the mute button in the header.

import { showLevelSelect, type LevelSelectGame, type LevelSelectView } from '@shared/level-select';
import { CHAPTERS, LEVELS_PER_CHAPTER } from './chapters';
import { ICONS, iconButton } from './icons';
import { chapterColor } from './play';
import { clearedIn, type Progress } from './progress';
import { chapterIcon } from './view';

export interface SelectHooks {
  progress(): Progress;
  toggleMute(): void;
  /** Play a Level, numbered across all Chapters from 0. */
  open(index: number): void;
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
        levels: clearedIn(hooks.progress(), c).map((done) => ({ done })),
      })),
    tools() {
      const picture = () => (hooks.progress().muted ? ICONS.soundOff : ICONS.soundOn);
      const mute = iconButton('site-tool', picture(), 'Sound', () => {
        hooks.toggleMute();
        mute.innerHTML = picture();
      });
      return [mute];
    },
    play: (c, i) => hooks.open(c * LEVELS_PER_CHAPTER + i),
  };
}

/** The Chapter list, or with `chapter` (from 0) that Chapter's Levels. */
export function showSelect(root: HTMLElement, hooks: SelectHooks, chapter?: number): LevelSelectView {
  return showLevelSelect(root, trafficJamSelect(hooks), chapter);
}
