// Which Way?'s first screen, Practice (the site's ADR 0014): one Topic, the Arrows, with its Ways, its Ranges
// and the Skins (ADR 0015), saved in the Game's slot, and the gear.

import { showPractice, type PracticeGame, type PracticeView } from '@shared/practice';
import type { SkinPicker } from '@shared/skins';
import type { App } from '../app';
import { SKINS, SKIN_LOOKS, type Skin } from '../skins';
import { ARROWS, GLYPHS, RANGES, WAYS, type Arrow, type Way } from '../trips';
import { badge, carSvg } from './icons';

/** The Logic Shelf's green. */
export const COLOUR = '#2fa36b';

const WAY_CHIPS: Readonly<Record<Way, { text: string; label: string }>> = {
  watch: { text: '👀 Watch', label: 'Watch: the arrow shows and it goes by itself' },
  go: { text: '🟢 Go', label: 'Go: the arrow shows and your child taps Go' },
  pick: { text: '👆 Pick', label: 'Pick: your child taps the arrow to the treat' },
};

const glyphs = (arrows: readonly Arrow[]) => arrows.map((a) => GLYPHS[a]);
const arrowOf = (glyph: string) => ARROWS.find((a) => GLYPHS[a] === glyph)!;

/** A Skin's chip picture: its Mover. */
export function skinPicture(skin: Skin): string {
  const { emoji } = SKIN_LOOKS[skin];
  if (!emoji) return carSvg;
  return `<svg viewBox="0 0 48 48" aria-hidden="true"><text x="24" y="37" font-size="32" text-anchor="middle">${emoji}</text></svg>`;
}

function skinPicker(app: App): SkinPicker {
  const { game } = app.progress;
  return {
    chips: SKINS.map((id) => ({ id, label: SKIN_LOOKS[id].name, picture: skinPicture(id), colour: SKIN_LOOKS[id].colour })),
    current: () => game.skin,
    choose: (id) => {
      game.skin = id as Skin;
      app.progress.save();
    },
  };
}

/** Which Way? as Practice sees it: one Topic, whose items are the Arrows as their glyphs. */
export function whichWayPractice(app: App): PracticeGame {
  const { game } = app.progress;
  return {
    title: 'Which Way?',
    topics: [
      {
        name: 'Arrows',
        colour: COLOUR,
        badge: () => badge,
        items: glyphs(ARROWS),
        ranges: [...RANGES.map((r) => ({ label: glyphs(r).join(''), items: glyphs(r) })), { label: 'All', items: glyphs(ARROWS) }],
        ways: WAYS.map((id) => ({ id, ...WAY_CHIPS[id] })),
        skins: skinPicker(app),
      },
    ],
    topic: () => 0,
    chooseTopic: () => {},
    scope: () => glyphs(game.scope),
    setScope: (_, items) => {
      game.scope = ARROWS.filter((a) => items.map(arrowOf).includes(a));
      app.progress.save();
    },
    way: () => game.way,
    chooseWay: (_, way) => {
      game.way = way as Way;
      app.progress.save();
    },
    tools: () => [app.corner.gear()],
    play: () => app.play(),
  };
}

export function showStart(app: App): PracticeView {
  return showPractice(app.root, whichWayPractice(app));
}
