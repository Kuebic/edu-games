import { gameStorage, memoryStorage } from '@shared/storage';
import { isLevelOpen } from '@shared/unlock';
import { describe, expect, it, vi } from 'vitest';
import { WORLDS } from './levels';
import { loadProgress, type Progress } from './progress';
import { robotPathSelect, type SelectHooks } from './select';

/** A save as the Game wrote it before the level select, under its real key. */
const oldSave = (save: object) => loadProgress(gameStorage('robot-path', memoryStorage({ 'robot-path:v1': JSON.stringify(save) })));

function hooks(progress: Progress) {
  return { progress, skin: vi.fn<SelectHooks['skin']>(), open: vi.fn<SelectHooks['open']>(), corner: { gear: vi.fn(), open: vi.fn() } };
}

/** The ids of every Level the level select shows as done. */
const doneIds = (progress: Progress) =>
  robotPathSelect(hooks(progress))
    .groups()
    .flatMap((g, w) => g.levels.flatMap((l, i) => (l.done ? [WORLDS[w]!.levels[i]!.id] : [])));

describe("Robot Path's level select", () => {
  it('shows the eight Worlds of eight Levels, by name', () => {
    const groups = robotPathSelect(hooks(oldSave({}))).groups();
    expect(groups.map((g) => g.name)).toEqual(WORLDS.map((w) => w.name));
    expect(groups.map((g) => g.levels.length)).toEqual([8, 8, 8, 8, 8, 8, 8, 8]);
  });

  it('loads an old save with the same Levels done and Sparkles, and every World open', () => {
    const progress = oldSave({
      version: 2,
      skin: 'sea',
      // w3-05 was done under "Every level open", which is off again now.
      levels: {
        'w1-01': { done: true, sparkle: true },
        'w1-02': { done: true, sparkle: false, draft: [{ op: 'up' }] },
        'w1-03': { done: false, sparkle: false, draft: [{ op: 'left' }] },
        'w3-05': { done: true, sparkle: true },
      },
      settings: { sound: false, voice: true, speed: 'fast' },
      unlockAll: false,
    });
    const game = robotPathSelect(hooks(progress));
    const groups = game.groups();
    expect(doneIds(progress)).toEqual(['w1-01', 'w1-02', 'w3-05']);
    expect(groups[0]!.levels.slice(0, 3)).toEqual([
      { done: true, sparkle: true },
      { done: true, sparkle: false },
      { done: false, sparkle: false },
    ]);
    expect(game.everyLevelOpen!()).toBe(false);
    expect(game.skins!.current()).toBe('sea');
    // World 2 opened at 6 of World 1's 8 before; now every World's first Level is open.
    expect(groups.map((g) => isLevelOpen(g.levels.map((l) => l.done), 0))).toEqual(Array(8).fill(true));
    const world3 = groups[2]!.levels.map((l) => l.done);
    expect(world3.map((_, i) => isLevelOpen(world3, i))).toEqual([true, false, false, false, true, true, false, false]);
  });

  it('reads a version 1 save the same way, past the maze Worlds', () => {
    const progress = oldSave({ version: 1, levels: { 'w2-08': { done: true }, 'w3-01': { done: true, sparkle: true } } });
    expect(doneIds(progress)).toEqual(['w2-08', 'w6-01']);
  });

  it('plays the Level tapped, and saves the Skin picked', () => {
    const h = hooks(oldSave({}));
    const game = robotPathSelect(h);
    game.play(2, 5);
    expect(h.open).toHaveBeenCalledWith(2, 5);
    expect(game.skins!.chips.map((c) => [c.id, c.label])).toEqual([
      ['garden', 'Garden'],
      ['planet', 'Planet'],
      ['sea', 'Sea'],
    ]);
    game.skins!.choose('planet');
    expect(h.skin).toHaveBeenCalledWith('planet');
  });
});
