import { startGame } from '@shared/shell';
import { grownUpCorner } from '@shared/grownup';
import type { PracticeView } from '@shared/practice';
import './style.css';
import type { App } from './app';
import { loadLetters } from './font';
import { loadProgress } from './progress';
import { playScreen } from './screens/play';
import { showStart } from './screens/practice';

// No Voice: every word is a letter's recorded name, and the shell unlocks the Sound.
const { root, storage } = startGame('mailbox');
const progress = loadProgress(storage);
void loadLetters();
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
    'The first screen is for you. This Game matches each capital your child knows to its lowercase letter: A with a. ' +
    '📬 Sort puts out a mailbox for each letter, wearing its capital; your child posts each lowercase letter into its mailbox. 🔍 Find has one mailbox ask for its letter, with two or three to pick from. ' +
    'Tap the letters to practise, or a Range. Same (c o s v w x z) are the same shape in both cases, so start there. Then Close (i j k p u y), one small change, then Unlike (a e f h m n r t), and Tricky (b d g l q) last. ' +
    'Two letters make two mailboxes, three or more make three a Round, taking turns. Letters that look alike, like b and d, only share a Round when you pick nothing else. ' +
    'An Unlike or Tricky mailbox shows its lowercase letter faintly beside the capital at first. It fades after a Round with no mistakes on that letter and is gone after two; a mistake brings it back. ' +
    'The Game only ever says the letter’s name. Say it with your child, and after a Round look for the letter in a book together. Your picks are kept for next time.',
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
