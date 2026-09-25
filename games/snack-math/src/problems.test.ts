import { describe, expect, it } from 'vitest';
import { ROUND_LENGTH, STAGES, allProblems, answerChoices, makeRound } from './problems';

function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 2 ** 32;
    return seed / 2 ** 32;
  };
}

describe('allProblems', () => {
  it('add within 5 has no zeros and never exceeds 5', () => {
    const ps = allProblems('add', 5);
    expect(ps).toHaveLength(10);
    for (const p of ps) {
      expect(p.start).toBeGreaterThanOrEqual(1);
      expect(p.change).toBeGreaterThanOrEqual(1);
      expect(p.result).toBe(p.start + p.change);
      expect(p.result).toBeLessThanOrEqual(5);
    }
  });

  it('take-away within 10 always leaves at least one', () => {
    const ps = allProblems('take', 10);
    expect(ps).toHaveLength(45);
    for (const p of ps) {
      expect(p.start).toBeLessThanOrEqual(10);
      expect(p.change).toBeGreaterThanOrEqual(1);
      expect(p.result).toBe(p.start - p.change);
      expect(p.result).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('makeRound', () => {
  it.each(STAGES.map((s, i) => [i, s] as const))('stage %i gives five distinct fitting problems', (i, stage) => {
    for (let seed = 1; seed <= 50; seed++) {
      const round = makeRound(i, seeded(seed));
      expect(round).toHaveLength(ROUND_LENGTH);
      const keys = new Set(round.map((p) => `${p.op}${p.start},${p.change}`));
      expect(keys.size).toBe(ROUND_LENGTH);
      for (const p of round) {
        expect(stage.ops).toContain(p.op);
        expect(Math.max(p.start, p.result)).toBeLessThanOrEqual(stage.max);
      }
    }
  });

  it('mixed stages include both adding and taking away', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const ops = new Set(makeRound(2, seeded(seed)).map((p) => p.op));
      expect(ops).toEqual(new Set(['add', 'take']));
    }
  });
});

describe('answerChoices', () => {
  it.each([1, 2, 5, 9, 10])('for %i: three distinct choices within 1..10, near the answer', (result) => {
    for (let seed = 1; seed <= 30; seed++) {
      const choices = answerChoices(result, seeded(seed));
      expect(choices).toHaveLength(3);
      expect(new Set(choices).size).toBe(3);
      expect(choices).toContain(result);
      for (const c of choices) {
        expect(c).toBeGreaterThanOrEqual(1);
        expect(c).toBeLessThanOrEqual(10);
        expect(Math.abs(c - result)).toBeLessThanOrEqual(2);
      }
    }
  });

  it('does not always put the answer in the same spot', () => {
    const spots = new Set<number>();
    for (let seed = 1; seed <= 30; seed++) spots.add(answerChoices(4, seeded(seed)).indexOf(4));
    expect(spots.size).toBe(3);
  });
});
