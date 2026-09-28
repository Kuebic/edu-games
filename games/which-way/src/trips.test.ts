import { describe, expect, it } from 'vitest';
import { fieldOf, trips, type Arrow } from './trips';

/** A repeatable random source. */
function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

const take = (next: () => Arrow, n: number) => Array.from({ length: n }, next);

describe('Trips', () => {
  it('bring every Arrow in the Scope once before any comes again', () => {
    for (let seed = 1; seed < 20; seed++) {
      const all = take(trips(['left', 'up', 'down', 'right'], seeded(seed)), 12);
      for (let i = 0; i < 12; i += 4) expect([...all.slice(i, i + 4)].sort()).toEqual(['down', 'left', 'right', 'up']);
    }
  });

  it('never bring the same Arrow three times running', () => {
    for (let seed = 1; seed < 50; seed++) {
      const all = take(trips(['left', 'right'], seeded(seed)), 40);
      for (let i = 2; i < all.length; i++) expect(all[i] === all[i - 1] && all[i] === all[i - 2], `seed ${seed} at ${i}`).toBe(false);
    }
  });

  it('only bring the Scope’s Arrows, and repeat a Scope of one', () => {
    expect(new Set(take(trips(['up', 'down'], seeded(3)), 20))).toEqual(new Set(['up', 'down']));
    expect(take(trips(['right'], seeded(3)), 3)).toEqual(['right', 'right', 'right']);
  });

  it('need at least one Arrow', () => {
    expect(() => trips([])).toThrow(/no Arrows/);
  });
});

describe('the field', () => {
  it('has room only for the directions in the Scope', () => {
    expect(fieldOf(['left', 'right'])).toEqual({ cols: 5, rows: 1 });
    expect(fieldOf(['up'])).toEqual({ cols: 1, rows: 5 });
    expect(fieldOf(['left', 'down'])).toEqual({ cols: 5, rows: 5 });
  });
});
