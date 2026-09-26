import { startGame } from '@shared/shell';
import { FIRST } from './levels';
import { showPlay } from './play';
import { chapterOf, levelAfter, loadProgress } from './progress';
import { showSelect, type SelectHooks } from './select';
import './style.css';

const { root: app, storage } = startGame('push-pals');
const progress = loadProgress(storage);
let leave: () => void = () => {};

const select: SelectHooks = { progress, open: openLevel };

/** The Chapter list, or with `chapter` that Chapter's Levels. */
function openLevels(chapter?: number): void {
  leave();
  leave = showSelect(app, select, chapter).leave;
}

function openLevel(index: number): void {
  leave();
  const chapter = chapterOf(index);
  leave = showPlay(app, index, {
    progress,
    toggleMute: () => progress.set('sound', !progress.settings.sound),
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
