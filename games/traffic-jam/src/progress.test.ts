import { gameStorage, memoryStorage } from '@shared/storage';
import { describe, expect, it } from 'vitest';
import { isUnlocked, loadProgress, saveProgress, withCleared } from './progress';

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

  it('unlocks the next level and every chapter start', () => {
    const progress = withCleared({ cleared: [], muted: false }, 0);
    expect(isUnlocked(progress, 1)).toBe(true);
    expect(isUnlocked(progress, 2)).toBe(false);
    expect(isUnlocked(progress, 8)).toBe(true);
    expect(withCleared(progress, 0)).toBe(progress);
  });
});
