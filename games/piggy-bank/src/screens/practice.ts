// Piggy Bank's first screen, Practice (the site's ADR 0014): one Topic, Money, with its two Ways, its
// Ranges and its Scope, saved in the Game's slot, and the gear. Both Ways tell kinds apart, so Play
// waits for two.

import { showPractice, type PracticeGame, type PracticeView } from '@shared/practice';
import type { App } from '../app';
import { LABELS, MONEY, RANGES, type Money, type Way } from '../money';
import { moneyBadge } from './icons';

/** The Math Shelf's orange, as Tidy Up's Colors. */
export const TOPIC_COLOUR = '#ff8a3d';

const WAY_CHIPS: Readonly<Record<Way, { text: string; label: string }>> = {
  sort: { text: '🐷 Sort', label: 'Sort: each coin into the bank with its picture' },
  find: { text: '🔍 Find', label: 'Find: find the coin the pig asks for' },
};

const labels = (money: readonly Money[]) => money.map((m) => LABELS[m]);
const moneyOf = (label: string) => MONEY.find((m) => LABELS[m] === label)!;

/** Piggy Bank as Practice sees it: one Topic, so no tabs. */
export function piggyBankPractice(app: App): PracticeGame {
  const { game } = app.progress;
  return {
    title: 'Piggy Bank',
    topics: [
      {
        name: 'Money',
        colour: TOPIC_COLOUR,
        badge: () => moneyBadge,
        items: labels(MONEY),
        ranges: [...RANGES.map((r) => ({ label: labels(r).join(' '), items: labels(r) })), { label: 'All', items: labels(MONEY) }],
        ways: (['sort', 'find'] as const).map((id) => ({ id, ...WAY_CHIPS[id] })),
        fewest: 2,
      },
    ],
    topic: () => 0,
    chooseTopic: () => {},
    scope: () => labels(game.money),
    setScope: (_t, items) => {
      game.money = items.map(moneyOf);
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
  return showPractice(app.root, piggyBankPractice(app));
}
