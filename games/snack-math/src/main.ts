import { startGame } from '@shared/shell';
import { unlockVoice } from '@shared/voice';
import './style.css';
import type { App } from './app';
import { loadProgress } from './progress';
import { grownupScreen } from './screens/grownup';
import { playScreen } from './screens/play';
import { showSelect } from './screens/select';
import { stickersScreen } from './screens/stickers';

// Browsers only start the Voice after a touch.
const { root, storage } = startGame('snack-math', { unlock: unlockVoice });
let cleanup: (() => void) | void;

function show(screen: () => (() => void) | void): void {
  cleanup?.();
  root.replaceChildren();
  cleanup = screen();
}

const app: App = {
  root,
  progress: loadProgress(storage),
  stages: (stage) => show(() => showSelect(app, stage).leave),
  play: (stage, round) => show(() => playScreen(app, stage, round)),
  stickers: () => show(() => stickersScreen(app)),
  grownup: (stage) => show(() => grownupScreen(app, stage)),
};

app.stages();
