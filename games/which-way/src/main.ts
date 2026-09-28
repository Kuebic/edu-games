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
const { root, storage } = startGame('which-way', { unlock: unlockVoice });
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
    'The first screen is for you. Pick a Way: 👀 Watch shows an arrow and the puppy, ball or car goes that way by itself; ' +
    '🟢 Go shows the arrow and waits for your child to tap the green Go button; 👆 Pick shows only the treat, and your child taps the arrow that points to it. ' +
    'A wrong arrow just sends it the wrong way and back, and the right arrow glows. After two, the arrow shows beside it too. ' +
    'Then pick the arrows that come up: ←→ first, then ↑↓, then All. The pictures pick what goes: puppy, ball or car. ' +
    'It goes on for as long as your child likes, with a cheer every five. Left and right as words come later, around five or six, so point along the arrow with your finger rather than naming it. ' +
    'Your picks are kept for next time.',
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
  play: () => show(() => playScreen(app)),
  corner,
};

app.start();
