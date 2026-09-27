// @vitest-environment happy-dom
import { gameStorage, memoryStorage } from '@shared/storage';
import { describe, expect, it, vi } from 'vitest';
import type { App } from '../app';
import { loadProgress } from '../progress';
import { TRACK_COLOURS, hopRaceSelect, trackBadge } from './select';

/** An App on a save as the Game wrote it, under its real key. */
function app(save: object = {}): App {
  return {
    root: undefined as never,
    progress: loadProgress(gameStorage('hop-race', memoryStorage({ 'hop-race:v1': JSON.stringify(save) }))),
    groups: vi.fn(),
    play: vi.fn(),
    corner: { gear: vi.fn(() => document.createElement('button')), open: vi.fn() },
  };
}

describe("Hop Race's level select", () => {
  it('shows the three Tracks, each in its own colour, and calls a Level a Race', () => {
    const select = hopRaceSelect(app());
    const groups = select.groups();
    expect(groups.map((g) => g.name)).toEqual(['To 5', 'To 10', "Who's ahead"]);
    expect(groups.map((g) => g.levels.length)).toEqual([3, 4, 4]);
    expect(groups.map((g) => g.colour)).toEqual([...TRACK_COLOURS]);
    expect(select.levelWord).toBe('Race');
  });

  it('draws each Track’s Home on its badge, and a question on Who’s ahead', () => {
    expect(trackBadge(0)).toMatch(/>5<\/text>/);
    expect(trackBadge(1)).toMatch(/>10<\/text>/);
    expect(trackBadge(2)).toMatch(/>\?<\/text>/);
  });

  it('has a chip per Hopper, and a chip picked is the Hopper saved', () => {
    const a = app();
    const { skins } = hopRaceSelect(a);
    expect(skins!.chips.map((c) => c.label)).toEqual(['Bunny', 'Puppy', 'Kitty', 'Bear']);
    expect(skins!.current()).toBe('bunny');
    skins!.choose('kitty');
    expect(a.progress.game.hopper).toBe('kitty');
    skins!.choose('dragon');
    expect(a.progress.game.hopper).toBe('kitty');
  });

  it('passes Every level open through, and plays the Race tapped', () => {
    const a = app({ format: 1, settings: { everyLevelOpen: true } });
    expect(hopRaceSelect(a).everyLevelOpen!()).toBe(true);
    hopRaceSelect(a).play(2, 1);
    expect(a.play).toHaveBeenCalledWith(2, 1);
  });
});
