import { registerOffline } from '@shared/pwa';
import { LEVELS } from './levels';
import { showPicker } from './picker';
import { showPlay } from './play';
import { loadProgress, saveProgress, withSolved } from './progress';
import { setMuted } from './sound';
import './style.css';

registerOffline();

const app = document.querySelector<HTMLElement>('#app')!;
let progress = loadProgress();
let leave: () => void = () => {};
setMuted(progress.muted);

function openPicker(): void {
  leave();
  leave = showPicker(app, progress, openLevel);
}

function openLevel(index: number): void {
  leave();
  leave = showPlay(app, index, {
    muted: () => progress.muted,
    toggleMute() {
      progress = { ...progress, muted: !progress.muted };
      saveProgress(progress);
      setMuted(progress.muted);
    },
    solved() {
      progress = withSolved(progress, index);
      saveProgress(progress);
    },
    next: () => (index + 1 < LEVELS.length ? openLevel(index + 1) : openPicker()),
    home: openPicker,
  });
}

openPicker();
