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

const hooks = (progress: Progress) => ({ progress, open: vi.fn<SelectHooks['open']>(), corner: { gear: vi.fn(), open: vi.fn() } });

describe("Push Pals' level select", () => {
  it('shows the thirteen Chapters of eight Levels, each in its own colour', () => {
    const groups = pushPalsSelect(hooks(oldSave({}))).groups();
    expect(groups.map((g) => g.name).slice(0, 4)).toEqual(['Chapter 1, 1 box', 'Chapter 2, 1 box', 'Chapter 3, 2 boxes', 'Chapter 4, 2 boxes']);
    expect(groups.map((g) => g.levels.length)).toEqual(Array(13).fill(8));
    expect(new Set(groups.map((g) => g.colour)).size).toBe(CHAPTERS.length);
    expect(CHAPTER_COLOURS).toHaveLength(CHAPTERS.length);
  });

  it('loads an old save with the same Levels solved, behind the three easy Chapters', () => {
    const groups = pushPalsSelect(hooks(oldSave({ solved: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], muted: true }))).groups();
    expect(groups.slice(0, 3).flatMap((g) => g.levels).some((l) => l.done)).toBe(false);
    expect(groups[3]!.levels.every((l) => l.done)).toBe(true);
    expect(groups[4]!.levels.map((l) => l.done)).toEqual([true, true, false, false, false, false, false, false]);
    expect(groups.slice(5).flatMap((g) => g.levels).some((l) => l.done)).toBe(false);
    // Chapter 5's Level 3 is next; every other Chapter is open at its first Level.
    const chapter5 = groups[4]!.levels.map((l) => l.done);
    expect(chapter5.map((_, i) => isLevelOpen(chapter5, i))).toEqual([true, true, true, false, false, false, false, false]);
  });

  it('shows each Chapter’s boxes on its badge', () => {
    const groups = pushPalsSelect(hooks(oldSave({}))).groups();
    const crates = groups.map((g) => (g.badge() as string).split('<i>').length - 1);
    expect(crates).toEqual(CHAPTERS.map((c) => c.boxes));
  });

  it('opens every Level while the Grown-up Corner says so', () => {
    const progress = oldSave({});
    const game = pushPalsSelect(hooks(progress));
    expect(game.everyLevelOpen?.()).toBe(false);
    progress.set('everyLevelOpen', true);
    expect(game.everyLevelOpen?.()).toBe(true);
  });

  it('plays the Level tapped, numbered across Chapters, with a tap sound', () => {
    const h = hooks(oldSave({}));
    pushPalsSelect(h).play(1, 3);
    expect(h.open).toHaveBeenCalledWith(11);
    expect(sound.play).toHaveBeenCalledWith('tap');
  });
});
