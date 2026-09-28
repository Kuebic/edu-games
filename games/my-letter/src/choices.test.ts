import { describe, expect, it } from 'vitest';
import { CHOICES, NEW_LETTER_FINDS, newLetterFinds, otherChoices, spellTiles, type Find } from './choices';
import { looksAlike } from './letters';

/** A seeded random source (mulberry32), so a run can be played again. */
function seeded(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ALPHABET = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
const others = (find: Find) => find.choices.filter((c) => c !== find.letter);
const slot = (find: Find) => find.choices.indexOf(find.letter);

/** Every Find is the letter once and two others, none of them Looking alike it. */
function expectFair(find: Find): void {
  expect(find.choices).toHaveLength(CHOICES);
  expect(new Set(find.choices).size, find.choices.join('')).toBe(CHOICES);
  expect(find.choices).toContain(find.letter);
  for (const o of others(find)) expect(looksAlike(o, find.letter), `${find.letter} with ${o}`).toBe(false);
}

describe('the other Choices', () => {
  it('never are the letter itself or Look alike it, for any letter', () => {
    for (let seed = 0; seed < 40; seed++) {
      for (const target of ALPHABET) {
        const picked = otherChoices(target, [ALPHABET.filter((l) => l < target)], seeded(seed));
        expectFair({ letter: target, choices: [target, ...picked] });
      }
    }
  });

  it('come from the first tier that fits, then the next, then any capital', () => {
    for (let seed = 0; seed < 20; seed++) {
      expect(otherChoices('S', [['A'], ['M', 'Z']], seeded(seed))).toContain('A');
      expect(['M', 'Z']).toContain(otherChoices('S', [['A'], ['M', 'Z']], seeded(seed))[1]);
      // B, D and P Look alike B; only A is left from the tier, and the other is any capital that fits.
      const picked = otherChoices('B', [['B', 'D', 'P', 'A']], seeded(seed));
      expect(picked[0]).toBe('A');
      expect('BPRDA').not.toContain(picked[1]);
    }
  });
});

describe('a Spell’s Tiles', () => {
  it('are every capital of the word once, in a jumble', () => {
    const sorted = (tiles: string[]) => [...tiles].sort().join('');
    const orders = new Set<string>();
    for (let seed = 0; seed < 40; seed++) {
      expect(sorted(spellTiles('Sam', seeded(seed)))).toBe('AMS');
      expect(sorted(spellTiles('Anna', seeded(seed)))).toBe('AANN');
      expect(sorted(spellTiles('Zoë', seeded(seed)))).toBe('EOZ');
      orders.add(spellTiles('Kaia', seeded(seed)).join(''));
    }
    expect(orders.size).toBeGreaterThan(3);
    expect(spellTiles('', seeded(1))).toEqual([]);
  });

  it('never spell the word in its own order', () => {
    for (let seed = 0; seed < 200; seed++) {
      expect(spellTiles('Sam', seeded(seed)).join('')).not.toBe('SAM');
      expect(spellTiles('Anna', seeded(seed)).join('')).not.toBe('ANNA');
      expect(spellTiles('Al', seeded(seed)).join('')).toBe('LA');
    }
    // A random source that always leaves them where they are.
    expect(spellTiles('Sam', () => 0.999).join('')).not.toBe('SAM');
    expect(spellTiles('A', seeded(1))).toEqual(['A']);
    expect(spellTiles('Aa', seeded(1))).toEqual(['A', 'A']);
  });
});

describe('a New letters Level’s Finds', () => {
  it('ask for its letter first and once more, never twice running, and two Met letters', () => {
    const seconds = new Set<number>();
    for (let seed = 0; seed < 40; seed++) {
      const asked = newLetterFinds('K', ['S', 'A', 'M', 'B', 'D'], seeded(seed)).map((f) => f.letter);
      expect(asked).toHaveLength(NEW_LETTER_FINDS);
      expect(asked[0]).toBe('K');
      expect(asked.filter((l) => l === 'K')).toHaveLength(2);
      for (let i = 1; i < asked.length; i++) expect(asked[i] === 'K' && asked[i - 1] === 'K', asked.join('')).toBe(false);
      const met = asked.filter((l) => l !== 'K');
      expect(new Set(met).size).toBe(2);
      for (const l of met) expect(['S', 'A', 'M', 'B', 'D']).toContain(l);
      seconds.add(asked.lastIndexOf('K'));
    }
    expect(seconds).toEqual(new Set([2, 3]));
  });

  it('keep the Level’s letter among a Met letter’s Choices when it fits', () => {
    for (let seed = 0; seed < 20; seed++) {
      for (const find of newLetterFinds('K', ['S', 'A', 'M'], seeded(seed))) {
        expectFair(find);
        if (find.letter !== 'K') expect(find.choices).toContain('K');
      }
    }
  });

  it('ask for the Level’s letter instead when there are too few Met letters', () => {
    expect(newLetterFinds('B', [], seeded(3)).map((f) => f.letter)).toEqual(['B', 'B', 'B', 'B']);
    const asked = newLetterFinds('D', ['B'], seeded(3)).map((f) => f.letter);
    expect(asked.filter((l) => l === 'B')).toHaveLength(1);
    expect(asked.filter((l) => l === 'D')).toHaveLength(3);
  });

  it('are fair for every New letter, with or without a Name', () => {
    for (let seed = 0; seed < 20; seed++) {
      for (const letter of 'BDKPTVZJ') {
        for (const find of newLetterFinds(letter, ['S', 'A', 'M', 'B', 'D'], seeded(seed))) expectFair(find);
        for (const find of newLetterFinds(letter, [], seeded(seed))) expectFair(find);
      }
    }
  });
});

describe('the letter’s slot', () => {
  it('is random, but never the same slot a third time running', () => {
    const slots = new Set<number>();
    for (let seed = 0; seed < 200; seed++) {
      const run = newLetterFinds('K', ['S', 'A', 'M', 'B', 'D'], seeded(seed)).map(slot);
      for (let i = 2; i < run.length; i++) expect(run[i - 2] === run[i - 1] && run[i - 1] === run[i], run.join('')).toBe(false);
      run.forEach((s) => slots.add(s));
    }
    expect(slots).toEqual(new Set([0, 1, 2]));
    // Always the first slot from the source: still moved on the third.
    expect(newLetterFinds('K', ['S', 'A', 'M'], () => 0).map(slot)).toEqual([0, 0, 1, 0]);
  });

  it('is the same from the same random source', () => {
    expect(newLetterFinds('K', ['S', 'A', 'M', 'B'], seeded(7))).toEqual(newLetterFinds('K', ['S', 'A', 'M', 'B'], seeded(7)));
    expect(spellTiles('Kaia', seeded(7))).toEqual(spellTiles('Kaia', seeded(7)));
  });
});
