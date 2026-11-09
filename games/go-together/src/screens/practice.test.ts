import { gameStorage, memoryStorage } from '@shared/storage';
import { describe, expect, it, vi } from 'vitest';
import type { App } from '../app';
import { loadProgress } from '../progress';
import { goTogetherPractice } from './practice';

function app(save: object = {}): App {
  const storage = gameStorage('go-together', memoryStorage({ 'go-together:v1': JSON.stringify(save) }));
  return {
    root: undefined as never,
    progress: loadProgress(storage),
    start: vi.fn(),
    play: vi.fn(),
    corner: { gear: vi.fn(), open: vi.fn() },
  };
}

describe("Go Together's Practice", () => {
  it('has Same, Colors and Kinds, each with the four Boards as its Ways', () => {
    const [same, colors, kinds] = goTogetherPractice(app()).topics;
    expect(same!.name).toBe('Same');
    expect(same!.items).toEqual(['🐕', '🚗', '🍞', '👕', '🪀', '🌳']);
    expect(same!.ranges.map((r) => r.label)).toEqual(['All']);
    expect(colors!.items).toEqual(['🔴', '🔵', '🟡', '🟢', '🟠', '🟣', '🩷']);
    expect(colors!.ranges.map((r) => r.label)).toEqual(['🔴🔵🟡', 'All']);
    expect(kinds!.items).toEqual(['🐕', '🚗', '🍞', '👕', '🪀', '🌳', '🐦', '🐟', '🍎', '🥕']);
    expect(kinds!.ranges.map((r) => r.label)).toEqual(['Easy', 'All']);
    expect(kinds!.ranges[0]!.items).toEqual(['🐕', '🚗', '🍞', '👕']);
    for (const t of [same!, colors!, kinds!]) expect(t.ways.map((w) => w.id)).toEqual(['4', '6', '9', '16']);
  });

  it('needs as many items as the Board has groups, and one pool on Same', () => {
    const a = app({ format: 1, game: { board: 9 } });
    const [same, colors, kinds] = goTogetherPractice(a).topics;
    expect(same!.fewest).toBe(1);
    expect(colors!.fewest).toBe(3);
    expect(kinds!.fewest).toBe(3);
    a.progress.game.board = 16;
    expect(goTogetherPractice(a).topics[2]!.fewest).toBe(4);
  });

  it('shows the saved picks and saves new ones', () => {
    const a = app();
    const practice = goTogetherPractice(a);
    expect(practice.topic()).toBe(2);
    expect(practice.scope(2)).toEqual(['🐕', '🚗', '🍞', '👕']);
    expect(practice.way(2)).toBe('6');
    practice.chooseTopic(1);
    practice.setScope(1, ['🟢', '🩷']);
    practice.setScope(0, ['🪀']);
    practice.chooseWay(1, '9');
    expect(a.progress.game.topic).toBe('colors');
    expect(a.progress.game.colors).toEqual(['green', 'pink']);
    expect(a.progress.game.same).toEqual(['toys']);
    expect(a.progress.game.board).toBe(9);
  });

  it('plays with the saved picks', () => {
    const a = app();
    goTogetherPractice(a).play(2);
    expect(a.play).toHaveBeenCalled();
  });
});
