import { startGame } from '@shared/shell';
import { grownUpCorner } from '@shared/grownup';
import type { PracticeView } from '@shared/practice';
import './style.css';
import type { App } from './app';
import { loadProgress } from './progress';
import { playScreen } from './screens/play';
import { showStart } from './screens/practice';

// No Voice: every word is a recorded clip, and the shell unlocks the Sound.
const { root, storage } = startGame('piggy-bank');
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
  levels: false,
  note:
    'The first screen is for you. This Game teaches the names of coins and the dollar, and that they are money. It never says what they are worth: most children can compare values only at about six. ' +
    'Pick the money to practise with the 1¢ to $1 buttons. 🐷 Sort gives a bank for each, with its picture on it, the easiest. 🔍 Find has the pig ask for one by name. ' +
    'Start with the penny and the quarter (1¢ 25¢), then the penny and the dime, then the dime and the quarter, then all three. Add the dollar, and the nickel last: children mix up the nickel and the quarter for years. ' +
    'Say the name with your child as each coin goes in, and look at real coins together after. Keep real coins with a grown-up: they are a choking risk. Your picks are kept for next time.',
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
