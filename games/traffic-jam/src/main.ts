import { startGame } from '@shared/shell';
import { LEVELS_PER_CHAPTER } from './chapters';
import { showPlay } from './play';
import { levelAfter, loadProgress } from './progress';
import { showSelect, type SelectHooks } from './select';
import './style.css';

const { root, storage } = startGame('traffic-jam');
const progress = loadProgress(storage);
let leave: () => void = () => {};

function toggleMute(): void {
  progress.set('sound', !progress.settings.sound);
}

const select: SelectHooks = { progress, toggleMute, open: openLevel };

/** The Chapter list, or with `chapter` that Chapter's Levels. */
function openLevels(chapter?: number): void {
  leave();
  leave = showSelect(root, select, chapter).leave;
}

function openLevel(index: number): void {
  leave();
  const chapter = Math.floor(index / LEVELS_PER_CHAPTER);
  leave = showPlay(root, index, {
    muted: () => !progress.settings.sound,
    toggleMute,
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
