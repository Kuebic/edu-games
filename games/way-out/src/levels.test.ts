import { describe, expect, it } from 'vitest';
import { canonical } from './game/board';
import { measure } from './game/measure';
import { LEVELS } from './levels';
import { LEVELS_PER_PACK, PACKS, puzzleProblems, showsNeed } from './packs';
import { POOLS } from './pools';

describe('levels', () => {
  it('has every Pack, each with its full set of Levels in order', () => {
    PACKS.forEach((_, i) => {
      const pack = LEVELS.filter((l) => l.pack === i + 1);
      expect(pack.map((l) => l.index)).toEqual(Array.from({ length: LEVELS_PER_PACK }, (_, n) => n + 1));
      for (const l of pack) expect(l.id).toBe(`p${l.pack}-${String(l.index).padStart(2, '0')}`);
    });
    expect(LEVELS).toHaveLength(PACKS.length * LEVELS_PER_PACK);
  });

  PACKS.forEach((spec, i) => {
    describe(`pack ${i + 1}: ${spec.name}`, () => {
      const levels = LEVELS.filter((l) => l.pack === i + 1);

      for (const level of levels) {
        it(`level ${level.index} is valid, has the right par, and keeps to the pack`, () => {
          expect(puzzleProblems(level.board, level.par, spec)).toEqual([]);
        });
      }

      if (spec.needs) {
        it(`shows ${spec.needs} at least once`, () => {
          expect(levels.some((l) => showsNeed(measure(l.board), spec.needs!))).toBe(true);
        });
      }

      it('has a pool of puzzles that all keep to the pack', () => {
        const pool = POOLS[i]!;
        expect(pool.length).toBeGreaterThanOrEqual(100);
        const bad = pool.filter(([board, par]) => puzzleProblems(board, par, spec).length > 0);
        expect(bad).toEqual([]);
      });
    });
  });

  it('starts with one car in the way', () => {
    const first = measure(LEVELS[0]!.board);
    expect(first).toMatchObject({ par: 2, vehicles: 2, depth: 1 });
  });

  it('never repeats a board, in the Levels or the Pools', () => {
    const boards = [...LEVELS.map((l) => l.board), ...POOLS.flat().map(([board]) => board)].map(canonical);
    expect(new Set(boards).size).toBe(boards.length);
  });
});
