import { startGame } from '@shared/shell';
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

const { root, storage } = startGame('way-out', { unlock: unlockAudio });
const progress = loadProgress(storage);
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
  save: () => saveProgress(progress, storage),
  skin: () => skinById(progress.skin),
  home: () => show(() => showHome(app), () => app.home()),
  pack: (pack) => show(() => showPack(app, pack), () => app.pack(pack)),
  level: (level) => play({ kind: 'level', level }),
  pool(pack) {
    // The Pools only download when first asked for.
    void import('./pools').then(({ POOLS }) => {
      const puzzle = takePoolPuzzle(progress, pack, POOLS[pack - 1]!);
      saveProgress(progress, storage);
      play({ kind: 'pool', pack, puzzle });
    });
  },
  parent: () => showParent(app, () => again()),
};

app.home();
