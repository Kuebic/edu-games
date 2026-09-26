import { startGame } from '@shared/shell';
import { setSoundEnabled } from '@shared/sound';
import { showPlay } from './play';
import { chapterOf, levelAfter, loadProgress, saveProgress, withSolved } from './progress';
import { showSelect, type SelectHooks } from './select';
import './style.css';

const { root: app, storage } = startGame('push-pals');
let progress = loadProgress(storage);
let leave: () => void = () => {};
setSoundEnabled(!progress.muted);

const select: SelectHooks = { progress: () => progress, open: openLevel };

/** The Chapter list, or with `chapter` that Chapter's Levels. */
function openLevels(chapter?: number): void {
  leave();
  leave = showSelect(app, select, chapter).leave;
}

function openLevel(index: number): void {
  leave();
  const chapter = chapterOf(index);
  leave = showPlay(app, index, {
    muted: () => progress.muted,
    toggleMute() {
      progress = { ...progress, muted: !progress.muted };
      saveProgress(progress, storage);
      setSoundEnabled(!progress.muted);
    },
    solved() {
      progress = withSolved(progress, index);
      saveProgress(progress, storage);
    },
    next() {
      // After the very last Level, Next goes to its Chapter.
      const after = levelAfter(index);
      if (after === undefined) openLevels(chapter);
      else openLevel(after);
    },
    levels: () => openLevels(chapter),
  });
}

openLevels();
