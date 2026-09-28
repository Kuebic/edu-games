import { gameStorage, memoryStorage } from '@shared/storage';
import { describe, expect, it } from 'vitest';
import { loadProgress } from './progress';

/** A device holding this raw save under its real key, or nothing. */
const device = (initial?: string) => gameStorage('which-way', memoryStorage(initial === undefined ? {} : { 'which-way:v1': initial }));

describe('the picks', () => {
  it('start on Watch, left and right, and the puppy', () => {
    expect(loadProgress(device()).game).toEqual({ way: 'watch', scope: ['left', 'right'], skin: 'puppy' });
  });

  it('round-trip through the device', () => {
    const storage = device();
    const first = loadProgress(storage);
    first.game.way = 'pick';
    first.game.scope = ['up', 'down'];
    first.game.skin = 'car';
    first.save();
    expect(loadProgress(storage).game).toEqual({ way: 'pick', scope: ['up', 'down'], skin: 'car' });
  });

  it('keep only real Arrows, in order, and fall back for anything else saved', () => {
    const saved = { format: 1, game: { way: 'sideways', scope: ['right', 'north', 'left', 'left'], skin: 'kitten' } };
    expect(loadProgress(device(JSON.stringify(saved))).game).toEqual({ way: 'watch', scope: ['left', 'right'], skin: 'puppy' });
    expect(loadProgress(device(JSON.stringify({ format: 1, game: { scope: [] } }))).game.scope).toEqual([]);
    expect(loadProgress(device('{"game":')).game.way).toBe('watch');
  });
});
