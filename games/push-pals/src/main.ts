import { startGame } from '@shared/shell';
import { grownUpCorner } from '@shared/grownup';
import type { LevelSelectView } from '@shared/level-select';
import { FIRST } from './levels';
import { showPlay } from './play';
import { chapterOf, levelAfter, loadProgress } from './progress';
import { showSelect, type SelectHooks } from './select';
import './style.css';

const { root: app, storage } = startGame('push-pals');
const progress = loadProgress(storage);
let leave: () => void = () => {};
/** The level select while it's up, so the Grown-up Corner can redraw it. */
let select: LevelSelectView | undefined;

const corner = grownUpCorner(app, progress, { closed: () => select?.redraw() });
const hooks: SelectHooks = { progress, open: openLevel, corner };

/** The Chapter list, or with `chapter` that Chapter's Levels. */
function openLevels(chapter?: number): void {
  leave();
  const view = showSelect(app, hooks, chapter);
  select = view;
  leave = view.leave;
}

function openLevel(index: number): void {
  leave();
  select = undefined;
  const chapter = chapterOf(index);
  leave = showPlay(app, index, {
    progress,
    corner,
    solved: () => void progress.finish(chapter, index - FIRST[chapter]!),
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
