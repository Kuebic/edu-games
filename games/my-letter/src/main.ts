import { startGame } from '@shared/shell';
import { grownUpCorner, textRow } from '@shared/grownup';
import type { LevelSelectView } from '@shared/level-select';
import { unlockVoice } from '@shared/voice';
import './style.css';
import type { App } from './app';
import { MY_NAME } from './letters';
import { hasName, loadProgress, setName } from './progress';
import { boardScreen } from './screens/board';
import { playScreen } from './screens/play';
import { showSelect } from './screens/select';

// Browsers only start the Voice after a touch.
const { root, storage } = startGame('my-letter', { unlock: unlockVoice });
const progress = loadProgress(storage);
let cleanup: (() => void) | void;
/** The level select while it's up, so the Grown-up Corner can redraw it. */
let select: LevelSelectView | undefined;
/** The Group of the Level being played, so a new Name can take the child out of a My name Level. */
let playing: number | undefined;
/** The Corner took My name's letters away while it was open. */
let nameChanged = false;

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
      if (setName(progress, typed)) nameChanged = true;
    }),
  ],
  note:
    'My name has a level for each letter of the name, in order: Sam gets S, A and M. It shows once there is a name. ' +
    'New letters has B, D, K, P, T, V, Z and J, whose names start with their sound. Every question ends with the letter\'s sound. ' +
    'Each level asks for its letter four times, from two to pick from. A letter picked by mistake is named and fades away. ' +
    'A found letter says its sound. A new name with different letters starts My name again; New letters stays. ' +
    'Levels open in order, and Next goes on to the next one. ' +
    'The ABC button on the first screen opens the Letter board: every letter, the name\'s in their own colour, to tap and hear. Nothing there is saved.',
  closed: () => {
    // Closed without a Name: don't open by itself again.
    if (!hasName(progress) && !progress.game.skipped) {
      progress.game.skipped = true;
      progress.save();
    }
    // A My name Level about the old Name's letters stops, unfinished, and the child picks again.
    const leave = nameChanged && playing === MY_NAME;
    nameChanged = false;
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
