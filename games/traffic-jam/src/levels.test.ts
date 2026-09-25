import { describe, expect, it } from 'vitest';
import { CHAPTERS, LEVELS_PER_CHAPTER, levelProblems } from './chapters';
import { LEVELS } from './levels';

describe('levels', () => {
  it('has every Chapter, each with its full set of Levels', () => {
    expect(LEVELS).toHaveLength(CHAPTERS.length);
    for (const levels of LEVELS) expect(levels).toHaveLength(LEVELS_PER_CHAPTER);
  });

  CHAPTERS.forEach((spec, c) => {
    describe(`chapter ${c + 1}: ${spec.name}`, () => {
      LEVELS[c]!.forEach((level, i) => {
        it(`level ${i + 1} can be cleared and keeps to the chapter`, () => {
          expect(levelProblems(level, spec)).toEqual([]);
        });
      });
    });
  });

  it('never repeats a Level', () => {
    const seen = LEVELS.flat().map((level) => JSON.stringify(level));
    expect(new Set(seen).size).toBe(seen.length);
  });
});
