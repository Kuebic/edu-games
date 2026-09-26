import { startGame } from '@shared/shell';
import { grownUpCorner } from '@shared/grownup';
import type { LevelSelectView } from '@shared/level-select';
import { unlockVoice } from '@shared/voice';
import './style.css';
import type { App } from './app';
import { loadProgress } from './progress';
import { playScreen } from './screens/play';
import { showSelect } from './screens/select';

// Browsers only start the Voice after a touch.
const { root, storage } = startGame('find-it', { unlock: unlockVoice });
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
  note:
    'Numbers has ten rounds: 0 to 10, then 11 to 20, and so on up to 100. Letters has five: A to E, F to J, K to O, P to T and U to Z. ' +
    'Each round asks six times, both ways round: count the beans and find the number, or read the number and find the beans; ' +
    'see a picture and find its first letter, or see a letter and find a picture that starts with it. ' +
    'A wrong pick is named, and the beans are counted aloud. Rounds open in order, and Next goes on to the next one.',
  closed: () => select?.redraw(),
});

const app: App = {
  root,
  progress,
  boxes: (box) =>
    show(() => {
      select = showSelect(app, box);
      return select.leave;
    }),
  play: (box, round) => show(() => playScreen(app, box, round)),
  corner,
};

app.boxes();
