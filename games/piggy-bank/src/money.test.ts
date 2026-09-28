import { describe, expect, it } from 'vitest';
import { ASKS, bankAt, findRounds, LABELS, MONEY, SIZE_MM, sortRounds, type Money } from './money';

/** A seeded random, so every run deals the same Rounds. */
function seeded(seed = 7): () => number {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

const count = (list: readonly Money[], m: Money) => list.filter((x) => x === m).length;
const threeInARow = (list: readonly Money[]) => list.some((m, i) => i >= 2 && m === list[i - 1] && m === list[i - 2]);

describe('the Money', () => {
  it('draws the coins at their true sizes: the dime smallest, then the penny, the nickel and the quarter', () => {
    const coins = MONEY.filter((m) => m !== 'dollar');
    expect([...coins].sort((a, b) => SIZE_MM[a] - SIZE_MM[b])).toEqual(['dime', 'penny', 'nickel', 'quarter']);
  });

  it('has a grown-up label for each, and a word the child hears that is only its name', () => {
    expect(MONEY.map((m) => LABELS[m])).toEqual(['1¢', '5¢', '10¢', '25¢', '$1']);
  });
});

describe('Sort Rounds', () => {
  it('have a Bank per kind up to three, each kind once before any comes again', () => {
    const next = sortRounds(['penny', 'nickel', 'dime', 'quarter', 'dollar'], seeded());
    const first = next().banks, second = next().banks;
    expect(first).toHaveLength(3);
    expect(new Set([...first, ...second.slice(0, 2)]).size).toBe(5);
  });

  it('fill a Purse of 8 for 2 Banks and 9 for 3, even per Bank, never three in a row', () => {
    for (const scope of [['penny', 'quarter'], ['penny', 'dime', 'quarter']] as Money[][]) {
      const next = sortRounds(scope, seeded(3));
      for (let i = 0; i < 20; i++) {
        const { banks, purse } = next();
        expect(purse).toHaveLength(banks.length === 2 ? 8 : 9);
        for (const b of banks) expect(count(purse, b)).toBe(banks.length === 2 ? 4 : 3);
        expect(threeInARow(purse)).toBe(false);
      }
    }
  });

  it('need two kinds', () => {
    expect(() => sortRounds(['penny'])).toThrow();
  });
});

describe('Find Rounds', () => {
  it('lay out one of each kind and ask six times, spread over the kinds, never three in a row', () => {
    const next = findRounds(['penny', 'dime', 'quarter', 'dollar'], seeded(11));
    for (let i = 0; i < 20; i++) {
      const { kinds, asks } = next();
      expect(kinds).toHaveLength(3);
      expect(new Set(kinds).size).toBe(3);
      expect(asks).toHaveLength(ASKS);
      for (const k of kinds) expect(count(asks, k)).toBe(2);
      expect(threeInARow(asks)).toBe(false);
    }
  });
});

describe('where a finger lets go', () => {
  const area = { left: 0, top: 0, width: 300, height: 600 };
  it('is a Bank in the lower half, by column', () => {
    expect(bankAt({ x: 10, y: 500 }, area, 3)).toBe(0);
    expect(bankAt({ x: 150, y: 400 }, area, 3)).toBe(1);
    expect(bankAt({ x: 299, y: 599 }, area, 2)).toBe(1);
  });

  it('is nothing in the top half, where a piece just stays', () => {
    expect(bankAt({ x: 150, y: 200 }, area, 2)).toBeUndefined();
  });
});
