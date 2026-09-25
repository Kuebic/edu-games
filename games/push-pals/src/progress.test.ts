import { gameStorage, memoryStorage } from '@shared/storage';
import { describe, expect, it } from 'vitest';
import { FIRST, LEVELS } from './levels';
import { chapterOf, levelAfter, loadProgress, saveProgress, solvedIn, withSolved } from './progress';

describe('saved progress', () => {
  it('starts empty and survives a save', () => {
    const storage = gameStorage('push-pals', memoryStorage());
    expect(loadProgress(storage)).toEqual({ solved: [], muted: false });
    saveProgress({ solved: [0, 1], muted: true }, storage);
    expect(loadProgress(storage)).toEqual({ solved: [0, 1], muted: true });
  });

  it('loads a save written before the shell, from its old key', () => {
    const backing = memoryStorage({ 'push-pals:v2': '{"solved":[0,1,2],"muted":true}' });
    const progress = loadProgress(gameStorage('push-pals', backing));
    expect(progress).toEqual({ solved: [0, 1, 2], muted: true });
    saveProgress(progress, gameStorage('push-pals', backing));
    expect(Object.keys(backing.dump())).toEqual(['push-pals:v2']);
  });
});

describe('progress', () => {
  const fresh = { solved: [], muted: false };

  it('solves a Level once', () => {
    const p = withSolved(fresh, 3);
    expect(withSolved(p, 0).solved).toEqual([0, 3]);
    expect(withSolved(p, 3)).toBe(p);
  });

  it('reads a Chapter’s solved Levels from the numbering across Chapters', () => {
    const p = { solved: [0, 7, 8, 12], muted: false };
    expect(solvedIn(p, 0)).toEqual([true, false, false, false, false, false, false, true]);
    expect(solvedIn(p, 1)).toEqual([true, false, false, false, true, false, false, false]);
    expect(FIRST[1]).toBe(8);
    expect([chapterOf(0), chapterOf(7), chapterOf(8), chapterOf(LEVELS.length - 1)]).toEqual([0, 0, 1, 9]);
  });

  it('goes on to the next Level, into the next Chapter, and stops after the last', () => {
    expect(levelAfter(0)).toBe(1);
    expect(levelAfter(7)).toBe(8);
    expect(levelAfter(LEVELS.length - 2)).toBe(LEVELS.length - 1);
    expect(levelAfter(LEVELS.length - 1)).toBeUndefined();
  });
});
