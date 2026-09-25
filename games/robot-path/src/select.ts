// Robot Path's level select: its Worlds as Groups, the Skin chips, and the gear for grown-ups.

import { paintPage, showLevelSelect, type LevelSelectGame, type LevelSelectView } from '@shared/level-select';
import { holdButton, ICONS, WORLD_ICONS } from './icons';
import { WORLDS } from './levels';
import { SKINS, type Progress, type SkinId } from './progress';
import { SKIN_ART, skinPicture } from './skins';
import * as sfx from './sound';

export interface SelectHooks {
  progress(): Progress;
  /** Save the Skin the child picked. */
  skin(skin: SkinId): void;
  /** Play a Level. Worlds and Levels count from 0. */
  open(world: number, index: number): void;
  parent(): void;
}

/** Colours the page for a Skin: the sky behind every screen, the board's frame, the title, and the browser bar. */
export function paintSkin(id: SkinId): void {
  const art = SKIN_ART[id];
  paintPage({ '--sky': art.sky, '--frame': art.frame, '--title': art.title }, art.sky);
}

/** Robot Path as the level select sees it. */
export function robotPathSelect(hooks: SelectHooks): LevelSelectGame {
  return {
    title: 'Robot Path',
    groups: () =>
      WORLDS.map((world, w) => ({
        name: world.name,
        colour: world.color,
        badge: () => WORLD_ICONS[w]!,
        levels: world.levels.map((level) => {
          const saved = hooks.progress().levels[level.id];
          return { done: saved?.done === true, sparkle: saved?.sparkle === true };
        }),
      })),
    everyLevelOpen: () => hooks.progress().unlockAll,
    tools: () => [holdButton('site-tool', ICONS.gear, 'Grown-ups: hold', 3000, hooks.parent)],
    skins: {
      chips: SKINS.map((id) => ({ id, label: SKIN_ART[id].name, picture: skinPicture(id), colour: SKIN_ART[id].floor[0] })),
      current: () => hooks.progress().skin,
      choose(id) {
        sfx.tap();
        hooks.skin(SKINS.find((s) => s === id) ?? 'garden');
      },
    },
    play: (w, i) => hooks.open(w, i),
  };
}

/** The World list, or with `world` (from 0) that World's Levels. */
export function showSelect(root: HTMLElement, hooks: SelectHooks, world?: number): LevelSelectView {
  return showLevelSelect(root, robotPathSelect(hooks), world);
}
