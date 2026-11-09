// What Tidy Up's Kinds Topic asks: Steps of groups sorted together, from animals and vehicles to mammals
// and birds. The groups and their Things are the site's. Pure, with the random source passed in, so it's
// tested as data (docs/kinds.md; research in docs/research/toddler-category-sorting.md).

import { POOLS, type Group, type KindThing } from '@shared/kinds';
import { PER_BIN, pileOf, shuffle, type Rng } from '@shared/sort';

// The groups, their members and their Words are the site's (@shared/kinds, site ADR 0018); Tidy Up adds its Steps.
export { GROUP_WORDS, POOLS, type Group, type KindThing } from '@shared/kinds';

/** A Kinds Scope item: groups sorted together, easiest first. */
export type Step = 'animals-vehicles' | 'food-clothes' | 'toys-clothes' | 'animals-clothes-food' | 'animals-plants' | 'animals-vehicles-plants' | 'birds-fish' | 'fruit-vegetables' | 'mammals-birds';

export const STEPS: readonly Step[] = [
  'animals-vehicles',
  'food-clothes',
  'toys-clothes',
  'animals-clothes-food',
  'animals-plants',
  'animals-vehicles-plants',
  'birds-fish',
  'fruit-vegetables',
  'mammals-birds',
];

/** Each Step's groups, in Bin order. */
export const STEP_GROUPS: Readonly<Record<Step, readonly Group[]>> = {
  'animals-vehicles': ['animals', 'vehicles'],
  'food-clothes': ['food', 'clothes'],
  'toys-clothes': ['toys', 'clothes'],
  'animals-clothes-food': ['animals', 'clothes', 'food'],
  'animals-plants': ['animals', 'plants'],
  'animals-vehicles-plants': ['animals', 'vehicles', 'plants'],
  'birds-fish': ['birds', 'fish'],
  'fruit-vegetables': ['fruit', 'vegetables'],
  'mammals-birds': ['mammals', 'birds'],
};

/** What a Scope button shows: a member of each group. */
export const STEP_CHIPS: Readonly<Record<Step, string>> = {
  'animals-vehicles': '🐕🚗',
  'food-clothes': '🍞👕',
  'toys-clothes': '🪀👕',
  'animals-clothes-food': '🐕👕🍞',
  'animals-plants': '🐕🌳',
  'animals-vehicles-plants': '🐕🚗🌳',
  'birds-fish': '🐦🐟',
  'fruit-vegetables': '🍎🥕',
  'mammals-birds': '🐕🐦',
};

/** The Easy Range: the first four Steps. */
export const EASY: readonly Step[] = STEPS.slice(0, 4);

/** Vehicles without wheels join from this Step on. */
const WIDE_FROM = STEPS.indexOf('animals-vehicles-plants');

/** Clear: textbook members only. Tricky: each Round swaps in one atypical member. */
export type KindsWay = 'clear' | 'tricky';
export const KINDS_WAYS: readonly KindsWay[] = ['clear', 'tricky'];

/** A Thing in a Round: which group it goes in, and what it is. */
export interface KindsPiece extends KindThing {
  group: Group;
  /** An atypical member, from the Tricky Way. */
  odd?: boolean;
}

export interface KindsRound {
  step: Step;
  bins: readonly Group[];
  pile: readonly KindsPiece[];
  /** Three small members for each crate's card, none of them in the Pile. */
  cards: Readonly<Partial<Record<Group, readonly KindThing[]>>>;
}

/** The members a group has in a Step, before any odd one. */
export function membersIn(group: Group, step: Step): readonly KindThing[] {
  const pool = POOLS[group];
  return STEPS.indexOf(step) >= WIDE_FROM ? [...pool.clear, ...(pool.wide ?? [])] : pool.clear;
}

/**
 * The Rounds of a Kinds Scope, one per call: each Step once, shuffled, before any comes again. A Round's
 * Bins are its Step's groups, each with four Things, or three when there are three Bins.
 */
export function kindsRounds(scope: readonly Step[], way: KindsWay, rng: Rng = Math.random): () => KindsRound {
  if (scope.length === 0) throw new Error('Tidy Up: Kinds needs a Step');
  let bag: Step[] = [];
  return () => {
    if (bag.length === 0) bag = shuffle(scope, rng);
    const step = bag.pop()!;
    const bins = STEP_GROUPS[step];
    const count = PER_BIN[bins.length]!;
    const cards: Partial<Record<Group, readonly KindThing[]>> = {};
    let pile: KindsPiece[] = [];
    for (const group of bins) {
      const members = shuffle(membersIn(group, step), rng);
      pile.push(...members.slice(0, count).map((m) => ({ ...m, group })));
      // The card shows other members, so it never gives away a Thing on the Pile; a group with too few
      // (only four fish emoji exist) fills it from the Pile.
      const rest = members.slice(count, count + 3);
      cards[group] = rest.length === 3 ? rest : [...rest, ...members.slice(0, 3 - rest.length)];
    }
    if (way === 'tricky') {
      const oddGroups = bins.filter((g) => POOLS[g].odd?.length);
      if (oddGroups.length) {
        const group = oddGroups[Math.floor(rng() * oddGroups.length)]!;
        const odd = shuffle(POOLS[group].odd!, rng)[0]!;
        const i = pile.findIndex((p) => p.group === group);
        pile[i] = { ...odd, group, odd: true };
      }
    }
    pile = pileOf(pile, (p) => p.group, rng);
    return { step, bins, pile, cards };
  };
}

/** The grown-up's card after a Round. */
export function kindsLookFor(group: Group): string {
  switch (group) {
    case 'animals':
      return 'Name an animal you saw today!';
    case 'vehicles':
      return 'Spot a vehicle out the window!';
    case 'plants':
      return 'Find a plant at home or outside!';
    case 'toys':
      return 'Find a toy at home!';
    case 'clothes':
      return 'Find something you wear!';
    case 'food':
      return 'Find some food in the kitchen!';
    case 'birds':
      return 'Name another bird!';
    case 'fish':
      return 'Name another fish!';
    case 'fruit':
      return 'Find a fruit at home!';
    case 'vegetables':
      return 'Find a vegetable at home!';
    case 'mammals':
      return 'Name another mammal! It has fur.';
  }
}
