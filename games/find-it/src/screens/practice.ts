// Find It's first screen, Practice (ADR 0014 of the site): Numbers and Letters as Topics, each with its
// Ranges, its Way and its Scope, saved in Find It's slot, and the gear.

import { showPractice, type PracticeGame, type PracticeView } from '@shared/practice';
import type { App } from '../app';
import { ITEMS, LETTER_RANGES, NUMBER_RANGES, TOPICS, WAYS, type Topic, type Way } from '../finds';

/** One colour per Topic: Numbers in the Math Shelf's orange, Letters in the Reading Shelf's violet. */
export const TOPIC_COLOURS: Readonly<Record<Topic, string>> = { number: '#ff8a3d', letter: '#7a6cf0' };

const NAMES: Readonly<Record<Topic, string>> = { number: 'Numbers', letter: 'Letters' };

/** Each Topic's Ways: what the chip shows (what's seen, then what's found), and what a screen reader says. */
const WAY_CHIPS: Readonly<Record<Topic, Record<Way, { text: string; label: string }>>> = {
  number: {
    'find-symbol': { text: '🫘 → 3', label: 'See beans, find the number' },
    'find-picture': { text: '3 → 🫘', label: 'See a number, find the beans' },
    mix: { text: 'Mix', label: 'Mix' },
  },
  letter: {
    'find-symbol': { text: '🍎 → A', label: 'See a picture, find the letter' },
    'find-picture': { text: 'A → 🍎', label: 'See a letter, find the picture' },
    mix: { text: 'Mix', label: 'Mix' },
  },
};

const RANGES: Readonly<Record<Topic, readonly (readonly string[])[]>> = { number: NUMBER_RANGES, letter: LETTER_RANGES };

const BEAN = (cx: number, cy: number) => `<ellipse cx="${cx}" cy="${cy}" rx="6.5" ry="4.5" transform="rotate(-15 ${cx} ${cy})"/>`;

/** A Topic's badge, drawn white: a 3 over three beans for Numbers, an A over a small a for Letters. */
export function topicBadge(topic: Topic): string {
  const text = (body: string, y: number, size: number) =>
    `<text x="24" y="${y}" font-size="${size}" font-weight="900" text-anchor="middle" fill="currentColor">${body}</text>`;
  const body =
    topic === 'number'
      ? text('3', 27, 28) + `<g fill="currentColor">${BEAN(10, 39)}${BEAN(24, 39)}${BEAN(38, 39)}</g>`
      : text('A', 30, 30) + text('a', 44, 15);
  return `<svg viewBox="0 0 48 48" aria-hidden="true">${body}</svg>`;
}

/** Find It as Practice sees it: Topics count from 0 there, in TOPICS order. */
export function findItPractice(app: App): PracticeGame {
  const { game } = app.progress;
  const kind = (t: number) => TOPICS[t]!;
  return {
    title: 'Find It',
    topics: TOPICS.map((topic) => ({
      name: NAMES[topic],
      colour: TOPIC_COLOURS[topic],
      badge: () => topicBadge(topic),
      items: ITEMS[topic],
      ranges: [
        ...RANGES[topic].map((items) => ({ label: `${items[0]}–${items.at(-1)}`, items })),
        { label: 'All', items: ITEMS[topic] },
      ],
      ways: WAYS.map((id) => ({ id, ...WAY_CHIPS[topic][id] })),
    })),
    topic: () => TOPICS.indexOf(game.topic),
    chooseTopic: (t) => {
      game.topic = kind(t);
      app.progress.save();
    },
    scope: (t) => game.scopes[kind(t)],
    setScope: (t, items) => {
      game.scopes[kind(t)] = [...items];
      app.progress.save();
    },
    way: (t) => game.ways[kind(t)],
    chooseWay: (t, way) => {
      game.ways[kind(t)] = way as Way;
      app.progress.save();
    },
    tools: () => [app.corner.gear()],
    play: (t) => app.play(kind(t)),
  };
}

export function showStart(app: App): PracticeView {
  return showPractice(app.root, findItPractice(app));
}
