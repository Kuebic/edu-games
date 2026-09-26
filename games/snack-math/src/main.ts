import { startGame } from '@shared/shell';
import { grownUpCorner } from '@shared/grownup';
import type { LevelSelectView } from '@shared/level-select';
import { unlockVoice } from '@shared/voice';
import './style.css';
import type { App } from './app';
import { h } from './dom';
import { loadProgress } from './progress';
import { playScreen } from './screens/play';
import { showSelect } from './screens/select';
import { stickersScreen } from './screens/stickers';

// Browsers only start the Voice after a touch.
const { root, storage } = startGame('snack-math', { unlock: unlockVoice });
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
  rows: () => [h('p', { text: `Stickers earned: ${progress.game.stickers.length}` })],
  note: 'Every stage is open on the stage list: + is adding, − is taking away and ± is both, up to 5 (one row of dots) or 10 (two rows). A stage’s four rounds open in order, and Next goes on to the next stage.',
  closed: () => select?.redraw(),
});

const app: App = {
  root,
  progress,
  stages: (stage) =>
    show(() => {
      select = showSelect(app, stage);
      return select.leave;
    }),
  play: (stage, round) => show(() => playScreen(app, stage, round)),
  stickers: () => show(() => stickersScreen(app)),
  corner,
};

app.stages();
