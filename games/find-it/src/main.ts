import { startGame } from '@shared/shell';
import { grownUpCorner } from '@shared/grownup';
import type { PracticeView } from '@shared/practice';
import { unlockVoice } from '@shared/voice';
import './style.css';
import type { App } from './app';
import { loadProgress } from './progress';
import { playScreen } from './screens/play';
import { showStart } from './screens/practice';

// Browsers only start the Voice after a touch.
const { root, storage } = startGame('find-it', { unlock: unlockVoice });
const progress = loadProgress(storage);
let cleanup: (() => void) | void;
/** Practice while it's up, so the Grown-up Corner can redraw it. */
let start: PracticeView | undefined;

function show(screen: () => (() => void) | void): void {
  cleanup?.();
  start = undefined;
  root.replaceChildren();
  cleanup = screen();
}

const corner = grownUpCorner(root, progress, {
  voice: true,
  levels: false,
  note:
    'The first screen is for you. Pick Numbers or Letters, then which way round: 🫘 → 3 shows beans and the child finds the number; ' +
    '3 → 🫘 shows a number and the child finds the tray of beans. The pictures under them turn the beans into jellybeans, ladybugs, stars or strawberries. 🍎 → A shows a picture and the child finds its first letter; ' +
    'A → 🍎 shows a letter and the child finds a picture that starts with it. Mix takes turns. ' +
    'Then tap the numbers or letters to practise, or a range like A–E to turn five on or off at once, and Play. ' +
    'Each one comes up once before any comes again, for as long as the child likes, with a cheer every six. ' +
    'A wrong pick is named, and the beans are counted aloud. Your picks are kept for next time.',
  closed: () => start?.redraw(),
});

const app: App = {
  root,
  progress,
  start: () =>
    show(() => {
      start = showStart(app);
      return start.leave;
    }),
  play: (topic) => show(() => playScreen(app, topic)),
  corner,
};

app.start();
