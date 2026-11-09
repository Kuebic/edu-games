import { startGame } from '@shared/shell';
import { grownUpCorner } from '@shared/grownup';
import type { PracticeView } from '@shared/practice';
import './style.css';
import type { App } from './app';
import { loadProgress } from './progress';
import { playScreen } from './screens/play';
import { showStart } from './screens/practice';

// No Voice: the only words are the site's recorded Words, and the shell unlocks the Sound.
const { root, storage } = startGame('go-together');
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
    'The first screen is for you. This Game is Connections for a child who can’t read yet: pictures in hidden groups, and nobody says what the groups are. ' +
    'Your child taps the pictures that go together. The first picture tapped leads; a picture from another group just bumps back, and the rest of the group lights up. After two bumps the group gathers by itself. ' +
    'When a whole group is up it hops into a frame at the top and says its name, once. Tapping a lifted picture puts it down. Nothing is counted. ' +
    'Try the tabs in order. 🟩 Same is for two-year-olds: the groups are the same picture twice. Colors groups things of one color: a strawberry, a fire truck and a rose. Kinds groups kinds of things: animals, vehicles, food, clothes. ' +
    'The squares pick the Board: 4 pictures in 2 groups of 2, 6 in 2 groups of 3, 9 in 3 groups of 3, or 16 in 4 groups of 4, like the newspaper. ' +
    'Then tap the pictures to play with; Easy is animals, vehicles, food and clothes. Play waits until you have turned on as many as the Board has groups. ' +
    'The Game only ever says the group’s name. Say it with your child as the group gathers, "they’re all animals", and after a Board, find three things at home that go together. Your picks are kept for next time.',
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
