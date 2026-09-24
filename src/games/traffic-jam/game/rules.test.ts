import { describe, expect, it } from 'vitest';
import { layoutProblems, type Level, type Street, type Vehicle } from './level';
import { routeOf, solve, tap } from './rules';

const v = (at: number, lanes: 1 | 2 = 1, extra: Partial<Street> = {}): Street => ({ axis: 'v', at, lanes, ...extra });
const h = (at: number, lanes: 1 | 2 = 1, extra: Partial<Street> = {}): Street => ({ axis: 'h', at, lanes, ...extra });
const car = (x: number, y: number, dir: Vehicle['dir'], arrow: Vehicle['arrow'] = 'straight'): Vehicle => ({
  kind: 'car',
  x,
  y,
  dir,
  arrow,
});

function level(w: number, hgt: number, streets: Street[], vehicles: Vehicle[] = []): Level {
  return { w, h: hgt, streets, vehicles };
}

const cells = (route: { x: number; y: number }[] | null) => route?.map(({ x, y }) => [x, y]);

describe('routeOf', () => {
  it('drives straight off the edge', () => {
    const board = level(5, 9, [v(2)]);
    expect(cells(routeOf(board, car(2, 3, 'N')))).toEqual([[2, 2], [2, 1], [2, 0]]);
    expect(cells(routeOf(board, car(2, 6, 'S')))).toEqual([[2, 7], [2, 8]]);
  });

  it('takes the first left, then drives off', () => {
    const board = level(5, 9, [v(2), h(4)]);
    const route = routeOf(board, car(2, 7, 'N', 'left'))!;
    expect(cells(route)).toEqual([[2, 6], [2, 5], [2, 4], [1, 4], [0, 4]]);
    expect(route.map((step) => step.dir)).toEqual(['N', 'N', 'N', 'W', 'W']);
  });

  it('turns right away when it starts in the lane it turns into', () => {
    const board = level(5, 9, [v(2), h(4)]);
    expect(cells(routeOf(board, car(2, 4, 'N', 'right')))).toEqual([[3, 4], [4, 4]]);
  });

  it('keeps right on two-lane streets: a right turn cuts the corner, a left crosses over', () => {
    const board = level(7, 9, [v(2, 2), h(4, 2)]);
    expect(cells(routeOf(board, car(3, 8, 'N', 'right')))).toEqual([[3, 7], [3, 6], [3, 5], [4, 5], [5, 5], [6, 5]]);
    expect(cells(routeOf(board, car(3, 8, 'N', 'left')))).toEqual([
      [3, 7], [3, 6], [3, 5], [3, 4], [2, 4], [1, 4], [0, 4],
    ]);
  });

  it('makes a U-turn around the block', () => {
    const board = level(6, 9, [v(1), v(4), h(2), h(6)]);
    expect(cells(routeOf(board, car(1, 8, 'N', 'uturn-right')))).toEqual([
      [1, 7], [1, 6], [2, 6], [3, 6], [4, 6], [4, 7], [4, 8],
    ]);
    expect(cells(routeOf(board, car(4, 0, 'S', 'uturn-right')))).toEqual([
      [4, 1], [4, 2], [3, 2], [2, 2], [1, 2], [1, 1], [1, 0],
    ]);
  });

  it("never U-turns back onto the street it just left", () => {
    const board = level(9, 9, [v(2, 2), h(4, 2), v(6)]);
    // Left onto the two-lane street, then no second left before the edge.
    expect(routeOf(board, car(3, 8, 'N', 'uturn-left'))).toBeNull();
    expect(cells(routeOf(board, car(3, 8, 'N', 'uturn-right')))).toEqual([
      [3, 7], [3, 6], [3, 5], [4, 5], [5, 5], [6, 5], [6, 6], [6, 7], [6, 8],
    ]);
  });

  it('has no route when the turn never comes', () => {
    expect(routeOf(level(5, 9, [v(2)]), car(2, 5, 'N', 'left'))).toBeNull();
  });

  describe('at a T-junction', () => {
    // The v street starts at row 4, where it meets the h street: ┬
    const board = level(5, 9, [v(2, 1, { from: 4 }), h(4)]);

    it("can't go straight into the side of a street", () => {
      expect(routeOf(board, car(2, 7, 'N'))).toBeNull();
      expect(cells(routeOf(board, car(2, 7, 'N', 'left')))).toEqual([[2, 6], [2, 5], [2, 4], [1, 4], [0, 4]]);
    });

    it('only turns where there is road', () => {
      expect(cells(routeOf(board, car(0, 4, 'E', 'right')))).toEqual([[1, 4], [2, 4], [2, 5], [2, 6], [2, 7], [2, 8]]);
      expect(routeOf(board, car(0, 4, 'E', 'left'))).toBeNull();
      expect(cells(routeOf(board, car(0, 4, 'E')))).toEqual([[1, 4], [2, 4], [3, 4], [4, 4]]);
    });

    it('skips a crossing without the turn and takes the next one', () => {
      const two = level(9, 9, [v(2, 1, { from: 4 }), v(6), h(4)]);
      expect(cells(routeOf(two, car(0, 4, 'E', 'left')))).toEqual([
        [1, 4], [2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [6, 3], [6, 2], [6, 1], [6, 0],
      ]);
    });
  });
});

describe('tap', () => {
  it('leaves when the route is clear', () => {
    const board = level(5, 9, [v(2)], [car(2, 3, 'N'), car(2, 6, 'S')]);
    expect(tap(board, board.vehicles, 0).kind).toBe('leave');
  });

  it('bumps into the first vehicle in the way', () => {
    const board = level(5, 9, [v(2), h(4)], [car(2, 7, 'N'), car(2, 2, 'N'), car(2, 4, 'E')]);
    expect(tap(board, board.vehicles, 0)).toMatchObject({ kind: 'bump', reached: 2, blocker: 2 });
  });

  it('is blocked by every cell of a truck', () => {
    const truck: Vehicle = { kind: 'truck', x: 2, y: 3, dir: 'N', arrow: 'straight' };
    // The truck's back is in the intersection at row 4.
    const board = level(5, 9, [v(2), h(4)], [truck, car(0, 4, 'E')]);
    expect(tap(board, board.vehicles, 1)).toMatchObject({ kind: 'bump', reached: 1, blocker: 0 });
  });

  it('ignores vehicles that have left', () => {
    const board = level(5, 9, [v(2)], [car(2, 5, 'N'), car(2, 2, 'N')]);
    expect(tap(board, [board.vehicles[0]!, null], 0).kind).toBe('leave');
  });
});

describe('solve', () => {
  it('groups vehicles into waves', () => {
    const board = level(5, 9, [v(2)], [car(2, 5, 'N'), car(2, 2, 'N'), car(2, 7, 'S')]);
    expect(solve(board)).toEqual({ waves: [[1, 2], [0]], stuck: [] });
  });

  it('finds vehicles that block each other forever', () => {
    const board = level(5, 9, [v(2)], [car(2, 6, 'N'), car(2, 2, 'S')]);
    expect(solve(board).stuck).toEqual([0, 1]);
  });
});

describe('layoutProblems', () => {
  it('accepts a good layout', () => {
    expect(layoutProblems(level(7, 9, [v(2, 2), h(4, 2)], [car(3, 7, 'N'), car(2, 1, 'S')]))).toEqual([]);
  });

  it('rejects a vehicle driving on the wrong side', () => {
    expect(layoutProblems(level(7, 9, [v(2, 2)], [car(2, 7, 'N')]))).toContain('vehicle 0 is in the wrong lane');
  });

  it('rejects a street that stops short of a crossing street', () => {
    expect(layoutProblems(level(7, 9, [v(2, 1, { from: 3 }), h(4)]))).toHaveLength(1);
  });

  it('rejects overlapping vehicles and vehicles off the road', () => {
    const truck: Vehicle = { kind: 'truck', x: 2, y: 4, dir: 'N', arrow: 'straight' };
    expect(layoutProblems(level(5, 9, [v(2)], [truck, car(2, 5, 'N')]))).toContain('vehicle 1 overlaps another');
    expect(layoutProblems(level(5, 9, [v(2)], [car(1, 5, 'N')]))).toContain('vehicle 0 is off its street');
  });
});
