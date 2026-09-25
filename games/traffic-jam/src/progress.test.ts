import { describe, expect, it } from 'vitest';
import { isUnlocked, loadProgress, saveProgress, withCleared } from './progress';

function memory() {
  const items = new Map<string, string>();
  return { getItem: (k: string) => items.get(k) ?? null, setItem: (k: string, v: string) => void items.set(k, v) };
}

describe('progress', () => {
  it('starts empty and survives a save', () => {
    const storage = memory();
    expect(loadProgress(storage)).toEqual({ cleared: [], muted: false });
    saveProgress({ cleared: [0, 1], muted: true }, storage);
    expect(loadProgress(storage)).toEqual({ cleared: [0, 1], muted: true });
  });

  it('ignores broken saves', () => {
    const storage = memory();
    storage.setItem('traffic-jam:v1', '{not json');
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
