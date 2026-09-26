import { gameStorage, memoryStorage } from '@shared/storage';
import { describe, expect, it } from 'vitest';
import { CHAPTERS, FIRST, LEVELS } from './levels';
import { chapterOf, levelAfter, loadProgress } from './progress';

/** A device holding these raw saves, under their real keys. */
const device = (seed: Record<string, string> = {}) => gameStorage('push-pals', memoryStorage(seed));

/** Every solved Level, numbered across Chapters. */
const solved = (progress: ReturnType<typeof loadProgress>) =>
  CHAPTERS.flatMap((_, c) => progress.marks(c).flatMap((m, i) => (m.done ? [FIRST[c]! + i] : [])));

describe('saved progress', () => {
  it('starts empty and survives a save', () => {
    const storage = device();
    expect(solved(loadProgress(storage))).toEqual([]);
    const progress = loadProgress(storage);
    progress.finish(0, 0);
    progress.finish(0, 1);
    progress.set('sound', false);
    const again = loadProgress(storage);
    expect(solved(again)).toEqual([0, 1]);
    expect(again.settings.sound).toBe(false);
  });

  it('loads a save written before the shell, from its old key', () => {
    const backing = memoryStorage({ 'push-pals:v2': '{"solved":[0,1,2,12],"muted":true}' });
    const progress = loadProgress(gameStorage('push-pals', backing));
    expect(solved(progress)).toEqual([0, 1, 2, 12]);
    expect(progress.settings.sound).toBe(false);
    progress.save();
    expect(Object.keys(backing.dump())).toEqual(['push-pals:v2']);
  });
});

describe('progress', () => {
  it('solves a Level once', () => {
    const progress = loadProgress(device());
    expect(progress.finish(0, 3).done).toBe(true);
    expect(progress.finish(0, 0).done).toBe(true);
    expect(progress.finish(0, 3).done).toBe(false);
    expect(solved(progress)).toEqual([0, 3]);
  });

  it('reads a Chapter’s solved Levels from the numbering across Chapters', () => {
    const progress = loadProgress(device({ 'push-pals:v2': '{"solved":[0,7,8,12]}' }));
    expect(progress.marks(0).map((m) => m.done)).toEqual([true, false, false, false, false, false, false, true]);
    expect(progress.marks(1).map((m) => m.done)).toEqual([true, false, false, false, true, false, false, false]);
    expect(FIRST[1]).toBe(8);
    expect([chapterOf(0), chapterOf(7), chapterOf(8), chapterOf(LEVELS.length - 1)]).toEqual([0, 0, 1, 9]);
  });

  it('goes on to the next Level, into the next Chapter, and stops after the last', () => {
    const progress = loadProgress(device());
    expect(levelAfter(progress, 0)).toBe(1);
    expect(levelAfter(progress, 7)).toBe(8);
    expect(levelAfter(progress, LEVELS.length - 2)).toBe(LEVELS.length - 1);
    expect(levelAfter(progress, LEVELS.length - 1)).toBeUndefined();
  });
});
