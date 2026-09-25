import { gameStorage, memoryStorage } from '@shared/storage';
import { describe, expect, it } from 'vitest';
import { LEVELS } from './levels';
import { GROWN_UP_PACK, type PoolPuzzle } from './packs';
import {
  freshProgress,
  levelAfter,
  loadProgress,
  recordPoolSolve,
  recordSolve,
  saveProgress,
  shownPacks,
  takePoolPuzzle,
} from './progress';

/** A device holding these raw saves, under their real keys. */
const device = (seed: Record<string, string> = {}) => gameStorage('way-out', memoryStorage(seed));

const level = (pack: number, index: number) => LEVELS.find((l) => l.pack === pack && l.index === index)!;

describe('progress', () => {
  it('starts fresh and survives a save', () => {
    const storage = device();
    expect(loadProgress(storage)).toEqual(freshProgress());
    const progress = freshProgress();
    progress.skin = 'farm';
    progress.settings.voice = false;
    progress.levels['p1-01'] = {
      done: false,
      sparkle: false,
      inProgress: { board: level(1, 1).board, moves: 1, history: [{ board: level(1, 1).board, moves: 0 }] },
    };
    saveProgress(progress, storage);
    expect(loadProgress(storage)).toEqual(progress);
  });

  it('loads a save written before the shell, from its old key', () => {
    const backing = memoryStorage({
      'way-out:v1': JSON.stringify({ version: 1, skin: 'farm', levels: { 'p1-01': { done: true, sparkle: true, bestMoves: 7 } } }),
    });
    const progress = loadProgress(gameStorage('way-out', backing));
    expect(progress.skin).toBe('farm');
    expect(progress.levels['p1-01']).toEqual({ done: true, sparkle: true, bestMoves: 7 });
    saveProgress(progress, gameStorage('way-out', backing));
    expect(Object.keys(backing.dump())).toEqual(['way-out:v1']);
  });

  it('keeps the good parts of a damaged save', () => {
    const storage = device({ 'way-out:v1': JSON.stringify({ skin: 'moon', levels: { 'p1-01': { done: true, sparkle: 'yes' } }, unlockAll: true }) });
    const progress = loadProgress(storage);
    expect(progress.skin).toBe('city');
    expect(progress.levels['p1-01']).toEqual({ done: true, sparkle: false });
    expect(progress.unlockAll).toBe(true);
  });

  it('gives a Sparkle for solving in par or fewer, and keeps it', () => {
    const progress = freshProgress();
    const first = level(1, 1);
    expect(recordSolve(progress, first, first.par + 3)).toBe(false);
    expect(progress.levels[first.id]).toEqual({ done: true, sparkle: false, bestMoves: first.par + 3 });
    expect(recordSolve(progress, first, first.par)).toBe(true);
    expect(recordSolve(progress, first, first.par + 5)).toBe(false);
    expect(progress.levels[first.id]).toEqual({ done: true, sparkle: true, bestMoves: first.par });
  });

  it('shows the bonus Pack only behind its switch or "Every level open"', () => {
    const progress = freshProgress();
    expect(shownPacks(progress)).toBe(GROWN_UP_PACK - 1);
    progress.grownUp = true;
    expect(shownPacks(progress)).toBe(GROWN_UP_PACK);
    progress.grownUp = false;
    progress.unlockAll = true;
    expect(shownPacks(progress)).toBe(GROWN_UP_PACK);
  });

  it("goes on from a Pack's last Level to the next shown Pack, and stops after the last", () => {
    const progress = freshProgress();
    expect(levelAfter(progress, LEVELS, level(1, 1))).toBe(level(1, 2));
    expect(levelAfter(progress, LEVELS, level(1, 12))).toBe(level(2, 1));
    expect(levelAfter(progress, LEVELS, level(5, 12))).toBeUndefined();
    progress.grownUp = true;
    expect(levelAfter(progress, LEVELS, level(5, 12))).toBe(level(GROWN_UP_PACK, 1));
    expect(levelAfter(progress, LEVELS, level(GROWN_UP_PACK, 12))).toBeUndefined();
  });

  it('serves every Pool puzzle once before repeating, and counts Pool Sparkles', () => {
    const pool: PoolPuzzle[] = [['a', 3], ['b', 4], ['c', 5]];
    const progress = freshProgress();
    const served = [0, 1, 2].map(() => takePoolPuzzle(progress, 2, pool)[0]);
    expect(new Set(served).size).toBe(3);
    takePoolPuzzle(progress, 2, pool);
    expect(progress.poolSeen[2]).toHaveLength(1);

    recordPoolSolve(progress, 2, pool[0]!, 3);
    recordPoolSolve(progress, 2, pool[0]!, 4);
    expect(progress.poolSparkles[2]).toBe(1);
  });
});
