// Go Together's first screen, Practice (the site's ADR 0014): Same, Colors and Kinds as Topics, each with
// its Scope, and the Board as the Way of every Topic, saved in the Game's slot, and the gear. A Board of
// n groups needs n items in the Scope, except Same, whose groups are pictures: one pool is enough.

import { COLOURS, membersOf, type Colour } from '@shared/kinds';
import { showPractice, type PracticeGame, type PracticeTopic, type PracticeView } from '@shared/practice';
import type { App } from '../app';
import { BOARD_GROUPS, BOARDS, EASY_KINDS, KIND_GROUPS, POOL_LIST, TOPICS, type Board, type KindsGroup, type Pool, type Topic } from '../boards';
import { boardChip, topicBadge } from './icons';

/** Same in the Logic Shelf's green, Colors in the Math Shelf's orange, Kinds in a wood brown. */
export const TOPIC_COLOURS: Readonly<Record<Topic, string>> = { same: '#2fa36b', colors: '#ff8a3d', kinds: '#a86d36' };

const NAMES: Readonly<Record<Topic, string>> = { same: 'Same', colors: 'Colors', kinds: 'Kinds' };

/** What a Scope button shows for a color. */
export const COLOUR_GLYPHS: Readonly<Record<Colour, string>> = {
  red: '🔴',
  blue: '🔵',
  yellow: '🟡',
  green: '🟢',
  orange: '🟠',
  purple: '🟣',
  pink: '🩷',
};
/** The first Range of Colors: told apart by a red-green color-blind child too. */
const FIRST_COLOURS: readonly Colour[] = ['red', 'blue', 'yellow'];

/** What a Scope button shows for a group or a pool: its first member. */
const groupChip = (group: KindsGroup | Pool): string => membersOf(group)[0]!.emoji;

const BOARD_LABELS: Readonly<Record<Board, string>> = {
  4: '4 pictures: 2 groups of 2',
  6: '6 pictures: 2 groups of 3',
  9: '9 pictures: 3 groups of 3',
  16: '16 pictures: 4 groups of 4',
};

const colourGlyphs = (colours: readonly Colour[]) => colours.map((c) => COLOUR_GLYPHS[c]);
const colourOf = (glyph: string) => COLOURS.find((c) => COLOUR_GLYPHS[c] === glyph)!;
const groupChips = (groups: readonly (KindsGroup | Pool)[]) => groups.map(groupChip);
const kindOf = (chip: string) => KIND_GROUPS.find((g) => groupChip(g) === chip)!;
const poolOf = (chip: string) => POOL_LIST.find((p) => groupChip(p) === chip)!;

function topicOf(app: App, topic: Topic): PracticeTopic {
  const { board } = app.progress.game;
  const base = {
    name: NAMES[topic],
    colour: TOPIC_COLOURS[topic],
    badge: () => topicBadge(topic),
    ways: BOARDS.map((b) => ({ id: String(b), label: BOARD_LABELS[b], text: boardChip(b) })),
  };
  if (topic === 'same') return { ...base, items: groupChips(POOL_LIST), ranges: [{ label: 'All', items: groupChips(POOL_LIST) }], fewest: 1 };
  if (topic === 'colors') {
    return {
      ...base,
      items: colourGlyphs(COLOURS),
      ranges: [
        { label: colourGlyphs(FIRST_COLOURS).join(''), items: colourGlyphs(FIRST_COLOURS) },
        { label: 'All', items: colourGlyphs(COLOURS) },
      ],
      fewest: BOARD_GROUPS[board],
    };
  }
  return {
    ...base,
    items: groupChips(KIND_GROUPS),
    ranges: [
      { label: 'Easy', items: groupChips(EASY_KINDS) },
      { label: 'All', items: groupChips(KIND_GROUPS) },
    ],
    fewest: BOARD_GROUPS[board],
  };
}

/** Go Together as Practice sees it: Topics count from 0 there, in TOPICS order. */
export function goTogetherPractice(app: App): PracticeGame {
  const { game } = app.progress;
  return {
    title: 'Go Together',
    topics: TOPICS.map((topic) => topicOf(app, topic)),
    topic: () => TOPICS.indexOf(game.topic),
    chooseTopic: (t) => {
      game.topic = TOPICS[t]!;
      app.progress.save();
    },
    scope(t) {
      const topic = TOPICS[t]!;
      if (topic === 'same') return groupChips(game.same);
      if (topic === 'colors') return colourGlyphs(game.colors);
      return groupChips(game.kinds);
    },
    setScope: (t, items) => {
      const topic = TOPICS[t]!;
      if (topic === 'same') game.same = items.map(poolOf);
      else if (topic === 'colors') game.colors = items.map(colourOf);
      else game.kinds = items.map(kindOf);
      app.progress.save();
    },
    way: () => String(game.board),
    chooseWay: (_t, way) => {
      game.board = Number(way) as Board;
      app.progress.save();
    },
    tools: () => [app.corner.gear()],
    play: () => app.play(),
  };
}

export function showStart(app: App): PracticeView {
  return showPractice(app.root, goTogetherPractice(app));
}
