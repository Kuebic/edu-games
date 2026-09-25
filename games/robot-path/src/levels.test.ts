import { describe, expect, it } from 'vitest';
import { levelProblems } from './game/check';
import { LEVELS_PER_WORLD, WORLDS } from './levels';

describe('levels', () => {
  it(`has ${WORLDS.length} Worlds of ${LEVELS_PER_WORLD} Levels, numbered in order`, () => {
    WORLDS.forEach((world, w) => {
      expect(world.levels).toHaveLength(LEVELS_PER_WORLD);
      world.levels.forEach((level, i) => expect([level.world, level.index]).toEqual([w + 1, i + 1]));
    });
  });

  WORLDS.forEach((world) => {
    describe(`world ${world.levels[0]!.world}: ${world.name}`, () => {
      it.each(world.levels.map((level) => [level.id, level] as const))('%s passes the validator', (_, level) => {
        expect(levelProblems(level)).toEqual([]);
      });
    });
  });

  it('never repeats a Level', () => {
    const boards = WORLDS.flatMap((world) => world.levels.map((level) => JSON.stringify([level.grid, level.items, level.start])));
    expect(new Set(boards).size).toBe(boards.length);
  });
});
