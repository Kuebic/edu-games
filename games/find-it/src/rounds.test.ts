import { describe, expect, it } from 'vitest';
import {
  BOXES, LETTER_RANGES, NUMBER_RANGES, PICTURES, ROUND_LENGTH, letterChoices, makeRound, numberChoices, pictureChoices,
} from './rounds';

function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 2 ** 32;
    return seed / 2 ** 32;
  };
}

describe('the Boxes', () => {
  it('are Numbers, two Rounds up to 20, then Letters, five Rounds up to Z', () => {
    expect(BOXES.map((b) => [b.name, b.rounds])).toEqual([['Numbers', 2], ['Letters', 5]]);
    expect(NUMBER_RANGES).toEqual([{ lo: 0, hi: 10 }, { lo: 11, hi: 20 }]);
    expect(LETTER_RANGES.join('')).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  });

  it('have a picture for every letter, filed under the letter its word starts with', () => {
    for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') expect(PICTURES.some((p) => p.letter === letter), letter).toBe(true);
    for (const p of PICTURES) expect(p.word[0]!.toUpperCase(), p.word).toBe(p.letter);
    expect(new Set(PICTURES.map((p) => p.word)).size).toBe(PICTURES.length);
  });
});

describe('numberChoices', () => {
  it('are the target and two different neighbours from the Round, in some order', () => {
    const rng = seeded(1);
    for (const range of NUMBER_RANGES) {
      for (let target = range.lo; target <= range.hi; target++) {
        const choices = numberChoices(target, range, rng);
        expect(choices).toHaveLength(3);
        expect(choices).toContain(target);
        expect(new Set(choices).size).toBe(3);
        for (const c of choices) {
          expect(Math.abs(c - target)).toBeLessThanOrEqual(2);
          expect(c).toBeGreaterThanOrEqual(range.lo);
          expect(c).toBeLessThanOrEqual(range.hi);
        }
      }
    }
  });

  it('never go below 0 or above 20 when a range is too narrow', () => {
    expect(numberChoices(0, { lo: 0, hi: 0 }).sort()).toEqual([0, 1, 2]);
    expect(numberChoices(20, { lo: 20, hi: 20 }).sort()).toEqual([18, 19, 20]);
  });
});

describe('letterChoices and pictureChoices', () => {
  it('stay inside the Round and include the target once', () => {
    const rng = seeded(7);
    for (const letters of LETTER_RANGES) {
      for (const letter of letters) {
        const choices = letterChoices(letter, letters, rng);
        expect(new Set(choices).size).toBe(3);
        expect(choices).toContain(letter);
        for (const c of choices) expect(letters).toContain(c);
        const pictures = pictureChoices(letter, letters, rng);
        expect(pictures.filter((p) => p.letter === letter)).toHaveLength(1);
        expect(new Set(pictures.map((p) => p.letter)).size).toBe(3);
        for (const p of pictures) expect(letters).toContain(p.letter);
      }
    }
  });
});

describe('makeRound', () => {
  it('asks six Finds of different numbers from the Round, each way round in turn on Mix', () => {
    const finds = makeRound(0, 1, 'mix', seeded(3));
    expect(finds).toHaveLength(ROUND_LENGTH);
    const targets = finds.map((f) => (f.kind === 'number' ? f.target : NaN));
    expect(new Set(targets).size).toBe(ROUND_LENGTH);
    for (const t of targets) expect(t >= 11 && t <= 20).toBe(true);
    expect(finds.map((f) => f.direction)).toEqual(['find-symbol', 'find-picture', 'find-symbol', 'find-picture', 'find-symbol', 'find-picture']);
  });

  it('asks every Find the one Way round a grown-up picked', () => {
    for (const box of [0, 1]) {
      for (const way of ['find-symbol', 'find-picture'] as const) {
        const finds = makeRound(box, 0, way, seeded(11));
        expect(finds.map((f) => f.direction)).toEqual(Array(ROUND_LENGTH).fill(way));
      }
    }
  });

  it('asks about zero in the first Round of Numbers, and nothing past 10', () => {
    const seen = new Set<number>();
    for (let seed = 1; seed < 400; seed += 7) for (const f of makeRound(0, 0, 'mix', seeded(seed))) if (f.kind === 'number') seen.add(f.target);
    expect(seen.has(0)).toBe(true);
    for (const n of seen) expect(n >= 0 && n <= 10, String(n)).toBe(true);
  });

  it('asks every letter of the Round at least once, with a matching picture', () => {
    const finds = makeRound(1, 4, 'mix', seeded(5));
    expect(finds).toHaveLength(ROUND_LENGTH);
    const letters = new Set(finds.map((f) => (f.kind === 'letter' ? f.letter : '')));
    expect(letters).toEqual(new Set('UVWXYZ'));
    for (const f of finds) {
      if (f.kind !== 'letter') throw new Error('not a letter');
      expect(f.picture.letter).toBe(f.letter);
      if (f.direction === 'find-symbol') expect(f.choices).toContain(f.letter);
      else expect(f.choices).toContain(f.picture);
    }
  });

  it('refuses a Box or Round it has not got', () => {
    expect(() => makeRound(2, 0)).toThrow(/no Box 2/);
    expect(() => makeRound(0, 2)).toThrow(/no Round 2/);
    expect(() => makeRound(1, 5)).toThrow(/no Round 5/);
  });
});
