import { registerOffline } from '../../shared/pwa';
import type { App } from './app';
import { showHome } from './home';
import { showPack } from './pack-screen';
import { showParent } from './parent';
import { showPlay, type Puzzle } from './play';
import { loadProgress, saveProgress, takePoolPuzzle } from './progress';
import { setSoundEnabled, unlockAudio } from './sound';
import { hush, setVoiceEnabled } from './speech';
import { skinById } from './skins';
import './style.css';

const root = document.querySelector<HTMLElement>('#app')!;
const progress = loadProgress();
setSoundEnabled(progress.settings.sound);
setVoiceEnabled(progress.settings.voice);

let leave: () => void = () => {};
/** Shows the current screen again, e.g. after the grown-up menu changes what's open. */
let again: () => void = () => app.home();

function show(render: () => () => void, redo: () => void): void {
  leave();
  hush();
  again = redo;
  const skin = skinById(progress.skin);
  const page = document.documentElement.style;
  page.setProperty('--sky', skin.sky);
  page.setProperty('--sky-dark', skin.skyDark);
  page.setProperty('--ink', skin.ink);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', skin.sky);
  leave = render();
}

function play(puzzle: Puzzle): void {
  show(() => showPlay(app, puzzle), () => play(puzzle));
}

const app: App = {
  root,
  progress,
  save: () => saveProgress(progress),
  skin: () => skinById(progress.skin),
  home: () => show(() => showHome(app), () => app.home()),
  pack: (pack) => show(() => showPack(app, pack), () => app.pack(pack)),
  level: (level) => play({ kind: 'level', level }),
  pool(pack) {
    // The Pools only download when first asked for.
    void import('./pools').then(({ POOLS }) => {
      const puzzle = takePoolPuzzle(progress, pack, POOLS[pack - 1]!);
      saveProgress(progress);
      play({ kind: 'pool', pack, puzzle });
    });
  },
  parent: () => showParent(app, () => again()),
};

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

app.home();
if (import.meta.env.PROD) registerOffline();
