// Mailbox's first screen, Practice (the site's ADR 0014): one Topic, Letters, with its two Ways, its Ranges
// from Look-alike to Tricky, and its Scope, saved in the Game's slot, and the gear. Both Ways tell letters
// apart, so Play waits for two.

import { showPractice, type PracticeGame, type PracticeView } from '@shared/practice';
import type { App } from '../app';
import { LETTERS, pairOf, RANGES, type Way } from '../letters';
import { lettersBadge } from './icons';

/** The Reading & Writing Shelf's violet. */
export const TOPIC_COLOUR = '#7a6cf0';

const WAY_CHIPS: Readonly<Record<Way, { text: string; label: string }>> = {
  sort: { text: '📬 Sort', label: 'Sort: each letter into the mailbox with its capital' },
  find: { text: '🔍 Find', label: 'Find: the mailbox asks for its letter' },
};

const pairs = (letters: readonly string[]) => letters.map(pairOf);
const letterOf = (pair: string) => pair[1]!;

/** Mailbox as Practice sees it: one Topic, so no tabs. */
export function mailboxPractice(app: App): PracticeGame {
  const { game } = app.progress;
  return {
    title: 'Mailbox',
    topics: [
      {
        name: 'Letters',
        colour: TOPIC_COLOUR,
        badge: () => lettersBadge,
        items: pairs(LETTERS),
        ranges: [...RANGES.map((r) => ({ label: r.label, items: pairs(r.letters) })), { label: 'All', items: pairs(LETTERS) }],
        ways: (['sort', 'find'] as const).map((id) => ({ id, ...WAY_CHIPS[id] })),
        fewest: 2,
      },
    ],
    topic: () => 0,
    chooseTopic: () => {},
    scope: () => pairs(game.letters),
    setScope: (_t, items) => {
      game.letters = items.map(letterOf);
      app.progress.save();
    },
    way: () => game.way,
    chooseWay: (_t, way) => {
      game.way = way as Way;
      app.progress.save();
    },
    tools: () => [app.corner.gear()],
    play: () => app.play(),
  };
}

export function showStart(app: App): PracticeView {
  return showPractice(app.root, mailboxPractice(app));
}
