import { startGame } from '@shared/shell';
import { choiceRow, grownUpCorner } from '@shared/grownup';
import type { LevelSelectView } from '@shared/level-select';
import { unlockVoice } from '@shared/voice';
import { showPlay } from './play';
import { loadProgress, SPEEDS, type Speed } from './progress';
import { paintSkin, showSelect, type SelectHooks } from './select';
import { setSkinSound } from './sound';
import './style.css';

// Browsers only start the Voice after a touch.
const { root, storage } = startGame('robot-path', { unlock: unlockVoice });
const progress = loadProgress(storage);
let leave: () => void = () => {};
/** The level select while it's up, so the Grown-up Corner can redraw it. */
let select: LevelSelectView | undefined;

const SPEED_NAMES: Record<Speed, string> = { slow: 'Slow', normal: 'Normal', fast: 'Fast' };

const corner = grownUpCorner(root, progress, {
  voice: true,
  rows: () => [
    choiceRow('Speed', SPEEDS.map((id) => ({ id, label: SPEED_NAMES[id] })), () => progress.game.speed, (speed) => {
      progress.game.speed = speed;
      progress.save();
    }),
  ],
  // "Every level open" and a reset show on the level select straight away.
  closed: () => select?.redraw(),
});

/** The Skin's colours and sounds. */
function paint(): void {
  setSkinSound(progress.game.skin);
  paintSkin(progress.game.skin);
}

const hooks: SelectHooks = {
  progress,
  skin(skin) {
    progress.game.skin = skin;
    progress.save();
    paint();
  },
  open: openLevel,
  corner,
};

/** The World list, or with `world` that World's Levels. */
function openLevels(world?: number): void {
  leave();
  const view = showSelect(root, hooks, world);
  select = view;
  leave = view.leave;
}

function openLevel(world: number, index: number): void {
  leave();
  select = undefined;
  leave = showPlay(root, world, index, { progress, levels: () => openLevels(world), open: openLevel, corner });
}

paint();
openLevels();
