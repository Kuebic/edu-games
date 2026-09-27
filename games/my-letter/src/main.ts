import { startGame } from '@shared/shell';
import { grownUpCorner, textRow } from '@shared/grownup';
import type { LevelSelectView } from '@shared/level-select';
import { unlockVoice } from '@shared/voice';
import './style.css';
import type { App } from './app';
import { MY_WORDS, splitWords } from './letters';
import { hasName, loadProgress, setName, setWords } from './progress';
import { boardScreen } from './screens/board';
import { playScreen } from './screens/play';
import { showSelect } from './screens/select';

// Browsers only start the Voice after a touch.
const { root, storage } = startGame('my-letter', { unlock: unlockVoice });
const progress = loadProgress(storage);
let cleanup: (() => void) | void;
/** The level select while it's up, so the Grown-up Corner can redraw it. */
let select: LevelSelectView | undefined;
/** The Group of the Level being played, so a changed word can take the child out of a My words Level. */
let playing: number | undefined;
/** The Corner changed My words while it was open, so they start fresh. */
let wordsChanged = false;

function show(screen: () => (() => void) | void): void {
  cleanup?.();
  select = undefined;
  playing = undefined;
  root.replaceChildren();
  cleanup = screen();
}

const corner = grownUpCorner(root, progress, {
  voice: true,
  rows: () => [
    textRow('First name', () => progress.game.name, (typed) => {
      if (setName(progress, typed)) wordsChanged = true;
    }),
    textRow('More words, with commas: Mama, Dada, Leo', () => progress.game.words.join(', '), (typed) => {
      if (setWords(progress, splitWords(typed))) wordsChanged = true;
    }),
  ],
  note:
    'My words spells the name, a letter at a time from three to pick from: S, then A, then M. ' +
    'Then each of the more words, spelt the same way: family, friends, whatever the child calls them, as you would say it. ' +
    'It shows once there is a name or a word. ' +
    'New letters has B, D, K, P, T, V, Z and J, whose names start with their sound. Each asks for its letter twice, ' +
    'and twice for a letter met before, from three to pick from. Tapping the name or the speaker asks again, with the letter\'s sound. ' +
    'A letter picked by mistake is named and fades away. A found letter says its sound. ' +
    'Adding a word at the end keeps what is done; changing or taking one away starts My words again. New letters stays. ' +
    'Levels open in order, and Next goes on to the next one. ' +
    'The ABC button on the first screen opens the Letter board: every letter, the name\'s in their own colour, to tap and hear, and a button that sings the ABC song as each letter shakes. Nothing there is saved.',
  closed: () => {
    // Closed without a Name: don't open by itself again.
    if (!hasName(progress) && !progress.game.skipped) {
      progress.game.skipped = true;
      progress.save();
    }
    // A My words Level spelling a word that changed stops, unfinished, and the child picks again.
    const leave = wordsChanged && playing === MY_WORDS;
    wordsChanged = false;
    if (leave) app.groups();
    else select?.redraw();
  },
});

const app: App = {
  root,
  progress,
  groups: (group) =>
    show(() => {
      select = showSelect(app, group);
      return select.leave;
    }),
  play: (group, level) =>
    show(() => {
      playing = group;
      return playScreen(app, group, level);
    }),
  board: () => show(() => boardScreen(app)),
  corner,
};

app.groups();
// The first time, with no Name: the Corner opens by itself so a grown-up can type one.
if (!hasName(progress) && !progress.game.skipped) corner.open();
