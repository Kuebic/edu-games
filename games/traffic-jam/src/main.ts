import { startGame } from '@shared/shell';
import { grownUpCorner } from '@shared/grownup';
import type { LevelSelectView } from '@shared/level-select';
import { LEVELS_PER_CHAPTER } from './chapters';
import { showPlay } from './play';
import { levelAfter, loadProgress } from './progress';
import { showSelect, type SelectHooks } from './select';
import './style.css';

const { root, storage } = startGame('traffic-jam');
const progress = loadProgress(storage);
let leave: () => void = () => {};
/** The level select while it's up, so the Grown-up Corner can redraw it. */
let select: LevelSelectView | undefined;

const corner = grownUpCorner(root, progress, { closed: () => select?.redraw() });
const hooks: SelectHooks = { progress, open: openLevel, corner };

/** The Chapter list, or with `chapter` that Chapter's Levels. */
function openLevels(chapter?: number): void {
  leave();
  const view = showSelect(root, hooks, chapter);
  select = view;
  leave = view.leave;
}

function openLevel(index: number): void {
  leave();
  select = undefined;
  const chapter = Math.floor(index / LEVELS_PER_CHAPTER);
  leave = showPlay(root, index, {
    corner,
    cleared: () => void progress.finish(chapter, index % LEVELS_PER_CHAPTER),
    next() {
      // After the very last Level, Next goes to its Chapter.
      const after = levelAfter(progress, index);
      if (after === undefined) openLevels(chapter);
      else openLevel(after);
    },
    levels: () => openLevels(chapter),
  });
}

openLevels();
