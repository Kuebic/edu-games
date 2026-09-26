import { gameStorage, memoryStorage } from '@shared/storage';
import { describe, expect, it } from 'vitest';
import { loadProgress, roundAfter } from './progress';

/** A device holding this raw save under its real key, or nothing. */
const device = (initial?: string) => gameStorage('find-it', memoryStorage(initial === undefined ? {} : { 'find-it:v1': initial }));

describe('Rounds', () => {
  it('are ten of Numbers and five of Letters, none done to start with', () => {
    const progress = loadProgress(device());
    expect(progress.marks(0).map((m) => m.done)).toEqual(Array(10).fill(false));
    expect(progress.marks(1).map((m) => m.done)).toEqual(Array(5).fill(false));
    expect(progress.marks(2)).toEqual([]);
  });

  it('stay done once finished, and carry no Sparkles', () => {
    const progress = loadProgress(device());
    expect(progress.finish(1, 0).done).toBe(true);
    expect(progress.finish(1, 0).done).toBe(false);
    expect(progress.marks(1)[0]).toEqual({ done: true });
  });

  it('go on to the next Round, from the last of Numbers into Letters, and stop after Z', () => {
    const progress = loadProgress(device());
    expect(roundAfter(progress, 0, 0)).toEqual({ box: 0, round: 1 });
    expect(roundAfter(progress, 0, 9)).toEqual({ box: 1, round: 0 });
    expect(roundAfter(progress, 1, 4)).toBeUndefined();
  });

  it('round-trip through the device', () => {
    const storage = device();
    const first = loadProgress(storage);
    first.finish(0, 0);
    first.finish(0, 1);
    first.set('voice', false);
    const again = loadProgress(storage);
    expect(again.marks(0).map((m) => m.done).slice(0, 3)).toEqual([true, true, false]);
    expect(again.settings.voice).toBe(false);
  });

  it('start fresh from a damaged save', () => {
    const progress = loadProgress(device('{"done":"nonsense"'));
    expect(progress.marks(0).some((m) => m.done)).toBe(false);
  });
});
