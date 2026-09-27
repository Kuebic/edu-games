import { describe, expect, it } from 'vitest';
import {
  LETTERS, LETTER_RANGES, NUMBERS, NUMBER_RANGES, PICTURES, letterChoices, numberChoices, pictureChoices, practice, type Find,
} from './finds';

function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 2 ** 32;
    return seed / 2 ** 32;
  };
}

const item = (f: Find) => (f.kind === 'number' ? String(f.target) : f.letter);
const take = (next: () => Find, n: number) => Array.from({ length: n }, next);

describe('the Topics', () => {
  it('are the numbers 0 to 20 in two Ranges, and A to Z by fives', () => {
    expect(NUMBERS).toEqual(Array.from({ length: 21 }, (_, i) => String(i)));
    expect(NUMBER_RANGES.map((r) => [r[0], r.at(-1)])).toEqual([['0', '10'], ['11', '20']]);
    expect(LETTER_RANGES.flat()).toEqual(LETTERS);
    expect(LETTERS.join('')).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  });

  it('have a picture for every letter, filed under the letter its word starts with', () => {
    for (const letter of LETTERS) expect(PICTURES.some((p) => p.letter === letter), letter).toBe(true);
    for (const p of PICTURES) expect(p.word[0]!.toUpperCase(), p.word).toBe(p.letter);
    expect(new Set(PICTURES.map((p) => p.word)).size).toBe(PICTURES.length);
  });
});

describe('numberChoices', () => {
  it('are the target and two different neighbours 1 or 2 away, from 0 to 20', () => {
    const rng = seeded(1);
    for (let target = 0; target <= 20; target++) {
      const choices = numberChoices(target, NUMBERS, rng);
      expect(new Set(choices).size).toBe(3);
      expect(choices).toContain(target);
      for (const c of choices) {
        expect(Math.abs(c - target)).toBeLessThanOrEqual(2);
        expect(c >= 0 && c <= 20).toBe(true);
      }
    }
    expect(numberChoices(0, ['0']).sort()).toEqual([0, 1, 2]);
    expect(numberChoices(20, ['20']).sort((a, b) => a - b)).toEqual([18, 19, 20]);
  });

  it('take neighbours in the Scope first', () => {
    for (let seed = 1; seed < 30; seed++) expect(numberChoices(5, ['3', '5', '7'], seeded(seed)).sort()).toEqual([3, 5, 7]);
  });
});

describe('letterChoices and pictureChoices', () => {
  it('take the other letters from the Scope, the target once', () => {
    const rng = seeded(7);
    for (const scope of [...LETTER_RANGES, [...'AMZ']]) {
      for (const letter of scope) {
        const choices = letterChoices(letter, scope, rng);
        expect(new Set(choices).size).toBe(3);
        expect(choices).toContain(letter);
        for (const c of choices) expect(scope).toContain(c);
        const pictures = pictureChoices(letter, scope, rng);
        expect(pictures.filter((p) => p.letter === letter)).toHaveLength(1);
        expect(new Set(pictures.map((p) => p.letter)).size).toBe(3);
        for (const p of pictures) expect(scope).toContain(p.letter);
      }
    }
  });

  it('take the target’s nearest letters when the Scope is too small', () => {
    for (let seed = 1; seed < 30; seed++) {
      expect(letterChoices('A', ['A'], seeded(seed)).sort()).toEqual(['A', 'B', 'C']);
      const m = letterChoices('M', ['M', 'Q'], seeded(seed));
      expect(m).toContain('Q');
      expect(['L', 'N']).toContain(m.find((l) => l !== 'M' && l !== 'Q'));
    }
  });
});

describe('practice', () => {
  it('asks every item of the Scope once before any comes again, never the same twice running', () => {
    for (let seed = 1; seed < 40; seed++) {
      const asked = take(practice('letter', [...'ABCDE'], 'mix', seeded(seed)), 20).map(item);
      for (let pass = 0; pass < 4; pass++) expect(asked.slice(pass * 5, pass * 5 + 5).sort().join('')).toBe('ABCDE');
      for (let i = 1; i < asked.length; i++) expect(asked[i], asked.join('')).not.toBe(asked[i - 1]);
    }
  });

  it('asks only the Scope, even a mixed one, and the one item of a Scope of one', () => {
    const asked = new Set(take(practice('number', ['0', '7', '15'], 'mix', seeded(3)), 30).map(item));
    expect(asked).toEqual(new Set(['0', '7', '15']));
    expect(new Set(take(practice('letter', ['Q'], 'mix', seeded(3)), 5).map(item))).toEqual(new Set(['Q']));
  });

  it('takes turns each way round on Mix, and keeps to the one Way a grown-up picked', () => {
    const mix = take(practice('number', NUMBERS, 'mix', seeded(3)), 4).map((f) => f.direction);
    expect(mix).toEqual(['find-symbol', 'find-picture', 'find-symbol', 'find-picture']);
    for (const way of ['find-symbol', 'find-picture'] as const) {
      for (const topic of ['number', 'letter'] as const) {
        expect(take(practice(topic, topic === 'number' ? NUMBERS : LETTERS, way, seeded(11)), 6).map((f) => f.direction)).toEqual(Array(6).fill(way));
      }
    }
  });

  it('shows a picture that matches the letter, and offers the right one', () => {
    for (const f of take(practice('letter', LETTERS, 'mix', seeded(5)), 52)) {
      if (f.kind !== 'letter') throw new Error('not a letter');
      expect(f.picture.letter).toBe(f.letter);
      if (f.direction === 'find-symbol') expect(f.choices).toContain(f.letter);
      else expect(f.choices).toContain(f.picture);
    }
  });

  it('refuses an empty Scope, or one with nothing of its Topic', () => {
    expect(() => practice('letter', [])).toThrow(/nothing in the Scope/);
    expect(() => practice('number', ['A'])).toThrow(/nothing in the Scope/);
  });
});
