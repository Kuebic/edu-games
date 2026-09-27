import { gameStorage, memoryStorage } from '@shared/storage';
import { describe, expect, it } from 'vitest';
import { loadProgress, setHopper } from './progress';

/** A device holding this raw save under its real key, or nothing. */
const device = (initial?: object | string) =>
  gameStorage(
    'hop-race',
    memoryStorage(initial === undefined ? {} : { 'hop-race:v1': typeof initial === 'string' ? initial : JSON.stringify(initial) }),
  );

describe('Races', () => {
  it('are three Tracks of 3, 4 and 4, none done to start with', () => {
    const progress = loadProgress(device());
    expect([0, 1, 2].map((t) => progress.marks(t).length)).toEqual([3, 4, 4]);
    expect(progress.marks(0).some((m) => m.done)).toBe(false);
  });

  it('go on from To 5 into To 10, and stop after the last', () => {
    const progress = loadProgress(device());
    expect(progress.after(0, 2)).toEqual({ group: 1, level: 0 });
    expect(progress.after(2, 3)).toBeUndefined();
  });
});

describe('the Hopper', () => {
  it('is Bunny to start with, and from a damaged slot', () => {
    expect(loadProgress(device()).game).toEqual({ hopper: 'bunny' });
    expect(loadProgress(device({ format: 1, game: { hopper: 'dragon' } })).game).toEqual({ hopper: 'bunny' });
    expect(loadProgress(device('{"game":')).game).toEqual({ hopper: 'bunny' });
  });

  it('round-trips through the device, and outlasts a reset', () => {
    const storage = device();
    const first = loadProgress(storage);
    setHopper(first, 'bear');
    first.finish(0, 0);
    first.reset();
    const again = loadProgress(storage);
    expect(again.game.hopper).toBe('bear');
    expect(again.mark(0, 0).done).toBe(false);
  });
});
