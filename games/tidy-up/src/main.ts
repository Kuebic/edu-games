import { startGame } from '@shared/shell';
import { grownUpCorner, switchRow } from '@shared/grownup';
import type { PracticeView } from '@shared/practice';
import './style.css';
import type { App } from './app';
import { loadProgress } from './progress';
import { playScreen } from './screens/play';
import { showStart } from './screens/practice';

// No Voice: every word is a recorded clip, and the shell unlocks the Sound.
const { root, storage } = startGame('tidy-up');
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
  rows: () => [
    switchRow(
      'Patterns (for color blindness)',
      () => progress.game.patterns,
      (on) => {
        progress.game.patterns = on;
        progress.save();
      },
    ),
  ],
  note:
    'The first screen is for you. Pick Colors or Shapes; a Round never mixes the two. ' +
    'On Colors, 🧱 Blocks gives the same block in each color, the easiest; 🧸 Things gives everyday things, a strawberry or a frog, to sort by color alone. ' +
    'On Shapes, ⬜ Plain makes every shape grey; 🌈 Colorful paints them, and your child has to look past the color. ' +
    'Then tap the colors or shapes to sort. Two make two bins, three or more make three a Round, taking turns. Start with red and blue. ' +
    'Your child drags each thing into its bin, or taps the bin. A wrong bin just sends it back, says its color and lights up the right bin; after two, it goes in by itself. ' +
    'Say the color or shape with your child as each one goes in, and after a Round, look for one around the house. ' +
    'Patterns puts stripes, dots and checks on the colors too, for a child who is color blind. Your picks are kept for next time.',
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
