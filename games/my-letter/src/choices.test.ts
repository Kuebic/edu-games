import { describe, expect, it } from 'vitest';
import { FINDS, makeFinds, type Find } from './choices';
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
const other = (find: Find) => find.choices.find((c) => c !== find.letter)!;
const side = (find: Find) => find.choices.indexOf(find.letter);

describe('a Level’s Finds', () => {
  it('are four, each of the Level’s letter and one other', () => {
    const finds = makeFinds('S', ['A', 'M'], seeded(1));
    expect(finds).toHaveLength(FINDS);
    for (const find of finds) {
      expect(find.letter).toBe('S');
      expect(find.choices).toHaveLength(2);
      expect(find.choices.filter((c) => c === 'S')).toHaveLength(1);
    }
  });

  it('never offer a letter that Looks alike, or the letter itself, for any letter', () => {
    for (let seed = 0; seed < 40; seed++) {
      for (const target of ALPHABET) {
        const met = ALPHABET.filter((l) => l < target);
        for (const find of makeFinds(target, met, seeded(seed))) {
          expect(other(find)).not.toBe(target);
          expect(looksAlike(other(find), target), `${target} with ${other(find)}`).toBe(false);
        }
      }
    }
  });

  it('offer a Met letter when one qualifies', () => {
    for (let seed = 0; seed < 20; seed++) {
      for (const find of makeFinds('S', ['A', 'M', 'Z'], seeded(seed))) expect(['A', 'M', 'Z']).toContain(other(find));
    }
  });

  it('pass over Met letters that Look alike or are the letter itself', () => {
    for (let seed = 0; seed < 20; seed++) {
      for (const find of makeFinds('B', ['B', 'D', 'P', 'A'], seeded(seed))) expect(other(find)).toBe('A');
    }
  });

  it('fall back to any capital that qualifies when no Met letter does', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 40; seed++) for (const find of makeFinds('B', ['D', 'P', 'R'], seeded(seed))) seen.add(other(find));
    for (const l of 'BPRD') expect(seen.has(l)).toBe(false);
    expect(seen.size).toBeGreaterThan(10);
  });

  it('don’t offer the same other letter twice running when there’s a choice', () => {
    for (let seed = 0; seed < 20; seed++) {
      const others = makeFinds('S', ['A', 'M'], seeded(seed)).map(other);
      for (let i = 1; i < others.length; i++) expect(others[i]).not.toBe(others[i - 1]);
      const fallback = makeFinds('S', [], seeded(seed)).map(other);
      for (let i = 1; i < fallback.length; i++) expect(fallback[i]).not.toBe(fallback[i - 1]);
    }
  });

  it('put the letter on a random side, never the same side more than twice in a row', () => {
    const sides = new Set<number>();
    for (let seed = 0; seed < 200; seed++) {
      const run = makeFinds('S', ['A'], seeded(seed)).map(side);
      for (let i = 2; i < run.length; i++) expect(run[i - 2] === run[i - 1] && run[i - 1] === run[i], run.join('')).toBe(false);
      run.forEach((s) => sides.add(s));
    }
    expect(sides).toEqual(new Set([0, 1]));
    // Always the same side from the source: still turned round on the third.
    expect(makeFinds('S', ['A'], () => 0).map(side)).toEqual([0, 0, 1, 0]);
  });

  it('are the same from the same random source', () => {
    expect(makeFinds('K', ['S', 'A', 'M', 'B'], seeded(7))).toEqual(makeFinds('K', ['S', 'A', 'M', 'B'], seeded(7)));
  });
});
