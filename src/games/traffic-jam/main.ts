import { registerOffline } from '../../shared/pwa';
import { LEVELS_PER_CHAPTER } from './chapters';
import { LEVELS } from './levels';
import { showPicker } from './picker';
import { showPlay } from './play';
import { loadProgress, saveProgress, withCleared } from './progress';
import { setMuted, unlockAudio } from './sound';
import './style.css';

const root = document.querySelector<HTMLElement>('#app')!;
const total = LEVELS.length * LEVELS_PER_CHAPTER;
let progress = loadProgress();
let leave: () => void = () => {};
setMuted(progress.muted);

function toggleMute(): void {
  progress = { ...progress, muted: !progress.muted };
  saveProgress(progress);
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
      saveProgress(progress);
    },
    next: () => (index + 1 < total ? openLevel(index + 1) : openLevels()),
    levels: openLevels,
  });
}

// Browsers only start audio after a touch.
document.addEventListener('pointerdown', unlockAudio, { capture: true });
// Keep stray little fingers from zooming, selecting, or opening menus.
document.addEventListener('contextmenu', (event) => event.preventDefault());
for (const type of ['gesturestart', 'gesturechange']) {
  document.addEventListener(type, (event) => event.preventDefault(), { passive: false });
}
document.addEventListener(
  'touchmove',
  (event) => {
    if (event.touches.length > 1) event.preventDefault();
  },
  { passive: false },
);

openLevels();
if (import.meta.env.PROD) registerOffline();
