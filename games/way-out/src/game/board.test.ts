import { describe, expect, it } from 'vitest';
import { apply, boardProblems, canonical, exitIsClear, isSolved, legalMoves, parse, reach, solve } from './board';
import { blockingDepth, measure } from './measure';

// Rows of six, top to bottom. The red car's row is the third.
const rows = (...lines: string[]) => lines.join('');

/** One car in the red car's way. */
const ONE_IN_THE_WAY = rows('oooooo', 'oooBoo', 'AAoBoo', 'oooooo', 'oooooo', 'oooooo');

/** The hardest puzzle in the database: 60 Moves. */
const HARDEST = 'IBBxooIooLDDJAALooJoKEEMFFKooMGGHHHM';

describe('board', () => {
  it('reads Vehicles in letter order, with their line and position', () => {
    expect(parse(ONE_IN_THE_WAY)).toEqual([
      { id: 'A', horizontal: true, length: 2, line: 2, at: 0 },
      { id: 'B', horizontal: false, length: 2, line: 3, at: 1 },
    ]);
  });

  it('finds what is wrong with a board', () => {
    expect(boardProblems(ONE_IN_THE_WAY)).toEqual([]);
    expect(boardProblems(HARDEST)).toEqual([]);
    expect(boardProblems('ooo')).toHaveLength(1);
    expect(boardProblems(rows('AAoooo', 'oooooo', 'oooooo', 'oooooo', 'oooooo', 'oooooo'))).toEqual([
      'the red car must lie across row 3',
    ]);
    expect(boardProblems(rows('Booooo', 'oBoooo', 'AAoooo', 'oooooo', 'oooooo', 'oooooo'))).toEqual([
      'B is not a straight Vehicle of length 2 or 3',
    ]);
    expect(boardProblems(rows('BBBBoo', 'oooooo', 'AAoooo', 'oooooo', 'oooooo', 'oooooo'))).toEqual([
      'B is not a straight Vehicle of length 2 or 3',
    ]);
    expect(boardProblems(rows('ooooBo', 'oooooo', 'AAoooo', 'oooooo', 'oooooo', 'Booooo'))).toEqual([
      'B is not a straight Vehicle of length 2 or 3',
    ]);
  });

  it('slides Vehicles along their own line only, stopping at others and the edge', () => {
    const [red, car] = parse(ONE_IN_THE_WAY);
    expect(reach(ONE_IN_THE_WAY, red!)).toEqual({ back: 0, forward: 1 });
    expect(reach(ONE_IN_THE_WAY, car!)).toEqual({ back: -1, forward: 3 });
    expect(legalMoves(ONE_IN_THE_WAY)).toHaveLength(5);
    expect(apply(ONE_IN_THE_WAY, { piece: 'B', delta: 2 })).toBe(
      rows('oooooo', 'oooooo', 'AAoooo', 'oooBoo', 'oooBoo', 'oooooo'),
    );
  });

  it('is solved when the red car reaches the Exit', () => {
    expect(isSolved(ONE_IN_THE_WAY)).toBe(false);
    expect(exitIsClear(ONE_IN_THE_WAY)).toBe(false);
    const clear = apply(ONE_IN_THE_WAY, { piece: 'B', delta: -1 });
    expect(exitIsClear(clear)).toBe(true);
    expect(isSolved(apply(clear, { piece: 'A', delta: 4 }))).toBe(true);
  });

  it('finds the shortest solution, counting the red car’s last slide', () => {
    expect(solve(ONE_IN_THE_WAY)).toEqual([
      { piece: 'B', delta: -1 },
      { piece: 'A', delta: 4 },
    ]);
    const moves = solve(HARDEST)!;
    expect(moves).toHaveLength(60);
    expect(isSolved(moves.reduce(apply, HARDEST))).toBe(true);
  });

  it('can search without some Moves', () => {
    expect(solve(ONE_IN_THE_WAY, { forbid: (m) => m.piece === 'B' })).toBeNull();
  });

  it('names Vehicles in reading order', () => {
    expect(canonical(rows('oooooo', 'oooZoo', 'AAoZoo', 'QQoooo', 'oooooo', 'oooooo'))).toBe(
      rows('oooooo', 'oooBoo', 'AAoBoo', 'CCoooo', 'oooooo', 'oooooo'),
    );
  });
});

describe('measures', () => {
  it('counts one car in the way as depth 1', () => {
    expect(measure(ONE_IN_THE_WAY)).toEqual({
      par: 2,
      vehicles: 2,
      trucks: 0,
      walls: 0,
      moved: 2,
      repeats: false,
      backwards: false,
      depth: 1,
    });
  });

  it('counts a blocker that is itself blocked as depth 2', () => {
    // The truck in the red car's way can only go down, and the car below it is in the way.
    const board = rows('oooooo', 'oooBoo', 'AAoBoo', 'oooBoo', 'oooCoo', 'oooCoo');
    expect(blockingDepth(board)).toBe(2);
  });

  it('sees when a Vehicle must move twice', () => {
    const hard = measure(HARDEST);
    expect(hard.repeats).toBe(true);
    expect(hard.walls).toBe(1);
    expect(hard.depth).toBeGreaterThanOrEqual(2);
  });
});
