import { startGame } from '@shared/shell';
import type { LevelSelectView } from '@shared/level-select';
import { showParent } from './parent';
import { showPlay } from './play';
import { loadProgress, saveProgress, type Progress } from './progress';
import { paintSkin, showSelect, type SelectHooks } from './select';
import { setSkinSound } from './sound';
import { setSoundEnabled } from '@shared/sound';
import { setVoiceEnabled, unlockVoice } from '@shared/voice';
import './style.css';

// Browsers only start the Voice after a touch.
const { root, storage } = startGame('robot-path', { unlock: unlockVoice });
let progress = loadProgress(storage);
let leave: () => void = () => {};
/** The level select while it's up, so the Grown-up Corner can redraw it. */
let select: LevelSelectView | undefined;

function apply(): void {
  setSoundEnabled(progress.settings.sound);
  setVoiceEnabled(progress.settings.voice);
  setSkinSound(progress.skin);
  paintSkin(progress.skin);
}

function update(next: Progress): void {
  progress = next;
  saveProgress(progress, storage);
  apply();
}

const hooks: SelectHooks = {
  progress: () => progress,
  skin: (skin) => update({ ...progress, skin }),
  open: openLevel,
  parent: openParent,
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
  leave = showPlay(root, world, index, { progress: () => progress, update, levels: () => openLevels(world), open: openLevel, parent: openParent });
}

function openParent(): void {
  showParent(root.firstElementChild as HTMLElement, {
    progress: () => progress,
    update,
    // "Every level open" and a reset show on the level select straight away.
    close: () => select?.redraw(),
  });
}

apply();
openLevels();
