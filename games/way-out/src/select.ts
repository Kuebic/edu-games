// Way Out's level select: its Packs as Groups, the Skin chips, and "more like this" under each Pack.

import { paintPage, showLevelSelect, type LevelSelectGame, type LevelSelectView } from '@shared/level-select';
import { canSpeak, say } from '@shared/voice';
import { packColor, packIcon, type App } from './app';
import { ICONS, iconButton } from './icons';
import { LEVELS } from './levels';
import { PACKS } from './packs';
import { packLevels, packSparkles, shownPacks } from './progress';
import { heroPicture, SKINS, skinById, type SkinId } from './skins';

/** Colours the page for a Skin: the sky behind every screen, and the browser bar. */
export function paintSkin(id: SkinId): void {
  const skin = skinById(id);
  paintPage({ '--sky': skin.sky, '--sky-dark': skin.skyDark, '--ink': skin.ink }, skin.sky);
}

/** Way Out as the level select sees it. Packs count from 1 here and from 0 there. */
export function wayOutSelect(app: App): LevelSelectGame {
  const { progress } = app;
  return {
    title: 'Way Out',
    groups: () =>
      PACKS.slice(0, shownPacks(progress)).map((spec, i) => ({
        name: spec.name,
        colour: packColor(i + 1),
        badge: () => packIcon(i + 1),
        levels: progress.marks(i),
        bonusSparkles: progress.game.poolSparkles[i + 1] ?? 0,
      })),
    everyLevelOpen: () => progress.settings.everyLevelOpen,
    tools() {
      const speaker = iconButton('site-tool', ICONS.speaker, 'Say it', () => say(`Help the red ${app.skin().hero} get out.`));
      speaker.hidden = !canSpeak;
      return [speaker, app.corner.gear()];
    },
    skins: {
      chips: SKINS.map((s) => ({ id: s.id, label: s.label, picture: heroPicture(s), colour: s.sky })),
      current: () => progress.game.skin,
      choose(id) {
        progress.game.skin = skinById(id).id;
        progress.save();
        paintSkin(progress.game.skin);
      },
    },
    underGroup(g) {
      const more = iconButton('wo-more-like', ICONS.more, 'More like this', () => app.pool(g + 1));
      more.style.setProperty('--pack', packColor(g + 1));
      const sparkles = packSparkles(progress, g + 1);
      if (sparkles) more.insertAdjacentHTML('beforeend', `<span class="wo-pack-sparkles">${ICONS.sparkle}<b>${sparkles}</b></span>`);
      return more;
    },
    play: (g, i) => app.level(packLevels(LEVELS, g + 1)[i]!),
  };
}

/** The Pack list, or with `pack` that Pack's Levels. */
export function showSelect(app: App, pack?: number): LevelSelectView {
  return showLevelSelect(app.root, wayOutSelect(app), pack === undefined ? undefined : pack - 1);
}
