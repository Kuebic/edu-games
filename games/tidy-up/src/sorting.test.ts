import { describe, expect, it } from 'vitest';
import { COLOURS, GREY, PAINT, SHAPES, THINGS, lookFor, rounds, type Round, type Sort } from './sorting';

/** A seeded random, so a failure can be run again. */
function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 2 ** 32;
    return s / 2 ** 32;
  };
}

const many = (next: () => Round, n = 50) => Array.from({ length: n }, next);
const runs = (round: Round) => round.pile.map((t) => t.sort);

describe('a Round', () => {
  it('has a Bin for each item of a Scope of two or three', () => {
    for (let seed = 1; seed < 20; seed++) {
      expect(rounds('colors', ['red', 'blue'], 'blocks', seeded(seed))().bins.toSorted()).toEqual(['blue', 'red']);
      expect(rounds('shapes', ['circle', 'square', 'star'], 'plain', seeded(seed))().bins.toSorted()).toEqual(['circle', 'square', 'star']);
    }
  });

  it('has three Bins at most, and goes round a bigger Scope, each once before any again', () => {
    const next = rounds('colors', COLOURS, 'blocks', seeded(7));
    const seen = many(next, 7).flatMap((r) => r.bins);
    for (const r of many(next)) expect(new Set(r.bins).size).toBe(3);
    // Seven Rounds of three take 21 draws from a bag of seven: three full turns.
    for (const c of COLOURS) expect(seen.filter((s) => s === c).length).toBeGreaterThanOrEqual(2);
  });

  it('has a Pile of four for each of two Bins, or three for each of three', () => {
    const two = rounds('colors', ['red', 'blue'], 'blocks', seeded(3))();
    expect(two.pile).toHaveLength(8);
    expect(runs(two).filter((s) => s === 'red')).toHaveLength(4);
    const three = rounds('shapes', SHAPES, 'plain', seeded(3))();
    expect(three.pile).toHaveLength(9);
    for (const bin of three.bins) expect(runs(three).filter((s) => s === bin)).toHaveLength(3);
  });

  it('never sends three Things in a row to the same Bin', () => {
    for (let seed = 1; seed < 60; seed++) {
      for (const r of many(rounds('colors', ['red', 'blue'], 'things', seeded(seed)), 5)) {
        const s = runs(r);
        expect(s.some((x, i) => i >= 2 && x === s[i - 1] && x === s[i - 2]), s.join(' ')).toBe(false);
      }
    }
  });

  it('draws Blocks, a Thing once at most, or shapes in grey or in colors', () => {
    const blocks = rounds('colors', ['red', 'blue'], 'blocks', seeded(5))();
    expect(blocks.pile.every((t) => t.look === 'block')).toBe(true);

    for (let seed = 1; seed < 20; seed++) {
      const things = rounds('colors', COLOURS, 'things', seeded(seed))();
      const emoji = things.pile.map((t) => (t.look === 'emoji' ? t.emoji : ''));
      expect(new Set(emoji).size).toBe(emoji.length);
      for (const t of things.pile) if (t.look === 'emoji') expect(THINGS[t.sort]).toContain(t.emoji);
    }

    const plain = rounds('shapes', ['circle', 'square'], 'plain', seeded(5))();
    expect(plain.pile.every((t) => t.look === 'shape' && t.paint === GREY)).toBe(true);
    const colorful = rounds('shapes', ['circle', 'square'], 'colorful', seeded(5))();
    for (const t of colorful.pile) expect(Object.values(PAINT)).toContain(t.look === 'shape' ? t.paint : undefined);
  });

  it('needs a Scope of two', () => {
    expect(() => rounds('colors', ['red'], 'blocks')).toThrow(/two/);
  });
});

describe('Things', () => {
  it('sit under one color each, with enough for a Bin of four', () => {
    const all = Object.values(THINGS).flat();
    expect(new Set(all).size).toBe(all.length);
    for (const c of COLOURS) expect(THINGS[c].length).toBeGreaterThanOrEqual(4);
  });
});

describe('the card', () => {
  it('asks for something of a Bin’s color or shape', () => {
    expect(lookFor('red')).toBe('Find something red at home!');
    expect(lookFor('circle')).toBe('Find something round at home!');
    const all: Sort[] = [...COLOURS, ...SHAPES];
    for (const s of all) expect(lookFor(s)).toMatch(/^Find .+ at home!$/);
  });
});
