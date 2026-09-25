import { gameStorage, memoryStorage } from '@shared/storage';
import { describe, expect, it } from 'vitest';
import { LEVELS } from './levels';
import { GROWN_UP_PACK, type PoolPuzzle } from './packs';
import {
  freshProgress,
  isLevelOpen,
  isPackOpen,
  loadProgress,
  nextLevel,
  recordPoolSolve,
  recordSolve,
  saveProgress,
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

  it('opens the next Level on a solve, and the next Pack at 9 of 12', () => {
    const progress = freshProgress();
    expect(isLevelOpen(progress, LEVELS, level(1, 1))).toBe(true);
    expect(isLevelOpen(progress, LEVELS, level(1, 2))).toBe(false);
    recordSolve(progress, level(1, 1), 99);
    expect(isLevelOpen(progress, LEVELS, level(1, 2))).toBe(true);
    expect(nextLevel(LEVELS, level(1, 1))).toBe(level(1, 2));
    expect(nextLevel(LEVELS, level(1, 12))).toBeUndefined();

    for (let i = 2; i <= 8; i++) recordSolve(progress, level(1, i), 99);
    expect(isPackOpen(progress, LEVELS, 2)).toBe(false);
    recordSolve(progress, level(1, 9), 99);
    expect(isPackOpen(progress, LEVELS, 2)).toBe(true);
    expect(isLevelOpen(progress, LEVELS, level(2, 1))).toBe(true);
    expect(isPackOpen(progress, LEVELS, 3)).toBe(false);
  });

  it('lets a grown-up open everything, and the bonus Pack', () => {
    const progress = freshProgress();
    expect(isPackOpen(progress, LEVELS, GROWN_UP_PACK)).toBe(false);
    progress.grownUp = true;
    expect(isPackOpen(progress, LEVELS, GROWN_UP_PACK)).toBe(true);
    expect(isLevelOpen(progress, LEVELS, level(GROWN_UP_PACK, 2))).toBe(false);
    progress.unlockAll = true;
    expect(isLevelOpen(progress, LEVELS, level(5, 12))).toBe(true);
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
