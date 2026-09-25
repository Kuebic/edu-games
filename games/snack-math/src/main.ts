import { startGame } from '@shared/shell';
import './style.css';
import type { App } from './app';
import { loadSave, writeSave } from './progress';
import { grownupScreen } from './screens/grownup';
import { playScreen } from './screens/play';
import { showSelect } from './screens/select';
import { stickersScreen } from './screens/stickers';
import { setSoundEnabled } from './sfx';
import { hush, setVoiceEnabled } from './speech';

const { root, storage } = startGame('snack-math');
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
  home: (stage) => show(() => showSelect(app, stage).leave),
  play: (stage, round) => show(() => playScreen(app, stage, round)),
  stickers: () => show(() => stickersScreen(app)),
  grownup: () => show(() => grownupScreen(app)),
};

setVoiceEnabled(app.save.voice);
setSoundEnabled(app.save.sound);

document.addEventListener('visibilitychange', () => {
  if (document.hidden) hush();
});

app.home();
