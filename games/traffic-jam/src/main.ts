import { startGame } from '@shared/shell';
import { LEVELS_PER_CHAPTER } from './chapters';
import { LEVELS } from './levels';
import { showPicker } from './picker';
import { showPlay } from './play';
import { loadProgress, saveProgress, withCleared } from './progress';
import { setMuted, unlockAudio } from './sound';
import './style.css';

const { root, storage } = startGame('traffic-jam', { unlock: unlockAudio });
const total = LEVELS.length * LEVELS_PER_CHAPTER;
let progress = loadProgress(storage);
let leave: () => void = () => {};
setMuted(progress.muted);

function toggleMute(): void {
  progress = { ...progress, muted: !progress.muted };
  saveProgress(progress, storage);
  setMuted(progress.muted);
}

function openLevels(): void {
  leave();
  leave = showPicker(root, progress, { open: openLevel, toggleMute });
}

function openLevel(index: number): void {
  leave();
  leave = showPlay(root, index, {
    muted: () => progress.muted,
    toggleMute,
    cleared() {
      progress = withCleared(progress, index);
      saveProgress(progress, storage);
    },
    next: () => (index + 1 < total ? openLevel(index + 1) : openLevels()),
    levels: openLevels,
  });
}

openLevels();
