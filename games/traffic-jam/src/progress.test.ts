import { gameStorage, memoryStorage } from '@shared/storage';
import { describe, expect, it } from 'vitest';
import { levelAfter, loadProgress } from './progress';

/** A device holding these raw saves, under their real keys. */
const device = (seed: Record<string, string> = {}) => gameStorage('traffic-jam', memoryStorage(seed));

const cleared = (progress: ReturnType<typeof loadProgress>) =>
  Array.from({ length: 8 }, (_, c) => progress.marks(c).flatMap((m, i) => (m.done ? [c * 8 + i] : [])));

describe('progress', () => {
  it('starts empty and survives a save', () => {
    const storage = device();
    expect(cleared(loadProgress(storage)).flat()).toEqual([]);
    const progress = loadProgress(storage);
    progress.finish(0, 0);
    progress.finish(0, 1);
    progress.set('sound', false);
    const again = loadProgress(storage);
    expect(cleared(again).flat()).toEqual([0, 1]);
    expect(again.settings.sound).toBe(false);
  });

  it('loads a save written before the shell, from its old key', () => {
    const backing = memoryStorage({ 'traffic-jam:v1': '{"cleared":[0,1,2,9,63],"muted":true}' });
    const progress = loadProgress(gameStorage('traffic-jam', backing));
    expect(cleared(progress).flat()).toEqual([0, 1, 2, 9, 63]);
    expect(progress.settings.sound).toBe(false);
    progress.save();
    expect(Object.keys(backing.dump())).toEqual(['traffic-jam:v1']);
  });

  it('ignores broken saves', () => {
    const storage = device({ 'traffic-jam:v1': '{not json' });
    expect(cleared(loadProgress(storage)).flat()).toEqual([]);
  });

  it('clears a Level once', () => {
    const progress = loadProgress(device());
    expect(progress.finish(0, 3).done).toBe(true);
    expect(progress.finish(0, 3).done).toBe(false);
    expect(cleared(progress)[0]).toEqual([3]);
  });

  it('goes on to the next Level, into the next Chapter, and stops after the last', () => {
    const progress = loadProgress(device());
    expect(levelAfter(progress, 0)).toBe(1);
    expect(levelAfter(progress, 7)).toBe(8);
    expect(levelAfter(progress, 62)).toBe(63);
    expect(levelAfter(progress, 63)).toBeUndefined();
  });
});
