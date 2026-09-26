import { startGame } from '@shared/shell';
import { setSoundEnabled } from '@shared/sound';
import { LEVELS_PER_CHAPTER } from './chapters';
import { showPlay } from './play';
import { levelAfter, loadProgress, saveProgress, withCleared } from './progress';
import { showSelect, type SelectHooks } from './select';
import './style.css';

const { root, storage } = startGame('traffic-jam');
let progress = loadProgress(storage);
let leave: () => void = () => {};
setSoundEnabled(!progress.muted);

function toggleMute(): void {
  progress = { ...progress, muted: !progress.muted };
  saveProgress(progress, storage);
  setSoundEnabled(!progress.muted);
}

const select: SelectHooks = { progress: () => progress, toggleMute, open: openLevel };

/** The Chapter list, or with `chapter` that Chapter's Levels. */
function openLevels(chapter?: number): void {
  leave();
  leave = showSelect(root, select, chapter).leave;
}

function openLevel(index: number): void {
  leave();
  const chapter = Math.floor(index / LEVELS_PER_CHAPTER);
  leave = showPlay(root, index, {
    muted: () => progress.muted,
    toggleMute,
    cleared() {
      progress = withCleared(progress, index);
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
