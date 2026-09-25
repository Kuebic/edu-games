import { gameStorage, memoryStorage } from '@shared/storage';
import { describe, expect, it } from 'vitest';
import { levelAfter, loadProgress, saveProgress, withCleared } from './progress';

/** A device holding these raw saves, under their real keys. */
const device = (seed: Record<string, string> = {}) => gameStorage('traffic-jam', memoryStorage(seed));

describe('progress', () => {
  it('starts empty and survives a save', () => {
    const storage = device();
    expect(loadProgress(storage)).toEqual({ cleared: [], muted: false });
    saveProgress({ cleared: [0, 1], muted: true }, storage);
    expect(loadProgress(storage)).toEqual({ cleared: [0, 1], muted: true });
  });

  it('loads a save written before the shell, from its old key', () => {
    const backing = memoryStorage({ 'traffic-jam:v1': '{"cleared":[0,1,2],"muted":true}' });
    const progress = loadProgress(gameStorage('traffic-jam', backing));
    expect(progress).toEqual({ cleared: [0, 1, 2], muted: true });
    saveProgress(progress, gameStorage('traffic-jam', backing));
    expect(Object.keys(backing.dump())).toEqual(['traffic-jam:v1']);
  });

  it('ignores broken saves', () => {
    const storage = device({ 'traffic-jam:v1': '{not json' });
    expect(loadProgress(storage)).toEqual({ cleared: [], muted: false });
  });

  it('clears a Level once', () => {
    const progress = withCleared({ cleared: [], muted: false }, 3);
    expect(withCleared(progress, 0).cleared).toEqual([0, 3]);
    expect(withCleared(progress, 3)).toBe(progress);
  });

  it('goes on to the next Level, into the next Chapter, and stops after the last', () => {
    expect(levelAfter(0)).toBe(1);
    expect(levelAfter(7)).toBe(8);
    expect(levelAfter(62)).toBe(63);
    expect(levelAfter(63)).toBeUndefined();
  });
});
