// The smooth line a Vehicle drives along: its Route through cell centres with the
// corners rounded off, so turns look like turns. Units are cells.

import { cellsOf, LENGTH, STEP, type Vehicle } from './level';
import type { Step } from './rules';

export interface Pose {
  x: number;
  y: number;
  /** Degrees clockwise from north. */
  angle: number;
}

type Segment =
  | { kind: 'line'; x0: number; y0: number; x1: number; y1: number; length: number }
  | { kind: 'arc'; cx: number; cy: number; a0: number; sweep: number; length: number };

const RADIUS = 0.5;

const heading = (dx: number, dy: number) => (Math.atan2(dx, -dy) * 180) / Math.PI;

export class Track {
  private readonly segments: Segment[] = [];
  /** Distance along the track of each cell centre it was built from. */
  private readonly centres: number[] = [];
  readonly length: number;
  private readonly frontStart: number;
  private readonly frontIndex: number;

  /**
   * The track starts at the Vehicle's back cell, runs up to its front, follows the Route,
   * and carries on past the edge until the whole Vehicle is off the board.
   */
  constructor(vehicle: Vehicle, route: readonly Step[]) {
    const size = LENGTH[vehicle.kind];
    const last = route[route.length - 1] ?? { ...vehicle, dir: vehicle.dir };
    const { dx, dy } = STEP[last.dir];
    const points = [
      ...cellsOf(vehicle).reverse(),
      ...route,
      ...Array.from({ length: size }, (_, k) => ({ x: last.x + dx * (k + 1), y: last.y + dy * (k + 1) })),
    ].map(({ x, y }) => ({ x: x + 0.5, y: y + 0.5 }));

    let s = 0;
    let cursor = points[0]!;
    this.centres.push(0);
    const line = (x1: number, y1: number) => {
      const length = Math.hypot(x1 - cursor.x, y1 - cursor.y);
      if (length > 1e-9) this.segments.push({ kind: 'line', x0: cursor.x, y0: cursor.y, x1, y1, length });
      s += length;
      cursor = { x: x1, y: y1 };
    };
    for (let i = 1; i < points.length; i++) {
      const p = points[i]!;
      const next = points[i + 1];
      const din = { x: Math.sign(p.x - points[i - 1]!.x), y: Math.sign(p.y - points[i - 1]!.y) };
      const dout = next ? { x: Math.sign(next.x - p.x), y: Math.sign(next.y - p.y) } : din;
      if (dout.x === din.x && dout.y === din.y) {
        line(p.x, p.y);
        this.centres.push(s);
        continue;
      }
      // Quarter circle from half a cell before the corner to half a cell after it.
      line(p.x - din.x * RADIUS, p.y - din.y * RADIUS);
      const cx = p.x + (dout.x - din.x) * RADIUS;
      const cy = p.y + (dout.y - din.y) * RADIUS;
      const a0 = Math.atan2(cursor.y - cy, cursor.x - cx);
      const a1 = Math.atan2(p.y + dout.y * RADIUS - cy, p.x + dout.x * RADIUS - cx);
      let sweep = a1 - a0;
      if (sweep > Math.PI) sweep -= 2 * Math.PI;
      if (sweep < -Math.PI) sweep += 2 * Math.PI;
      const length = Math.abs(sweep) * RADIUS;
      this.segments.push({ kind: 'arc', cx, cy, a0, sweep, length });
      this.centres.push(s + length / 2);
      s += length;
      cursor = { x: p.x + dout.x * RADIUS, y: p.y + dout.y * RADIUS };
    }
    this.frontIndex = size - 1;
    this.frontStart = this.centres[this.frontIndex]!;
    this.length = s - this.frontStart;
  }

  /** Where the front's centre is after driving `route` steps, measured from the start. */
  distanceTo(steps: number): number {
    return this.centres[this.frontIndex + steps]! - this.frontStart;
  }

  private point(s: number): Pose {
    let rest = Math.max(0, s);
    for (const segment of this.segments) {
      if (rest <= segment.length || segment === this.segments[this.segments.length - 1]) {
        const t = segment.length > 0 ? rest / segment.length : 0;
        if (segment.kind === 'line') {
          const { x0, y0, x1, y1 } = segment;
          return { x: x0 + (x1 - x0) * t, y: y0 + (y1 - y0) * t, angle: heading(x1 - x0, y1 - y0) };
        }
        const a = segment.a0 + segment.sweep * t;
        const side = Math.sign(segment.sweep);
        return {
          x: segment.cx + Math.cos(a) * RADIUS,
          y: segment.cy + Math.sin(a) * RADIUS,
          angle: heading(-Math.sin(a) * side, Math.cos(a) * side),
        };
      }
      rest -= segment.length;
    }
    return { x: 0, y: 0, angle: 0 };
  }

  /** The Vehicle's centre and facing after it has driven `distance` along the track. */
  pose(distance: number, size: number): Pose {
    const front = this.point(this.frontStart + distance);
    if (size === 1) return front;
    // The track starts at the back cell's centre, so the back has driven the same distance from there.
    const back = this.point(distance);
    return {
      x: (front.x + back.x) / 2,
      y: (front.y + back.y) / 2,
      angle: heading(front.x - back.x, front.y - back.y),
    };
  }
}
