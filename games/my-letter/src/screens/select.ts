// The level select: My name (left out until there's a Name) and New letters as Groups, each Level's card
// its Name or letter, and on the Group list the Letter board's button beside the gear.

import { showLevelSelect, type LevelSelectGame, type LevelSelectView } from '@shared/level-select';
import type { App } from '../app';
import { GROUP_NAMES, MY_NAME, levelLabels, nameLetters } from '../letters';

/** One colour per Group, by its number: My name in the name tag's coral, New letters in teal. */
export const GROUP_COLOURS = ['#f0604d', '#159a9c'] as const;

const text = (body: string, x: number, y: number, size: number) =>
  `<text x="${x}" y="${y}" font-size="${size}" font-weight="900" text-anchor="middle" fill="currentColor">${body}</text>`;

/** A Group's badge, drawn white: a name tag with the Name's first letter for My name, a B saying its sound for New letters. */
export function groupBadge(group: number, name: string): string {
  const body =
    group === MY_NAME
      ? '<rect x="5" y="10" width="38" height="30" rx="7" fill="none" stroke="currentColor" stroke-width="4"/>' +
        '<rect x="18" y="5" width="12" height="8" rx="3" fill="currentColor"/>' +
        text(nameLetters(name)[0] ?? '', 24, 34, 20)
      : text('B', 17, 35, 28) +
        '<path d="M31 18a8 8 0 0 1 0 12M36 13a14 14 0 0 1 0 22" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>';
  return `<svg viewBox="0 0 48 48" aria-hidden="true">${body}</svg>`;
}

/** The Letter board's tool: A, B and C, big to small, the way a child meets them on the board. */
const ABC =
  '<svg viewBox="0 0 48 48" aria-hidden="true" font-weight="900" text-anchor="middle" fill="currentColor">' +
  '<text x="11" y="37" font-size="30">A</text><text x="27" y="37" font-size="24">B</text><text x="40" y="37" font-size="19">C</text></svg>';

function boardButton(app: App): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'site-tool';
  b.setAttribute('aria-label', 'Letter board');
  b.innerHTML = ABC;
  b.addEventListener('click', () => app.board());
  return b;
}

/** My Letter as the level select sees it: Groups and Levels count from 0 there, as here. */
export function myLetterSelect(app: App): LevelSelectGame {
  return {
    title: 'My Letter',
    groups: () =>
      GROUP_NAMES.map((name, g) => ({
        name,
        colour: GROUP_COLOURS[g]!,
        badge: () => groupBadge(g, app.progress.game.name),
        levels: app.progress.marks(g),
        labels: levelLabels(app.progress.game.name, g),
      })),
    everyLevelOpen: () => app.progress.settings.everyLevelOpen,
    tools: (group) => (group === undefined ? [boardButton(app), app.corner.gear()] : [app.corner.gear()]),
    play: (g, level) => app.play(g, level),
  };
}

/** The Group list, or with `group` that Group's Levels. */
export function showSelect(app: App, group?: number): LevelSelectView {
  return showLevelSelect(app.root, myLetterSelect(app), group);
}
