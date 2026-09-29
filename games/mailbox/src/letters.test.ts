import { describe, expect, it } from 'vitest';
import { afterRound, ASKS, findRounds, hintOf, HINTED, LETTERS, lookAlike, lookFor, pairOf, RANGES, sortRounds, type Letter } from './letters';

/** A seeded random, so every run deals the same Rounds. */
function seeded(seed = 7): () => number {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

const count = (list: readonly Letter[], l: Letter) => list.filter((x) => x === l).length;
const threeInARow = (list: readonly Letter[]) => list.some((l, i) => i >= 2 && l === list[i - 1] && l === list[i - 2]);
const alikeIn = (letters: readonly Letter[]) => letters.some((a) => letters.some((b) => lookAlike(a, b)));

describe('the letters', () => {
  it('are a to z, shown to the grown-up as capital and lowercase', () => {
    expect(LETTERS).toHaveLength(26);
    expect(pairOf('g')).toBe('Gg');
  });

  it('fall in four Ranges, each letter in one, Same first and Tricky last', () => {
    expect(RANGES.map((r) => r.label)).toEqual(['Same', 'Close', 'Unlike', 'Tricky']);
    expect(RANGES.flatMap((r) => r.letters).sort()).toEqual([...LETTERS]);
    expect(HINTED).toEqual([...'aefhmnrtbdglq']);
  });

  it('look alike when a child mixes them up: the mirror letters, and capitals as My Letter keeps them apart', () => {
    for (const [a, b] of ['bd', 'pq', 'bp', 'nu', 'mw', 'il', 'ft', 'kx', 'ef', 'co']) expect(lookAlike(a!, b!), a! + b!).toBe(true);
    for (const [a, b] of ['ab', 'os', 'xz', 'kh']) expect(lookAlike(a!, b!), a! + b!).toBe(false);
    expect(lookAlike('b', 'b')).toBe(false);
  });

  it('are looked for in a book after a Round, with "an" before a vowel sound', () => {
    expect(lookFor('a')).toBe('Find an a in a book together!');
    expect(lookFor('s')).toBe('Find an s in a book together!');
    expect(lookFor('b')).toBe('Find a b in a book together!');
    expect(lookFor('u')).toBe('Find a u in a book together!');
  });
});

describe('Sort Rounds', () => {
  it('have a Mailbox per letter up to three, each letter once before any comes again', () => {
    const next = sortRounds([...'cosvwxz'], seeded());
    const seen = Array.from({ length: 7 }, () => next().boxes);
    for (const boxes of seen) expect(boxes).toHaveLength(3);
    for (const l of 'cosvwxz') expect(count(seen.flat(), l)).toBe(3);
  });

  it('never put look-alikes side by side when the Scope leaves another way', () => {
    const next = sortRounds(LETTERS, seeded(5));
    for (let i = 0; i < 60; i++) expect(alikeIn(next().boxes)).toBe(false);
  });

  it('put b and d together only when the grown-up picks just them', () => {
    expect(sortRounds(['b', 'd'], seeded())().boxes.sort()).toEqual(['b', 'd']);
  });

  it('fill a Bag of 8 for 2 Mailboxes and 9 for 3, even per Mailbox, never three in a row', () => {
    for (const scope of [[...'os'], [...'osx']]) {
      const next = sortRounds(scope, seeded(3));
      for (let i = 0; i < 20; i++) {
        const { boxes, bag } = next();
        expect(bag).toHaveLength(boxes.length === 2 ? 8 : 9);
        for (const b of boxes) expect(count(bag, b)).toBe(boxes.length === 2 ? 4 : 3);
        expect(threeInARow(bag)).toBe(false);
      }
    }
  });

  it('need two letters', () => {
    expect(() => sortRounds(['a'])).toThrow();
  });
});

describe('Find Rounds', () => {
  it('lay out one of each letter and ask six times, spread over them, never three in a row', () => {
    const next = findRounds([...'aefhmnrt'], seeded(11));
    for (let i = 0; i < 20; i++) {
      const { kinds, asks } = next();
      expect(kinds).toHaveLength(3);
      expect(alikeIn(kinds)).toBe(false);
      expect(asks).toHaveLength(ASKS);
      for (const k of kinds) expect(count(asks, k)).toBe(2);
      expect(threeInARow(asks)).toBe(false);
    }
  });
});

describe('Hints', () => {
  it('show only for Unlike and Tricky letters, fading after one clean Round and gone after two', () => {
    expect(hintOf({}, 'o')).toBe(0);
    expect(hintOf({}, 'a')).toBeGreaterThan(hintOf({ a: 1 }, 'a'));
    expect(hintOf({ a: 1 }, 'a')).toBeGreaterThan(0);
    expect(hintOf({ a: 2 }, 'a')).toBe(0);
  });

  it('count a clean Round up, and start again after a Miss', () => {
    let learnt = afterRound({}, ['a', 'r'], new Set(['r']));
    expect(learnt).toEqual({ a: 1, r: 0 });
    learnt = afterRound(learnt, ['a', 'r'], new Set());
    learnt = afterRound(learnt, ['a', 'r'], new Set());
    expect(learnt).toEqual({ a: 2, r: 2 });
    expect(afterRound(learnt, ['a'], new Set(['a']))).toEqual({ a: 0, r: 2 });
  });
});
