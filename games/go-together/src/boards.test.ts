import { COLOUR_THINGS, membersOf, overlap, type Group } from '@shared/kinds';
import { describe, expect, it } from 'vitest';
import { BOARD_COLUMNS, BOARD_GROUPS, BOARD_SIZE, BOARDS, deals, EASY_KINDS, fresh, KIND_GROUPS, POOL_LIST, tap, type Deal, type Picking } from './boards';

/** A seeded random, so a failure can be run again. */
function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 2 ** 32;
    return s / 2 ** 32;
  };
}

const rows = (deal: Deal) => {
  const cols = BOARD_COLUMNS[deal.board];
  const out: string[][] = [];
  for (let i = 0; i < deal.cards.length; i += cols) out.push(deal.cards.slice(i, i + cols).map((c) => c.group));
  return out;
};
const byGroup = (deal: Deal, key: string) => deal.cards.filter((c) => c.group === key);

describe('the Boards', () => {
  it('are 4, 6, 9 and 16 Cards: 2 of 2, 2 of 3, 3 of 3 and 4 of 4, each group as wide as a row', () => {
    expect(BOARDS).toEqual([4, 6, 9, 16]);
    for (const b of BOARDS) {
      expect(BOARD_GROUPS[b] * BOARD_SIZE[b]).toBe(b);
      expect(BOARD_COLUMNS[b]).toBe(BOARD_SIZE[b]);
    }
    expect(BOARD_GROUPS).toEqual({ 4: 2, 6: 2, 9: 3, 16: 4 });
  });

  it('list the Kinds groups without mammals, animals first, and Easy as the first four', () => {
    expect(KIND_GROUPS).not.toContain('mammals');
    expect(KIND_GROUPS[0]).toBe('animals');
    expect(EASY_KINDS).toEqual(['animals', 'vehicles', 'food', 'clothes']);
    expect(POOL_LIST).toEqual(['animals', 'vehicles', 'food', 'clothes', 'toys', 'plants']);
  });
});

describe('a Kinds deal', () => {
  it('takes two groups of three from the Scope, each group once before any comes again', () => {
    const next = deals('kinds', EASY_KINDS, 6, seeded(1));
    const first = next(), second = next();
    expect(first.groups).toHaveLength(2);
    expect(first.cards).toHaveLength(6);
    for (const g of first.groups) {
      expect(byGroup(first, g.key)).toHaveLength(3);
      for (const c of byGroup(first, g.key)) expect(membersOf(g.key as Group).map((m) => m.emoji)).toContain(c.emoji);
    }
    expect([...first.groups, ...second.groups].map((g) => g.key).sort()).toEqual([...EASY_KINDS].sort());
    expect(first.groups.map((g) => g.word)).toEqual(first.groups.map((g) => g.key));
  });

  it('never puts overlapping groups, animals and birds, on one Board when the Scope has another way', () => {
    const next = deals('kinds', ['animals', 'birds', 'vehicles', 'clothes'], 6, seeded(2));
    for (let i = 0; i < 40; i++) {
      const keys = next().groups.map((g) => g.key as Group);
      expect(overlap(keys[0]!, keys[1]!), keys.join('+')).toBe(false);
    }
  });

  it('never fills a row with one group, and never shows one emoji twice', () => {
    for (const board of BOARDS) {
      const next = deals('kinds', KIND_GROUPS, board, seeded(board));
      for (let i = 0; i < 30; i++) {
        const deal = next();
        for (const row of rows(deal)) expect(new Set(row).size, `${board}: ${row.join(' ')}`).toBeGreaterThan(1);
        expect(new Set(deal.cards.map((c) => c.emoji)).size).toBe(board);
      }
    }
  });

  it('needs as many groups in the Scope as the Board has', () => {
    expect(() => deals('kinds', ['animals'], 6, seeded(3))).toThrow(/Scope/);
    expect(() => deals('kinds', ['animals', 'vehicles'], 9, seeded(3))).toThrow(/Scope/);
  });
});

describe('a Colors deal', () => {
  it('gives each color its own everyday things, and says the color', () => {
    const deal = deals('colors', ['red', 'blue', 'yellow'], 9, seeded(4))();
    expect(deal.groups).toHaveLength(3);
    for (const g of deal.groups) {
      expect(g.word).toBe(g.key);
      for (const c of byGroup(deal, g.key)) expect(COLOUR_THINGS[g.key as 'red']).toContain(c.emoji);
    }
  });
});

describe('a Same deal', () => {
  it('makes each group the one picture, over and over, and says its name', () => {
    const deal = deals('same', ['animals', 'vehicles'], 4, seeded(5))();
    expect(deal.groups).toHaveLength(2);
    for (const g of deal.groups) {
      const cards = byGroup(deal, g.key);
      expect(cards).toHaveLength(2);
      expect(new Set(cards.map((c) => c.emoji)).size).toBe(1);
      expect(g.word).toBe(cards[0]!.name);
    }
    expect(deal.groups[0]!.key).not.toBe(deal.groups[1]!.key);
  });

  it('takes a picture from each pool in turn, so one pool never gives the whole Board', () => {
    const deal = deals('same', ['animals', 'vehicles'], 16, seeded(6))();
    const animals = membersOf('animals').map((m) => m.emoji);
    const fromAnimals = deal.groups.filter((g) => animals.includes(byGroup(deal, g.key)[0]!.emoji)).length;
    expect(fromAnimals).toBe(2);
  });
});

describe('picking', () => {
  /** A fixed Board: a b a b / b a (6 Cards, groups a and b of 3). */
  const deal: Deal = {
    topic: 'kinds',
    board: 6,
    groups: [
      { key: 'a', word: 'animals' },
      { key: 'b', word: 'vehicles' },
    ],
    cards: ['a', 'b', 'a', 'b', 'b', 'a'].map((group, i) => ({ emoji: `${group}${i}`, name: group, group })),
  };
  const play = (taps: number[], from: Picking = fresh) => taps.reduce(({ state }, i) => tap(deal, state, i), { state: from, outcome: { kind: 'nothing' } as ReturnType<typeof tap>['outcome'] });

  it('lifts the first Card, which leads, and puts a lifted Card down on a second tap', () => {
    const one = tap(deal, fresh, 0);
    expect(one.outcome).toEqual({ kind: 'lift' });
    expect(one.state.lifted).toEqual([0]);
    const two = tap(deal, one.state, 0);
    expect(two.outcome).toEqual({ kind: 'drop' });
    expect(two.state.lifted).toEqual([]);
  });

  it('gathers the group when its last Card is lifted', () => {
    const { state, outcome } = play([0, 2, 5]);
    expect(outcome).toEqual({ kind: 'gather', group: 'a', by: 'child' });
    expect(state.found).toEqual(['a']);
    expect(state.lifted).toEqual([]);
  });

  it('misses a Card outside the lead’s group: the first glows the rest, the second gathers them by itself', () => {
    const one = play([0, 1]);
    expect(one.outcome).toEqual({ kind: 'miss', group: 'a', help: 'glow' });
    expect(one.state.lifted).toEqual([0]);
    const two = tap(deal, one.state, 3);
    expect(two.outcome).toEqual({ kind: 'miss', group: 'a', help: 'gather' });
    expect(two.state.found).toEqual(['a']);
    expect(two.state.lifted).toEqual([]);
    expect(two.state.misses).toBe(0);
  });

  it('starts counting Misses again after a gather', () => {
    const { state } = play([0, 1, 2, 5]);
    expect(state.found).toEqual(['a']);
    expect(state.misses).toBe(0);
  });

  it('gathers the last group on its first tap, since there is nothing to pick it from', () => {
    const { state, outcome } = play([0, 2, 5, 1]);
    expect(outcome).toEqual({ kind: 'gather', group: 'b', by: 'last' });
    expect(state.found).toEqual(['a', 'b']);
  });

  it('ignores a Card already gathered, and a lifted lead passes to the next lifted Card when put down', () => {
    const { state, outcome } = play([0, 2, 5, 0]);
    expect(outcome).toEqual({ kind: 'nothing' });
    expect(state.found).toEqual(['a']);
    const handed = play([0, 2, 0]);
    expect(handed.state.lifted).toEqual([2]);
    expect(tap(deal, handed.state, 1).outcome).toEqual({ kind: 'miss', group: 'a', help: 'glow' });
  });
});
