import { startGame } from '@shared/shell';
import { hush, unlockVoice } from '@shared/voice';
import type { App } from './app';
import { showParent } from './parent';
import { showPlay, type Puzzle } from './play';
import { loadProgress, takePoolPuzzle } from './progress';
import { paintSkin, showSelect } from './select';
import { skinById } from './skins';
import './style.css';

// Browsers only start the Voice after a touch.
const { root, storage } = startGame('way-out', { unlock: unlockVoice });
const progress = loadProgress(storage);

let leave: () => void = () => {};
/** Shows the current screen again, e.g. after the grown-up menu changes what's open. */
let again: () => void = () => app.home();

function show(render: () => () => void, redo: () => void): void {
  leave();
  hush();
  again = redo;
  paintSkin(progress.game.skin);
  leave = render();
}

/** The level select: the Pack list, or one Pack's Levels. It redraws itself, whichever is up. */
function select(pack?: number): void {
  let view: ReturnType<typeof showSelect> | undefined;
  show(
    () => {
      view = showSelect(app, pack);
      return view.leave;
    },
    () => view?.redraw(),
  );
}

function play(puzzle: Puzzle): void {
  show(() => showPlay(app, puzzle), () => play(puzzle));
}

const app: App = {
  root,
  progress,
  skin: () => skinById(progress.game.skin),
  home: () => select(),
  pack: (pack) => select(pack),
  level: (level) => play({ kind: 'level', level }),
  pool(pack) {
    // The Pools only download when first asked for.
    void import('./pools').then(({ POOLS }) => {
      play({ kind: 'pool', pack, puzzle: takePoolPuzzle(progress, pack, POOLS[pack - 1]!) });
    });
  },
  parent: () => showParent(app, () => again()),
};

app.home();
