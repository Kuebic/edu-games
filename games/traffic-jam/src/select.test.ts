import { gameStorage, memoryStorage } from '@shared/storage';
import { isLevelOpen } from '@shared/unlock';
import { describe, expect, it, vi } from 'vitest';
import { CHAPTERS } from './chapters';
import { loadProgress, type Progress } from './progress';
import { trafficJamSelect, type SelectHooks } from './select';

/** A save as the Game wrote it before the level select, under its real key. */
const oldSave = (save: object) => loadProgress(gameStorage('traffic-jam', memoryStorage({ 'traffic-jam:v1': JSON.stringify(save) })));

const hooks = (progress: Progress) => ({ progress, open: vi.fn<SelectHooks['open']>(), corner: { gear: vi.fn(), open: vi.fn() } });

describe("Traffic Jam's level select", () => {
  it('shows the eight Chapters of eight Levels, by name', () => {
    const groups = trafficJamSelect(hooks(oldSave({}))).groups();
    expect(groups.map((g) => g.name)).toEqual(CHAPTERS.map((c) => c.name));
    expect(groups.map((g) => g.levels.length)).toEqual([8, 8, 8, 8, 8, 8, 8, 8]);
  });

  it('loads an old save with the same Levels done, and the same ones open', () => {
    // Chapter 3's Level 5 and the very last Level were done out of order, from a Chapter's open first Level.
    const cleared = [0, 1, 2, 8, 9, 20, 63];
    const groups = trafficJamSelect(hooks(oldSave({ cleared, muted: true }))).groups();
    const done = groups.flatMap((g, c) => g.levels.flatMap((l, i) => (l.done ? [c * 8 + i] : [])));
    expect(done).toEqual(cleared);
    // The rule the Game had: a Chapter's first Level, a cleared one, or one after a cleared one.
    const before = (n: number) => n % 8 === 0 || cleared.includes(n) || cleared.includes(n - 1);
    const open = groups.flatMap((g) => g.levels.map((_, i, levels) => isLevelOpen(levels.map((l) => l.done), i)));
    expect(open).toEqual(Array.from({ length: 64 }, (_, n) => before(n)));
  });

  it("follows the Grown-up Corner's Every level open", () => {
    const progress = oldSave({});
    const game = trafficJamSelect(hooks(progress));
    expect(game.everyLevelOpen()).toBe(false);
    progress.set('everyLevelOpen', true);
    expect(game.everyLevelOpen()).toBe(true);
  });

  it('plays the Level tapped, numbered across Chapters', () => {
    const h = hooks(oldSave({}));
    trafficJamSelect(h).play(1, 3);
    expect(h.open).toHaveBeenCalledWith(11);
  });
});
