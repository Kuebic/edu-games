import { gameStorage, memoryStorage } from '@shared/storage';
import { describe, expect, it } from 'vitest';
import { LEVELS } from './levels';
import { GROWN_UP_PACK, type PoolPuzzle } from './packs';
import { levelAfter, levelSave, loadProgress, recordPoolSolve, recordSolve, shownPacks, takePoolPuzzle } from './progress';

/** A device holding these raw saves, under their real keys. */
const device = (seed: Record<string, string> = {}) => gameStorage('way-out', memoryStorage(seed));

const level = (pack: number, index: number) => LEVELS.find((l) => l.pack === pack && l.index === index)!;

describe('progress', () => {
  it('starts fresh and survives a save', () => {
    const storage = device();
    const fresh = loadProgress(storage);
    expect(fresh.game).toEqual({ skin: 'city', levels: {}, poolSeen: {}, poolSparkles: {}, grownUp: false });
    expect(fresh.marks(0).some((m) => m.done)).toBe(false);
    fresh.game.skin = 'farm';
    fresh.set('voice', false);
    levelSave(fresh, 'p1-01').inProgress = { board: level(1, 1).board, moves: 1, history: [{ board: level(1, 1).board, moves: 0 }] };
    fresh.finish(0, 1, true);
    fresh.save();
    const again = loadProgress(storage);
    expect(again.game).toEqual(fresh.game);
    expect(again.settings.voice).toBe(false);
    expect(again.mark(0, 1)).toEqual({ done: true, sparkle: true });
  });

  it('loads a save written before the shell, from its old key', () => {
    const backing = memoryStorage({
      'way-out:v1': JSON.stringify({ version: 1, skin: 'farm', levels: { 'p1-01': { done: true, sparkle: true, bestMoves: 7 } }, grownUp: true }),
    });
    const progress = loadProgress(gameStorage('way-out', backing));
    expect(progress.game.skin).toBe('farm');
    expect(progress.game.grownUp).toBe(true);
    expect(progress.mark(0, 0)).toEqual({ done: true, sparkle: true });
    expect(progress.game.levels['p1-01']).toEqual({ bestMoves: 7 });
    progress.save();
    expect(Object.keys(backing.dump())).toEqual(['way-out:v1']);
  });

  it('keeps the good parts of a damaged save', () => {
    const storage = device({ 'way-out:v1': JSON.stringify({ skin: 'moon', levels: { 'p1-01': { done: true, sparkle: 'yes', inProgress: { board: 1 } } }, unlockAll: true }) });
    const progress = loadProgress(storage);
    expect(progress.game.skin).toBe('city');
    expect(progress.mark(0, 0)).toEqual({ done: true, sparkle: false });
    expect(progress.game.levels).toEqual({});
    expect(progress.settings.everyLevelOpen).toBe(true);
  });

  it('gives a Sparkle for solving in par or fewer, and keeps it', () => {
    const progress = loadProgress(device());
    const first = level(1, 1);
    expect(recordSolve(progress, first, first.par + 3)).toBe(false);
    expect(progress.mark(0, 0)).toEqual({ done: true, sparkle: false });
    expect(progress.game.levels[first.id]).toEqual({ bestMoves: first.par + 3 });
    expect(recordSolve(progress, first, first.par)).toBe(true);
    expect(recordSolve(progress, first, first.par + 5)).toBe(false);
    expect(progress.mark(0, 0)).toEqual({ done: true, sparkle: true });
    expect(progress.game.levels[first.id]).toEqual({ bestMoves: first.par });
  });

  it('shows the bonus Pack only behind its switch or "Every level open"', () => {
    const progress = loadProgress(device());
    expect(shownPacks(progress)).toBe(GROWN_UP_PACK - 1);
    progress.game.grownUp = true;
    expect(shownPacks(progress)).toBe(GROWN_UP_PACK);
    progress.game.grownUp = false;
    progress.set('everyLevelOpen', true);
    expect(shownPacks(progress)).toBe(GROWN_UP_PACK);
  });

  it("goes on from a Pack's last Level to the next shown Pack, and stops after the last", () => {
    const progress = loadProgress(device());
    expect(levelAfter(progress, LEVELS, level(1, 1))).toBe(level(1, 2));
    expect(levelAfter(progress, LEVELS, level(1, 12))).toBe(level(2, 1));
    expect(levelAfter(progress, LEVELS, level(5, 12))).toBeUndefined();
    progress.game.grownUp = true;
    expect(levelAfter(progress, LEVELS, level(5, 12))).toBe(level(GROWN_UP_PACK, 1));
    expect(levelAfter(progress, LEVELS, level(GROWN_UP_PACK, 12))).toBeUndefined();
  });

  it('serves every Pool puzzle once before repeating, and counts Pool Sparkles', () => {
    const pool: PoolPuzzle[] = [['a', 3], ['b', 4], ['c', 5]];
    const progress = loadProgress(device());
    const served = [0, 1, 2].map(() => takePoolPuzzle(progress, 2, pool)[0]);
    expect(new Set(served).size).toBe(3);
    takePoolPuzzle(progress, 2, pool);
    expect(progress.game.poolSeen[2]).toHaveLength(1);

    recordPoolSolve(progress, 2, pool[0]!, 3);
    recordPoolSolve(progress, 2, pool[0]!, 4);
    expect(progress.game.poolSparkles[2]).toBe(1);
  });

  it('keeps the Skin and the bonus Pack on a reset, and wipes the rest', () => {
    const progress = loadProgress(device());
    progress.game.skin = 'space';
    progress.game.grownUp = true;
    recordSolve(progress, level(1, 1), 2);
    recordPoolSolve(progress, 1, ['a', 3], 3);
    progress.reset();
    expect(progress.game).toEqual({ skin: 'space', levels: {}, poolSeen: {}, poolSparkles: {}, grownUp: true });
    expect(progress.mark(0, 0).done).toBe(false);
  });
});
