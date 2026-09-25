import { registerOffline } from '../../shared/pwa';
import { showHome } from './home';
import { showParent } from './parent';
import { showPlay } from './play';
import { loadProgress, saveProgress, type Progress } from './progress';
import { setMuted, setSkinSound, unlockAudio } from './sound';
import { setVoiceEnabled, unlockSpeech } from './speech';
import './style.css';

const root = document.querySelector<HTMLElement>('#app')!;
let progress = loadProgress();
let leave: () => void = () => {};
let onHome = true;

function apply(): void {
  setMuted(!progress.settings.sound);
  setVoiceEnabled(progress.settings.voice);
  setSkinSound(progress.skin);
}

function update(next: Progress): void {
  progress = next;
  saveProgress(progress);
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

// Browsers only start audio and speech after a touch.
let unlocked = false;
document.addEventListener(
  'pointerdown',
  () => {
    unlockAudio();
    if (!unlocked) unlockSpeech();
    unlocked = true;
  },
  { capture: true },
);
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

apply();
openHome();
if (import.meta.env.PROD) registerOffline();
