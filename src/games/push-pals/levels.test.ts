import { describe, expect, it } from 'vitest';
import { parseLevel } from './game/level';
import { isSolved, step } from './game/rules';
import { analyse, needsTrick } from './game/solver';
import { CHAPTERS, MAX_BOARD } from './levels';

describe.each(CHAPTERS.map((chapter, i) => [i + 1, chapter] as const))('chapter %i', (_, chapter) => {
  it.each(chapter.levels.map((text, i) => [i + 1, text] as const))('level %i', (_, text) => {
    const level = parseLevel(text);
    const analysis = analyse(level);

    expect(level.width).toBeLessThanOrEqual(MAX_BOARD);
    expect(level.height).toBeLessThanOrEqual(MAX_BOARD);
    expect(level.start.boxes).toHaveLength(chapter.boxes);
    expect(isSolved(level, level.start)).toBe(false);
    expect(analysis.solvable).toBe(true);
    expect(analysis.minPushes).toBeGreaterThanOrEqual(chapter.minPushes);
    expect(analysis.minPushes).toBeLessThanOrEqual(chapter.maxPushes);
    expect(analysis.forgiving).toBe(false);
    if (chapter.trick) expect(needsTrick(level)).toBe(true);

    let position = level.start;
    for (const dir of analysis.solution) {
      const result = step(level, position, dir);
      if (result.kind === 'blocked') throw new Error(`solution blocked at ${dir}`);
      position = result.position;
    }
    expect(isSolved(level, position)).toBe(true);
  });
});

it('has no duplicate levels', () => {
  const all = CHAPTERS.flatMap((c) => c.levels.map((l) => l.trim()));
  expect(new Set(all).size).toBe(all.length);
});
