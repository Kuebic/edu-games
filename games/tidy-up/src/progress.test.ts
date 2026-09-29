import { gameStorage, memoryStorage } from '@shared/storage';
import { describe, expect, it } from 'vitest';
import { loadProgress } from './progress';

/** A device holding this raw save under its real key, or nothing. */
const device = (initial?: string) => gameStorage('tidy-up', memoryStorage(initial === undefined ? {} : { 'tidy-up:v1': initial }));

const NEW = {
  topic: 'colors',
  colors: ['red', 'blue'],
  shapes: ['circle', 'square'],
  kinds: ['animals-vehicles'],
  colorsWay: 'blocks',
  shapesWay: 'plain',
  kindsWay: 'clear',
  skin: 'buckets',
  patterns: false,
};

describe('the picks', () => {
  it('start on Colors, red and blue, Blocks, Buckets, no Patterns, and Kinds on its first Step, Clear', () => {
    expect(loadProgress(device()).game).toEqual(NEW);
  });

  it('round-trip through the device', () => {
    const storage = device();
    const first = loadProgress(storage);
    Object.assign(first.game, {
      topic: 'shapes',
      colors: ['yellow', 'pink'],
      shapes: ['triangle', 'star', 'heart'],
      kinds: ['toys-clothes', 'mammals-birds'],
      colorsWay: 'things',
      shapesWay: 'colorful',
      kindsWay: 'tricky',
      skin: 'trucks',
      patterns: true,
    });
    first.save();
    expect(loadProgress(storage).game).toEqual(first.game);
  });

  it('keep only real items, in order, and fall back for anything else saved', () => {
    const saved = { format: 1, game: { topic: 'sizes', colors: ['pink', 'teal', 'red', 'red'], shapes: 'circle', colorsWay: 'shapes', skin: 'bags', patterns: 'yes' } };
    expect(loadProgress(device(JSON.stringify(saved))).game).toEqual({ ...NEW, colors: ['red', 'pink'] });
    expect(loadProgress(device(JSON.stringify({ format: 1, game: { colors: [] } }))).game.colors).toEqual([]);
    expect(loadProgress(device('{"game":')).game).toEqual(NEW);
  });
});
