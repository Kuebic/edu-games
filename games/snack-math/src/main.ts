import './style.css';
import { registerOffline } from '@shared/pwa';
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

const root = document.getElementById('app')!;
let cleanup: (() => void) | void;

const app: App = {
  root,
  save: loadSave(localStorage),
  persist() {
    writeSave(app.save, localStorage);
  },
  go(name) {
    cleanup?.();
    root.replaceChildren();
    cleanup = screens[name](app);
  },
};

setVoiceEnabled(app.save.voice);
setSoundEnabled(app.save.sound);

// Keep stray little fingers from zooming, selecting, or opening menus.
document.addEventListener('contextmenu', (e) => e.preventDefault());
for (const type of ['gesturestart', 'gesturechange']) {
  document.addEventListener(type, (e) => e.preventDefault(), { passive: false });
}
document.addEventListener(
  'touchmove',
  (e) => {
    if (e.touches.length > 1) e.preventDefault();
  },
  { passive: false },
);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) hush();
});

app.go('home');

if (import.meta.env.PROD) registerOffline();
