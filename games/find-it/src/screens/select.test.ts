import { gameStorage, memoryStorage } from '@shared/storage';
import { isLevelOpen } from '@shared/unlock';
import { describe, expect, it, vi } from 'vitest';
import type { App } from '../app';
import { loadProgress } from '../progress';
import { BOX_COLOURS, boxBadge, findItSelect } from './select';

/** An App on a save as the Game wrote it, under its real key. */
function app(save: object): App {
  return {
    root: undefined as never,
    progress: loadProgress(gameStorage('find-it', memoryStorage({ 'find-it:v1': JSON.stringify(save) }))),
    boxes: vi.fn(),
    play: vi.fn(),
    corner: { gear: vi.fn(), open: vi.fn() },
  };
}

describe("Find It's level select", () => {
  it('shows Numbers with two Rounds and Letters with five, each in its own colour', () => {
    const groups = findItSelect(app({})).groups();
    expect(groups.map((g) => g.name)).toEqual(['Numbers', 'Letters']);
    expect(groups.map((g) => g.levels.length)).toEqual([2, 5]);
    expect(groups.map((g) => g.colour)).toEqual([BOX_COLOURS.number, BOX_COLOURS.letter]);
  });

  it('opens each Box on its first Round, and the Rounds in order', () => {
    const groups = findItSelect(app({ format: 1, done: { 0: [0] } })).groups();
    const numbers = groups[0]!.levels.map((l) => l.done);
    expect(numbers.map((_, i) => isLevelOpen(numbers, i))).toEqual([true, true]);
    const letters = groups[1]!.levels.map((l) => l.done);
    expect(letters.map((_, i) => isLevelOpen(letters, i))).toEqual([true, false, false, false, false]);
    // No Sparkles: every Round finishes, so there's nothing to score.
    expect(groups.flatMap((g) => g.levels).some((l) => 'sparkle' in l)).toBe(false);
  });

  it('passes Every level open through', () => {
    expect(findItSelect(app({ format: 1, settings: { everyLevelOpen: true } })).everyLevelOpen!()).toBe(true);
    expect(findItSelect(app({})).everyLevelOpen!()).toBe(false);
  });

  it('calls its Levels Rounds', () => {
    expect(findItSelect(app({})).levelWord).toBe('Round');
  });

  it('draws a 3 over beans for Numbers and an A for Letters', () => {
    expect(boxBadge('number')).toMatch(/>3<\/text>/);
    expect(boxBadge('number').match(/<ellipse/g)).toHaveLength(3);
    expect(boxBadge('letter')).toMatch(/>A<\/text>/);
  });

  it('plays the Round tapped', () => {
    const a = app({});
    findItSelect(a).play(1, 2);
    expect(a.play).toHaveBeenCalledWith(1, 2);
  });
});
