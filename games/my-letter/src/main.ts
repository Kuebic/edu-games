import { startGame } from '@shared/shell';
import { grownUpCorner, textRow } from '@shared/grownup';
import type { LevelSelectView } from '@shared/level-select';
import { unlockVoice } from '@shared/voice';
import './style.css';
import type { App } from './app';
import { hasName, loadProgress, setName } from './progress';
import { playScreen } from './screens/play';
import { showSelect } from './screens/select';

// Browsers only start the Voice after a touch.
const { root, storage } = startGame('my-letter', { unlock: unlockVoice });
const progress = loadProgress(storage);
let cleanup: (() => void) | void;
/** The level select while it's up, so the Grown-up Corner can redraw it. */
let select: LevelSelectView | undefined;

function show(screen: () => (() => void) | void): void {
  cleanup?.();
  select = undefined;
  root.replaceChildren();
  cleanup = screen();
}

const corner = grownUpCorner(root, progress, {
  voice: true,
  rows: () => [textRow("Child's first name", () => progress.game.name, (typed) => setName(progress, typed))],
  note:
    'My name has a level for each letter of the name, in order: Sam gets S, A and M. It shows once there is a name. ' +
    'New letters has B, D, K, P, T, V, Z and J, whose names start with their sound. ' +
    'Each level asks for its letter four times, from two to pick from. A wrong pick is named and fades away. ' +
    'A found letter says its sound. A new name with different letters starts My name again; New letters stays. ' +
    'Levels open in order, and Next goes on to the next one.',
  closed: () => {
    // Closed without a Name: don't open by itself again.
    if (!hasName(progress) && !progress.game.skipped) {
      progress.game.skipped = true;
      progress.save();
    }
    select?.redraw();
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
  play: (group, level) => show(() => playScreen(app, group, level)),
  corner,
};

app.groups();
// The first time, with no Name: the Corner opens by itself so a grown-up can type one.
if (!hasName(progress) && !progress.game.skipped) corner.open();
