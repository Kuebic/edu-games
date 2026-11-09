// What Go Together asks: a Board of Cards in hidden groups, dealt from the site's Pictures (@shared/kinds),
// and the picking rule, tap by tap. Pure, with the random source passed in, so it's tested as data
// (docs/spec.md). Nobody names a group until it's gathered: that is the whole game.

import { COLOUR_THINGS, COLOURS, GROUP_WORDS, GROUPS, membersOf, overlap, type Colour, type Group, type KindThing } from '@shared/kinds';
import { binsFrom, shuffle, type Rng } from '@shared/sort';

// ---- Topics and Boards --------------------------------------------------------------------------------

/** Same: identical pictures. Colors: things of one color. Kinds: a kind of thing. */
export type Topic = 'same' | 'colors' | 'kinds';
/** The Topics in tab order, the youngest's first. */
export const TOPICS: readonly Topic[] = ['same', 'colors', 'kinds'];

/** How many Cards a Board has: 2 groups of 2, 2 of 3, 3 of 3, 4 of 4. */
export type Board = 4 | 6 | 9 | 16;
export const BOARDS: readonly Board[] = [4, 6, 9, 16];
export const BOARD_GROUPS: Readonly<Record<Board, number>> = { 4: 2, 6: 2, 9: 3, 16: 4 };
/** Cards to a group. */
export const BOARD_SIZE: Readonly<Record<Board, number>> = { 4: 2, 6: 3, 9: 3, 16: 4 };
/** Cards to a row of the grid: as many as a group, so a row could be the answer, which the deal forbids. */
export const BOARD_COLUMNS: Readonly<Record<Board, number>> = BOARD_SIZE;

/** Same's Scope: the pools its pictures come from. */
export type Pool = 'animals' | 'vehicles' | 'food' | 'clothes' | 'toys' | 'plants';
export const POOL_LIST: readonly Pool[] = ['animals', 'vehicles', 'food', 'clothes', 'toys', 'plants'];

/** Kinds' Scope: every group but mammals, which is animals over again. */
export type KindsGroup = Exclude<Group, 'mammals'>;
export const KIND_GROUPS: readonly KindsGroup[] = GROUPS.filter((g): g is KindsGroup => g !== 'mammals');
/** The Easy Range: the groups two-year-olds form first. */
export const EASY_KINDS: readonly KindsGroup[] = ['animals', 'vehicles', 'food', 'clothes'];

export { COLOURS };

/** Connections' four, with no meaning but to tell the Frames apart. */
export const FRAME_COLOURS: readonly string[] = ['#f9df6d', '#a0c35a', '#b0c4ef', '#ba81c5'];

// ---- A deal -------------------------------------------------------------------------------------------

/** One Card: its picture, its own name, and which group it belongs to. */
export interface Card {
  emoji: string;
  name: string;
  group: string;
}

export interface Deal {
  topic: Topic;
  board: Board;
  /** The hidden groups, in the order they were drawn; `word` is what's said when one gathers. */
  groups: readonly { key: string; word: string }[];
  /** In grid order, row by row. */
  cards: readonly Card[];
}

/** Shuffles the Cards until no row of the grid is one group. */
function laidOut(cards: readonly Card[], board: Board, rng: Rng): Card[] {
  const cols = BOARD_COLUMNS[board];
  const ok = (grid: readonly Card[]) => {
    for (let i = 0; i < grid.length; i += cols) if (grid.slice(i, i + cols).every((c) => c.group === grid[i]!.group)) return false;
    return true;
  };
  let out = shuffle(cards, rng);
  for (let tries = 0; tries < 500 && !ok(out); tries++) out = shuffle(cards, rng);
  return out;
}

/** `n` of `things` whose emoji isn't already on the Board, at random. */
function take(things: readonly KindThing[], n: number, used: Set<string>, rng: Rng): KindThing[] {
  const picked = shuffle(things.filter((t) => !used.has(t.emoji)), rng).slice(0, n);
  for (const t of picked) used.add(t.emoji);
  return picked;
}

/**
 * The deals of a Topic's Scope on a Board, one per call: each item of the Scope comes up once before any
 * comes again, and on Kinds two groups that overlap (animals and birds) share a Board only when the Scope
 * leaves no other way.
 */
export function deals(topic: Topic, scope: readonly string[], board: Board, rng: Rng = Math.random): () => Deal {
  const count = BOARD_GROUPS[board];
  const size = BOARD_SIZE[board];
  // Same's groups are pictures, drawn one at a time from the Scope's pools in turn, so one pool is enough.
  if (scope.length < (topic === 'same' ? 1 : count)) throw new Error(`Go Together: a Board of ${board} needs ${count} in the Scope`);
  const apart = topic === 'kinds' ? (a: string, b: string) => overlap(a as Group, b as Group) : undefined;
  const next = binsFrom(scope, rng, topic === 'same' ? 1 : count, apart);
  const items = () => (topic === 'same' ? Array.from({ length: count }, () => next()[0]!) : next());
  return () => {
    const used = new Set<string>();
    const groups: { key: string; word: string }[] = [];
    const cards: Card[] = [];
    for (const item of items()) {
      if (topic === 'same') {
        const [thing] = take(membersOf(item as Pool), 1, used, rng);
        groups.push({ key: thing!.emoji, word: thing!.name });
        for (let i = 0; i < size; i++) cards.push({ ...thing!, group: thing!.emoji });
      } else if (topic === 'colors') {
        const colour = item as Colour;
        groups.push({ key: colour, word: colour });
        for (const emoji of shuffle(COLOUR_THINGS[colour], rng).slice(0, size)) cards.push({ emoji, name: colour, group: colour });
      } else {
        const group = item as Group;
        groups.push({ key: group, word: GROUP_WORDS[group] });
        // Clear members only: the youngest sort by parts, and a boat has no wheels.
        for (const thing of take(membersOf(group), size, used, rng)) cards.push({ ...thing, group });
      }
    }
    return { topic, board, groups, cards: laidOut(cards, board, rng) };
  };
}

// ---- Picking, tap by tap ------------------------------------------------------------------------------

/** Where a Board stands: which Cards are up (the first is the lead), Misses since the last gather, groups gathered. */
export interface Picking {
  lifted: readonly number[];
  misses: number;
  found: readonly string[];
}

export const fresh: Picking = { lifted: [], misses: 0, found: [] };

/** Misses in one gather before the rest of the group gathers by itself: the site's rule. */
export const MISSES_BEFORE_GATHER = 2;

export type Outcome =
  | { kind: 'nothing' }
  | { kind: 'lift' }
  | { kind: 'drop' }
  /** A Card outside the lead's group. `glow`: the rest of the group lights up. `gather`: they gather by themselves. */
  | { kind: 'miss'; group: string; help: 'glow' | 'gather' }
  /** The group is whole. `child`: she lifted its last Card. `help`: after two Misses. `last`: the one group left, on its first tap. */
  | { kind: 'gather'; group: string; by: 'child' | 'help' | 'last' };

/** The lead: the first Card lifted, whose group is being collected. */
export const leadOf = (deal: Deal, state: Picking): string | undefined =>
  state.lifted.length ? deal.cards[state.lifted[0]!]!.group : undefined;

/** The Cards of `group` not yet lifted, by index. */
export const restOf = (deal: Deal, state: Picking, group: string): number[] =>
  deal.cards.flatMap((c, i) => (c.group === group && !state.lifted.includes(i) ? [i] : []));

export const done = (deal: Deal, state: Picking): boolean => state.found.length === deal.groups.length;

const gathered = (state: Picking, group: string): Picking => ({ lifted: [], misses: 0, found: [...state.found, group] });

/** One tap on the Card at `index`. */
export function tap(deal: Deal, state: Picking, index: number): { state: Picking; outcome: Outcome } {
  const card = deal.cards[index]!;
  if (state.found.includes(card.group)) return { state, outcome: { kind: 'nothing' } };
  if (state.lifted.includes(index)) return { state: { ...state, lifted: state.lifted.filter((i) => i !== index) }, outcome: { kind: 'drop' } };
  const lead = leadOf(deal, state);
  if (lead === undefined) {
    if (state.found.length === deal.groups.length - 1) return { state: gathered(state, card.group), outcome: { kind: 'gather', group: card.group, by: 'last' } };
    return { state: { ...state, lifted: [index] }, outcome: { kind: 'lift' } };
  }
  if (card.group === lead) {
    const lifted = [...state.lifted, index];
    if (lifted.length === BOARD_SIZE[deal.board]) return { state: gathered(state, lead), outcome: { kind: 'gather', group: lead, by: 'child' } };
    return { state: { ...state, lifted }, outcome: { kind: 'lift' } };
  }
  const misses = state.misses + 1;
  if (misses >= MISSES_BEFORE_GATHER) return { state: gathered(state, lead), outcome: { kind: 'miss', group: lead, help: 'gather' } };
  return { state: { ...state, misses }, outcome: { kind: 'miss', group: lead, help: 'glow' } };
}
