import { describe, expect, it } from 'vitest';
import { parseLevel } from './level';
import { isSolved, step } from './rules';
import { analyse, needsTrick } from './solver';

describe('analyse', () => {
  it('counts pushes and finds a replayable solution', () => {
    const level = parseLevel(`
#######
#@ $ .#
#######
`);
    const result = analyse(level);
    expect(result.solvable).toBe(true);
    expect(result.minPushes).toBe(2);
    expect(result.forgiving).toBe(true);

    let position = level.start;
    for (const dir of result.solution) {
      const next = step(level, position, dir);
      expect(next.kind).not.toBe('blocked');
      if (next.kind !== 'blocked') position = next.position;
    }
    expect(isSolved(level, position)).toBe(true);
  });

  it('flags levels where the player can get stuck', () => {
    const level = parseLevel(`
#####
#@  #
# $.#
#   #
#####
`);
    const result = analyse(level);
    expect(result.minPushes).toBe(1);
    expect(result.forgiving).toBe(false);
  });

  it('spots levels that need a trick', () => {
    // A box has to leave the middle goal to reach the top one.
    const offGoal = parseLevel(`
#####
###.#
# $.#
#@$ #
# $.#
#####
`);
    expect(needsTrick(offGoal)).toBe(true);

    // The bottom box has to go down first so the player can get under it.
    const backAndForth = parseLevel(`
#####
#.. #
#$ $#
#  @#
##$.#
##  #
##  #
#####
`);
    expect(needsTrick(backAndForth)).toBe(true);

    const plain = parseLevel(`
#######
#@ $ .#
#######
`);
    expect(needsTrick(plain)).toBe(false);
  });

  it('reports unsolvable levels', () => {
    const level = parseLevel(`
#####
#$ @#
#  .#
#####
`);
    const result = analyse(level);
    expect(result.solvable).toBe(false);
    expect(result.minPushes).toBe(Infinity);
    expect(result.solution).toEqual([]);
  });
});
