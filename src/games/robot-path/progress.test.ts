import { describe, expect, it } from 'vitest';
import { WORLDS } from './levels';
import {
  freshProgress,
  isLevelUnlocked,
  isWorldUnlocked,
  loadProgress,
  nextLevel,
  saveProgress,
  withDraft,
  withWin,
  type Progress,
} from './progress';

function memory() {
  const items = new Map<string, string>();
  return { getItem: (k: string) => items.get(k) ?? null, setItem: (k: string, v: string) => void items.set(k, v) };
}

const winAll = (progress: Progress, world: number, count: number) =>
  WORLDS[world]!.levels.slice(0, count).reduce((p, level) => withWin(p, level.id, false), progress);

describe('progress', () => {
  it('starts fresh and survives a save', () => {
    const storage = memory();
    expect(loadProgress(storage)).toEqual(freshProgress());
    const saved = withDraft(withWin(freshProgress(), 'w1-01', true), 'w1-02', [{ op: 'up' }]);
    saveProgress({ ...saved, skin: 'planet' }, storage);
    expect(loadProgress(storage)).toEqual({ ...saved, skin: 'planet' });
  });

  it('runs with storage blocked or broken', () => {
    expect(loadProgress(undefined)).toEqual(freshProgress());
    const throwing = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
    expect(loadProgress(throwing)).toEqual(freshProgress());
    expect(() => saveProgress(freshProgress(), throwing)).not.toThrow();
    const broken = memory();
    broken.setItem('robot-path:v1', '{not json');
    expect(loadProgress(broken)).toEqual(freshProgress());
  });

  it('keeps what still makes sense from an odd save', () => {
    const storage = memory();
    storage.setItem('robot-path:v1', JSON.stringify({ skin: 'moon', levels: { 'w1-01': { done: true, draft: 'x' } }, settings: { speed: 'warp', voice: false } }));
    const progress = loadProgress(storage);
    expect(progress.skin).toBe('garden');
    expect(progress.levels['w1-01']).toEqual({ done: true, sparkle: false });
    expect(progress.settings).toEqual({ sound: true, voice: false, speed: 'normal' });
  });

  it('moves version 1 saves past the maze Worlds', () => {
    const storage = memory();
    const old = { version: 1, levels: { 'w2-08': { done: true }, 'w3-01': { done: true, sparkle: true }, 'w5-08': { done: true } } };
    storage.setItem('robot-path:v1', JSON.stringify(old));
    expect(Object.keys(loadProgress(storage).levels)).toEqual(['w2-08', 'w6-01', 'w8-08']);
    saveProgress(loadProgress(storage), storage);
    expect(Object.keys(loadProgress(storage).levels)).toEqual(['w2-08', 'w6-01', 'w8-08']);
  });

  it('never takes a Sparkle away', () => {
    const once = withWin(freshProgress(), 'w1-01', true);
    expect(withWin(once, 'w1-01', false).levels['w1-01']!.sparkle).toBe(true);
  });

  it('opens Levels one by one, and the next World at 6 of 8', () => {
    let progress = freshProgress();
    expect(isLevelUnlocked(progress, 0, 0)).toBe(true);
    expect(isLevelUnlocked(progress, 0, 1)).toBe(false);
    progress = winAll(progress, 0, 1);
    expect(isLevelUnlocked(progress, 0, 1)).toBe(true);
    progress = winAll(progress, 0, 5);
    expect(isWorldUnlocked(progress, 1)).toBe(false);
    progress = winAll(progress, 0, 6);
    expect(isWorldUnlocked(progress, 1)).toBe(true);
    expect(isLevelUnlocked(progress, 1, 0)).toBe(true);
    expect(isWorldUnlocked(progress, 2)).toBe(false);
    expect(isLevelUnlocked({ ...progress, unlockAll: true }, 7, 7)).toBe(true);
  });

  it('goes on to the next Level, then the next World when it is open', () => {
    expect(nextLevel(freshProgress(), 0, 3)).toEqual({ world: 0, index: 4 });
    expect(nextLevel(freshProgress(), 0, 7)).toBeNull();
    expect(nextLevel(winAll(freshProgress(), 0, 8), 0, 7)).toEqual({ world: 1, index: 0 });
    expect(nextLevel({ ...freshProgress(), unlockAll: true }, 7, 7)).toBeNull();
  });
});
