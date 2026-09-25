import { describe, expect, it } from 'vitest';
import type { Level, Vehicle } from './level';
import { routeOf } from './rules';
import { Track } from './track';

const board: Level = { w: 5, h: 9, streets: [{ axis: 'v', at: 2, lanes: 1 }, { axis: 'h', at: 4, lanes: 1 }], vehicles: [] };

function trackFor(vehicle: Vehicle) {
  return new Track(vehicle, routeOf(board, vehicle)!);
}

describe('Track', () => {
  it('starts on the vehicle and drives until it is off the board', () => {
    const track = trackFor({ kind: 'car', x: 2, y: 3, dir: 'N', arrow: 'straight' });
    expect(track.pose(0, 1)).toEqual({ x: 2.5, y: 3.5, angle: 0 });
    expect(track.length).toBeCloseTo(4);
    expect(track.pose(track.length, 1).y).toBeCloseTo(-0.5);
  });

  it('rounds the corner of a turn', () => {
    const track = trackFor({ kind: 'car', x: 2, y: 7, dir: 'N', arrow: 'left' });
    // Up 2.5 cells, a quarter circle of radius 0.5, then 2.5 cells west to one cell past the edge.
    expect(track.length).toBeCloseTo(2.5 + Math.PI / 4 + 2.5);
    const end = track.pose(track.length, 1);
    expect(end.x).toBeCloseTo(-0.5);
    expect(end.y).toBeCloseTo(4.5);
    expect(end.angle).toBeCloseTo(-90);
    const mid = track.pose(2.5 + Math.PI / 8, 1);
    expect(mid.angle).toBeCloseTo(-45);
  });

  it('measures how far the front drives to reach a route step', () => {
    const track = trackFor({ kind: 'car', x: 2, y: 7, dir: 'N', arrow: 'left' });
    expect(track.distanceTo(0)).toBe(0);
    expect(track.distanceTo(2)).toBeCloseTo(2);
    expect(track.distanceTo(3)).toBeCloseTo(2.5 + Math.PI / 8);
  });

  it('keeps a truck lined up behind its front', () => {
    const track = trackFor({ kind: 'truck', x: 2, y: 6, dir: 'N', arrow: 'straight' });
    expect(track.pose(0, 2)).toEqual({ x: 2.5, y: 7, angle: 0 });
    const end = track.pose(track.length, 2);
    expect(end.y).toBeCloseTo(-1);
  });
});
