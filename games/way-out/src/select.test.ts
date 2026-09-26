import { gameStorage, memoryStorage } from '@shared/storage';
import { isLevelOpen } from '@shared/unlock';
import { describe, expect, it, vi } from 'vitest';
import type { App } from './app';
import { LEVELS } from './levels';
import { loadProgress, type Progress } from './progress';
import { wayOutSelect } from './select';
import { skinById } from './skins';

/** An App around this progress that only records where it was sent. */
function fakeApp(progress: Progress) {
  return {
    root: undefined as unknown as HTMLElement,
    progress,
    skin: () => skinById(progress.game.skin),
    home() {},
    pack() {},
    level: vi.fn<App['level']>(),
    pool() {},
    parent() {},
  } satisfies App;
}

/** A save as the Game wrote it before the level select, under its real key. */
const oldSave = (save: object) => loadProgress(gameStorage('way-out', memoryStorage({ 'way-out:v1': JSON.stringify(save) })));

describe("Way Out's level select", () => {
  it('shows five Packs of twelve, and the Grown-up Pack only behind its switch', () => {
    const progress = oldSave({ version: 1 });
    const game = wayOutSelect(fakeApp(progress));
    expect(game.groups().map((g) => [g.name, g.levels.length])).toEqual([
      ['First drive', 12],
      ['Busy street', 12],
      ['Traffic', 12],
      ['Jam', 12],
      ['Gridlock', 12],
    ]);
    progress.game.grownUp = true;
    expect(game.groups().at(-1)!.name).toBe('Grown-up');
  });

  it('loads an old save with the same Levels done, and nothing else moved', () => {
    const progress = oldSave({
      version: 1,
      skin: 'space',
      // p3-05 was done out of order under "Every level open", which is off again now.
      levels: {
        'p1-01': { done: true, sparkle: true, bestMoves: 2 },
        'p1-02': { done: true, sparkle: false, bestMoves: 5 },
        'p3-05': { done: true, sparkle: true },
        'p2-01': { done: false, sparkle: false, inProgress: { board: LEVELS[12]!.board, moves: 0, history: [] } },
      },
      poolSeen: { 2: [] },
      poolSparkles: { 2: 3 },
      settings: { sound: true, voice: false },
      unlockAll: false,
      grownUp: false,
    });
    const game = wayOutSelect(fakeApp(progress));
    const groups = game.groups();
    const done = groups.flatMap((g, p) => g.levels.flatMap((l, i) => (l.done ? [`p${p + 1}-${String(i + 1).padStart(2, '0')}`] : [])));
    expect(done).toEqual(['p1-01', 'p1-02', 'p3-05']);
    expect(groups[0]!.levels.map((l) => l.sparkle).slice(0, 3)).toEqual([true, false, false]);
    expect(groups.map((g) => g.bonusSparkles)).toEqual([0, 3, 0, 0, 0]);
    expect(game.everyLevelOpen!()).toBe(false);
    expect(game.skins!.current()).toBe('space');
    // A done Level stays open, and so does the one after it.
    const pack3 = groups[2]!.levels.map((l) => l.done);
    expect(pack3.map((_, i) => isLevelOpen(pack3, i))).toEqual([true, false, false, false, true, true, false, false, false, false, false, false]);
  });

  it('plays the Level tapped, counting from 0', () => {
    const app = fakeApp(oldSave({}));
    wayOutSelect(app).play(1, 3);
    expect(app.level).toHaveBeenCalledWith(LEVELS.find((l) => l.id === 'p2-04'));
  });
});
