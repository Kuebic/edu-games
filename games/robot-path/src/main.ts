import { startGame } from '@shared/shell';
import { showHome } from './home';
import { showParent } from './parent';
import { showPlay } from './play';
import { loadProgress, saveProgress, type Progress } from './progress';
import { setMuted, setSkinSound, unlockAudio } from './sound';
import { setVoiceEnabled, unlockSpeech } from './speech';
import './style.css';

// Browsers only start audio and speech after a touch.
let spoke = false;
const { root, storage } = startGame('robot-path', {
  unlock() {
    unlockAudio();
    if (!spoke) unlockSpeech();
    spoke = true;
  },
});
let progress = loadProgress(storage);
let leave: () => void = () => {};
let onHome = true;

function apply(): void {
  setMuted(!progress.settings.sound);
  setVoiceEnabled(progress.settings.voice);
  setSkinSound(progress.skin);
}

function update(next: Progress): void {
  progress = next;
  saveProgress(progress, storage);
  apply();
}

function openHome(): void {
  leave();
  onHome = true;
  leave = showHome(root, {
    progress: () => progress,
    skin(skin) {
      update({ ...progress, skin });
      openHome();
    },
    open: openLevel,
    parent: openParent,
  });
}

function openLevel(world: number, index: number): void {
  leave();
  onHome = false;
  leave = showPlay(root, world, index, { progress: () => progress, update, home: openHome, open: openLevel, parent: openParent });
}

function openParent(): void {
  showParent(root.firstElementChild as HTMLElement, {
    progress: () => progress,
    update,
    // Unlocks and resets show on the map straight away.
    close: () => onHome && openHome(),
  });
}

apply();
openHome();
