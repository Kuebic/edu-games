import { gameStorage, memoryStorage } from '@shared/storage';
import { isLevelOpen } from '@shared/unlock';
import { describe, expect, it, vi } from 'vitest';
import { CHAPTERS } from './levels';
import { loadProgress, type Progress } from './progress';
import { CHAPTER_COLOURS, pushPalsSelect, type SelectHooks } from './select';

vi.mock('./sound', () => ({ play: vi.fn() }));
const sound = await import('./sound');

/** A save as the Game wrote it before the level select, under its real key. */
const oldSave = (save: object) => loadProgress(gameStorage('push-pals', memoryStorage({ 'push-pals:v2': JSON.stringify(save) })));

const hooks = (progress: Progress) => ({ progress, open: vi.fn<SelectHooks['open']>() });

describe("Push Pals' level select", () => {
  it('shows the ten Chapters of eight Levels, each in its own colour', () => {
    const groups = pushPalsSelect(hooks(oldSave({}))).groups();
    expect(groups.map((g) => g.name)).toEqual(CHAPTERS.map((c, i) => `Chapter ${i + 1}, ${c.boxes} boxes`));
    expect(groups.map((g) => g.levels.length)).toEqual(Array(10).fill(8));
    expect(new Set(groups.map((g) => g.colour)).size).toBe(CHAPTERS.length);
    expect(CHAPTER_COLOURS).toHaveLength(CHAPTERS.length);
  });

  it('loads an old save with the same Levels solved', () => {
    const groups = pushPalsSelect(hooks(oldSave({ solved: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], muted: true }))).groups();
    expect(groups[0]!.levels.every((l) => l.done)).toBe(true);
    expect(groups[1]!.levels.map((l) => l.done)).toEqual([true, true, false, false, false, false, false, false]);
    expect(groups.slice(2).flatMap((g) => g.levels).some((l) => l.done)).toBe(false);
    // Chapter 2's Level 3 is next; every other Chapter is open at its first Level.
    const chapter2 = groups[1]!.levels.map((l) => l.done);
    expect(chapter2.map((_, i) => isLevelOpen(chapter2, i))).toEqual([true, true, true, false, false, false, false, false]);
  });

  it('shows each Chapter’s boxes on its badge', () => {
    const groups = pushPalsSelect(hooks(oldSave({}))).groups();
    const crates = groups.map((g) => (g.badge() as string).split('<i>').length - 1);
    expect(crates).toEqual(CHAPTERS.map((c) => c.boxes));
  });

  it('plays the Level tapped, numbered across Chapters, with a tap sound', () => {
    const h = hooks(oldSave({}));
    pushPalsSelect(h).play(1, 3);
    expect(h.open).toHaveBeenCalledWith(11);
    expect(sound.play).toHaveBeenCalledWith('tap');
  });
});
