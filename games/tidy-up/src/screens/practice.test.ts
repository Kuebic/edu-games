import { gameStorage, memoryStorage } from '@shared/storage';
import { describe, expect, it, vi } from 'vitest';
import type { App } from '../app';
import { loadProgress } from '../progress';
import { tidyUpPractice } from './practice';

/** An App on a device holding this save, as the Game wrote it, under its real key. */
function app(save: object = {}): App {
  const storage = gameStorage('tidy-up', memoryStorage({ 'tidy-up:v1': JSON.stringify(save) }));
  return {
    root: undefined as never,
    progress: loadProgress(storage),
    start: vi.fn(),
    play: vi.fn(),
    corner: { gear: vi.fn(), open: vi.fn() },
  };
}

describe("Tidy Up's Practice", () => {
  it('has Colors, Shapes and Kinds, each with its items in order, a Range and All, two Ways, and Colors and Shapes need two items', () => {
    const [colors, shapes, kinds] = tidyUpPractice(app()).topics;
    expect(colors!.items).toEqual(['🔴', '🔵', '🟡', '🟢', '🟠', '🟣', '🩷']);
    expect(colors!.ranges.map((r) => r.label)).toEqual(['🔴🔵🟡', 'All']);
    expect(colors!.ways.map((w) => w.id)).toEqual(['blocks', 'things']);
    expect(shapes!.items).toEqual(['⚪', '🟦', '🔺', '⭐', '❤️']);
    expect(shapes!.ways.map((w) => w.id)).toEqual(['plain', 'colorful']);
    expect(colors!.fewest).toBe(2);
    expect(shapes!.fewest).toBe(2);
    expect(kinds!.name).toBe('Kinds');
    expect(kinds!.items).toEqual(['🐕🚗', '🍞👕', '🪀👕', '🐕👕🍞', '🐕🌳', '🐕🚗🌳', '🐦🐟', '🍎🥕', '🐕🐦']);
    expect(kinds!.ranges.map((r) => r.label)).toEqual(['Easy', 'All']);
    expect(kinds!.ways.map((w) => w.id)).toEqual(['clear', 'tricky']);
    expect(kinds!.fewest).toBeUndefined();
    expect(kinds!.skins).toBeUndefined();
  });

  it('shows the saved picks, and saves new ones per Topic', () => {
    const a = app();
    const practice = tidyUpPractice(a);
    expect(practice.topic()).toBe(0);
    expect(practice.scope(0)).toEqual(['🔴', '🔵']);
    practice.setScope(0, ['🔴', '🟡', '🩷']);
    practice.chooseWay(0, 'things');
    practice.chooseTopic(1);
    practice.setScope(1, ['🔺', '⭐']);
    practice.chooseWay(1, 'colorful');
    expect(a.progress.game).toMatchObject({
      topic: 'shapes',
      colors: ['red', 'yellow', 'pink'],
      colorsWay: 'things',
      shapes: ['triangle', 'star'],
      shapesWay: 'colorful',
    });
    expect(tidyUpPractice(app({ format: 1, game: { topic: 'shapes' } })).topic()).toBe(1);
    practice.chooseTopic(2);
    practice.setScope(2, ['🐦🐟', '🐕🚗']);
    practice.chooseWay(2, 'tricky');
    expect(a.progress.game).toMatchObject({ topic: 'kinds', kinds: ['animals-vehicles', 'birds-fish'], kindsWay: 'tricky' });
    expect(practice.scope(2)).toEqual(['🐕🚗', '🐦🐟']);
  });

  it('has Skin chips on Colors only, and saves the one picked', () => {
    const a = app();
    const [colors, shapes] = tidyUpPractice(a).topics;
    expect(shapes!.skins).toBeUndefined();
    expect(colors!.skins!.chips.map((c) => c.label)).toEqual(['Buckets', 'Trucks']);
    colors!.skins!.choose('trucks');
    expect(a.progress.game.skin).toBe('trucks');
  });

  it('plays with the saved picks', () => {
    const a = app();
    tidyUpPractice(a).play(0);
    expect(a.play).toHaveBeenCalled();
  });
});
