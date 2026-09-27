// The level select: the Tracks as Groups, and the Hoppers as Skin chips, so a child picks their animal.

import { showLevelSelect, type LevelSelectGame, type LevelSelectView } from '@shared/level-select';
import { HOPPERS, HOPPER_IDS, isHopper } from '../animals';
import type { App } from '../app';
import { setHopper } from '../progress';
import { TRACKS } from '../race';
import { play } from '../sounds';

/** One colour per Track, by its number: To 5 in orange, To 10 in blue, Who's ahead in purple. */
export const TRACK_COLOURS = ['#f0904d', '#3a9fd8', '#9b6fe0'] as const;

const HOP_ARC = '<path d="M9 17q7-13 15 0q7-13 15 0" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>';
const number = (n: number) => `<text x="24" y="44" font-size="${n < 10 ? 26 : 22}" font-weight="900" text-anchor="middle" fill="currentColor">${n}</text>`;
/** Two animals on a line, one further along, and a question. */
const AHEAD =
  '<path d="M5 38h38" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>' +
  '<circle cx="13" cy="31" r="5" fill="currentColor"/><circle cx="34" cy="31" r="5" fill="currentColor"/>' +
  '<text x="34" y="21" font-size="18" font-weight="900" text-anchor="middle" fill="currentColor">?</text>';

/** A Track's badge, drawn white: its Home number under two hops, or two animals and a question for Who's ahead. */
export function trackBadge(track: number): string {
  const t = TRACKS[track]!;
  return `<svg viewBox="0 0 48 48" aria-hidden="true">${t.ahead ? AHEAD : HOP_ARC + number(t.home)}</svg>`;
}

/** Hop Race as the level select sees it: Groups and Levels count from 0 there, as here. */
export function hopRaceSelect(app: App): LevelSelectGame {
  return {
    title: 'Hop Race',
    groups: () =>
      TRACKS.map((t, g) => ({
        name: t.name,
        colour: TRACK_COLOURS[g]!,
        badge: () => trackBadge(g),
        levels: app.progress.marks(g),
      })),
    levelWord: 'Race',
    everyLevelOpen: () => app.progress.settings.everyLevelOpen,
    tools: () => [app.corner.gear()],
    skins: {
      chips: HOPPER_IDS.map((id) => ({
        id,
        label: HOPPERS[id].name,
        picture: `<span class="face chip-face">${HOPPERS[id].face}</span>`,
        colour: HOPPERS[id].colour,
      })),
      current: () => app.progress.game.hopper,
      choose(id) {
        if (!isHopper(id)) return;
        play('pop');
        setHopper(app.progress, id);
      },
    },
    play: (g, race) => app.play(g, race),
  };
}

/** The Track list, or with `track` that Track's Races. */
export function showSelect(app: App, track?: number): LevelSelectView {
  return showLevelSelect(app.root, hopRaceSelect(app), track);
}
