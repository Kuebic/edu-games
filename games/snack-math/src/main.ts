import { startGame } from '@shared/shell';
import './style.css';
import type { App, Screen, ScreenName } from './app';
import { loadSave, writeSave } from './progress';
import { grownupScreen } from './screens/grownup';
import { homeScreen } from './screens/home';
import { playScreen } from './screens/play';
import { stickersScreen } from './screens/stickers';
import { setSoundEnabled } from './sfx';
import { hush, setVoiceEnabled } from './speech';

const screens: Record<ScreenName, Screen> = {
  home: homeScreen,
  play: playScreen,
  stickers: stickersScreen,
  grownup: grownupScreen,
};

const { root, storage } = startGame('snack-math');
let cleanup: (() => void) | void;

const app: App = {
  root,
  save: loadSave(storage),
  persist() {
    writeSave(app.save, storage);
  },
  go(name) {
    cleanup?.();
    root.replaceChildren();
    cleanup = screens[name](app);
  },
};

setVoiceEnabled(app.save.voice);
setSoundEnabled(app.save.sound);

document.addEventListener('visibilitychange', () => {
  if (document.hidden) hush();
});

app.go('home');
