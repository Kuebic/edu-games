import { startGame } from '@shared/shell';
import { setSoundEnabled } from '@shared/sound';
import { setVoiceEnabled, unlockVoice } from '@shared/voice';
import './style.css';
import type { App } from './app';
import { loadSave, writeSave } from './progress';
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
  save: loadSave(storage),
  persist() {
    writeSave(app.save, storage);
  },
  stages: (stage) => show(() => showSelect(app, stage).leave),
  play: (stage, round) => show(() => playScreen(app, stage, round)),
  stickers: () => show(() => stickersScreen(app)),
  grownup: (stage) => show(() => grownupScreen(app, stage)),
};

setVoiceEnabled(app.save.voice);
setSoundEnabled(app.save.sound);

app.stages();
