// Picks each Pack's 12 Levels and its Pool from measured candidates.
// Levels climb a staircase: from one Level to the next, par or the Vehicle count goes up
// by one (or neither), never both, while the other measures ramp up slowly.

import type { Measures } from '../../src/game/measure';
import { fitsPack, LEVELS_PER_PACK, showsNeed, type PackSpec } from '../../src/packs';
import type { Candidate } from './sources';

export interface Measured extends Candidate {
  m: Measures;
}

/** The measures besides par and Vehicle count. */
const SIDE: ((m: Measures) => number)[] = [
  (m) => m.depth,
  (m) => Number(m.repeats),
  (m) => Number(m.walls > 0),
  (m) => Number(m.backwards),
];

/** The measures besides par and Vehicle count, rolled into one number that should creep upward. */
export const extra = (m: Measures) => SIDE.reduce((sum, d) => sum + d(m), 0);

/** Par and Vehicle count for each Level: one step at a time, pauses spread evenly. */
function staircase(spec: PackSpec, start: { par: number; vehicles: number }) {
  const parSteps = spec.par[1] - start.par;
  const vehicleSteps = spec.vehicles[1] - start.vehicles;
  const climbs = Math.min(LEVELS_PER_PACK - 1, parSteps + vehicleSteps);
  const out = [{ ...start }];
  let par = 0;
  let vehicles = 0;
  let climbed = 0;
  for (let i = 1; i < LEVELS_PER_PACK; i++) {
    const due = Math.round((i * climbs) / (LEVELS_PER_PACK - 1));
    if (due > climbed) {
      climbed++;
      // Vehicles first: early Levels should stay sparse.
      if (vehicles / Math.max(1, vehicleSteps) <= par / Math.max(1, parSteps) && vehicles < vehicleSteps) vehicles++;
      else if (par < parSteps) par++;
      else vehicles++;
    }
    out.push({ par: start.par + par, vehicles: start.vehicles + vehicles });
  }
  return out;
}

/**
 * What this Pack allows that the one before it didn't. Each new thing waits for its turn:
 * with two new things, the first shows up a third of the way in and the second two thirds.
 */
function newThings(spec: PackSpec, before: PackSpec | undefined): ((m: Measures) => boolean)[] {
  if (!before) return [];
  const fresh: ((m: Measures) => boolean)[] = [];
  if (spec.depth > before.depth) fresh.push((m) => m.depth > before.depth);
  if (spec.repeats && !before.repeats) fresh.push((m) => m.repeats);
  if (spec.walls && !before.walls) fresh.push((m) => m.walls > 0);
  if (spec.backwards && !before.backwards) fresh.push((m) => m.backwards);
  return fresh;
}

export function pickLevels(
  spec: PackSpec,
  before: PackSpec | undefined,
  candidates: Measured[],
  rand: () => number,
  first?: { par: number; vehicles: number },
): Measured[] {
  const fit = candidates.filter((c) => fitsPack(c.m, spec));
  const fresh = newThings(spec, before);
  const startsAt = fresh.map((_, j) => Math.round((LEVELS_PER_PACK * (j + 1)) / (fresh.length + 1)));
  if (fit.length < LEVELS_PER_PACK) throw new Error(`${spec.name}: only ${fit.length} candidates`);
  const extras = fit.map((c) => extra(c.m));
  const low = Math.min(...extras);
  const high = Math.max(...extras);
  const jitter = new Map(fit.map((c) => [c.board, rand()]));

  // The bonus Pack has no staircase: spread it evenly over its par range instead.
  const targets =
    spec.par[1] - spec.par[0] > LEVELS_PER_PACK * 2
      ? Array.from({ length: LEVELS_PER_PACK }, (_, i) => ({
          par: Math.round(spec.par[0] + ((spec.par[1] - spec.par[0]) * i) / (LEVELS_PER_PACK - 1)),
          vehicles: -1,
        }))
      : staircase(spec, first ?? { par: spec.par[0], vehicles: spec.vehicles[0] });

  const picked: Measured[] = [];
  targets.forEach((target, i) => {
    const wantExtra = low + ((high - low) * i) / (LEVELS_PER_PACK - 1);
    const prev = picked[picked.length - 1];
    const score = (c: Measured) => {
      let cost = 100 * Math.abs(c.m.par - target.par) + 10 * Math.abs(extra(c.m) - wantExtra) + jitter.get(c.board)!;
      if (target.vehicles >= 0) cost += 100 * Math.abs(c.m.vehicles - target.vehicles);
      // Level 1 of a Pack: cars before trucks.
      if (i === 0) cost += 50 * c.m.trucks;
      // Hold each new thing back until its turn, then bring it in.
      fresh.forEach((has, j) => {
        if (i < startsAt[j]! && has(c.m)) cost += 300;
        if (i >= startsAt[j]! && !has(c.m)) cost += 80;
      });
      if (prev) {
        if (c.m.par < prev.m.par || (target.vehicles >= 0 && c.m.vehicles < prev.m.vehicles)) cost += 1000;
        // One new thing at a time, and nothing gets easier.
        for (const d of SIDE) {
          if (d(c.m) !== d(prev.m)) cost += 25;
          if (d(c.m) < d(prev.m)) cost += 60;
        }
        if (c.m.moved < prev.m.moved) cost += 15;
      }
      return cost;
    };
    const best = fit.filter((c) => !picked.includes(c)).sort((a, b) => score(a) - score(b))[0]!;
    picked.push(best);
  });

  // Make sure the Pack shows its new idea: swap in the closest board that does.
  if (spec.needs && !picked.some((c) => showsNeed(c.m, spec.needs!))) {
    const last = picked[picked.length - 1]!;
    const swap = fit
      .filter((c) => showsNeed(c.m, spec.needs!) && !picked.includes(c))
      .sort((a, b) => Math.abs(a.m.par - last.m.par) - Math.abs(b.m.par - last.m.par) || Math.abs(a.m.vehicles - last.m.vehicles) - Math.abs(b.m.vehicles - last.m.vehicles))[0];
    if (!swap) throw new Error(`${spec.name}: nothing shows ${spec.needs}`);
    picked[picked.length - 1] = swap;
  }
  return picked;
}

/** Up to `size` random boards that fit the Pack and aren't Levels. */
export function pickPool(spec: PackSpec, candidates: Measured[], taken: Set<string>, size: number, rand: () => number): Measured[] {
  const fit = candidates.filter((c) => fitsPack(c.m, spec) && !taken.has(c.board));
  for (let i = fit.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [fit[i], fit[j]] = [fit[j]!, fit[i]!];
  }
  return fit.slice(0, size).sort((a, b) => a.m.par - b.m.par || a.m.vehicles - b.m.vehicles);
}
