// @vitest-environment happy-dom
// A Round as a keyboard or a switch plays it: Bins pressed with click(). Dragging needs a real layout, so
// where a finger lets go is tested as data in sorting.test.ts.
import { gameStorage, memoryStorage } from '@shared/storage';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { App } from '../app';
import { loadProgress, type Save } from '../progress';
import { IDLE_MS, playScreen } from './play';

function app(picks: Partial<Save> = {}): App {
  const progress = loadProgress(gameStorage('tidy-up', memoryStorage()));
  Object.assign(progress.game, picks);
  return {
    root: document.createElement('div'),
    progress,
    start: vi.fn(),
    play: vi.fn(),
    corner: { gear: vi.fn(() => document.createElement('button')), open: vi.fn() },
  };
}

const thing = (a: App) => a.root.querySelector<HTMLElement>('.thing');
const bin = (a: App, sort: string) => a.root.querySelector<HTMLButtonElement>(`.bin[aria-label="${sort}"]`)!;
const binLabels = (a: App) => [...a.root.querySelectorAll('.bin')].map((b) => b.getAttribute('aria-label')).sort();
const pile = (a: App) => a.root.querySelectorAll('.pile-thing').length;
const landed = (a: App, sort: string) => bin(a, sort).querySelectorAll('.landed').length;
/** A keyboard's press: click() with no pointer, detail 0. */
const press = (el: HTMLElement) => el.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }));
/** The Thing on the Spot's own color or shape, and another Bin's. */
const sorts = (a: App) => {
  const own = thing(a)!.getAttribute('aria-label')!;
  return { own, other: binLabels(a).find((s) => s !== own)! };
};

describe('a Round', () => {
  let leave: () => void;
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    leave();
    vi.useRealTimers();
  });

  it('puts two Bins out and a Thing on the Spot from a Pile of eight', async () => {
    const a = app();
    leave = playScreen(a);
    await vi.advanceTimersByTimeAsync(500);
    expect(binLabels(a)).toEqual(['blue', 'red']);
    expect(thing(a)).not.toBeNull();
    expect(pile(a)).toBe(7);
  });

  it('takes a Thing into its own Bin, then serves the next', async () => {
    const a = app();
    leave = playScreen(a);
    await vi.advanceTimersByTimeAsync(500);
    const { own } = sorts(a);
    press(bin(a, own));
    await vi.advanceTimersByTimeAsync(600);
    expect(landed(a, own)).toBe(1);
    expect(pile(a)).toBe(6);
    expect(thing(a)).not.toBeNull();
  });

  it('sends a Miss back and lights its own Bin, and after a second puts it in by itself', async () => {
    const a = app();
    leave = playScreen(a);
    await vi.advanceTimersByTimeAsync(500);
    const { own, other } = sorts(a);
    press(bin(a, other));
    await vi.advanceTimersByTimeAsync(600);
    expect(landed(a, other)).toBe(0);
    expect(bin(a, own).classList.contains('site-sort-glow')).toBe(true);
    expect(pile(a)).toBe(7);

    press(bin(a, other));
    await vi.advanceTimersByTimeAsync(1000);
    expect(landed(a, own)).toBe(1);
    expect(landed(a, other)).toBe(0);
    expect(pile(a)).toBe(6);
  });

  it('nudges her after being still, lighting the Thing’s Bin', async () => {
    const a = app();
    leave = playScreen(a);
    await vi.advanceTimersByTimeAsync(500);
    const { own } = sorts(a);
    expect(bin(a, own).classList.contains('site-sort-glow')).toBe(false);
    await vi.advanceTimersByTimeAsync(IDLE_MS);
    expect(bin(a, own).classList.contains('site-sort-glow')).toBe(true);
  });

  it('tidies when the Pile is empty, with a card for the grown-up and Next to a new Round', async () => {
    const a = app({ skin: 'trucks' });
    leave = playScreen(a);
    await vi.advanceTimersByTimeAsync(500);
    for (let i = 0; i < 8; i++) {
      press(bin(a, sorts(a).own));
      await vi.advanceTimersByTimeAsync(600);
    }
    expect(a.root.querySelectorAll('.bin.tidy')).toHaveLength(2);
    await vi.advanceTimersByTimeAsync(1400);
    expect(a.root.querySelector('.site-sort-look-for')!.textContent).toMatch(/^🔍 Find something (red|blue) at home!$/);
    a.root.querySelector<HTMLButtonElement>('.site-next')!.click();
    await vi.advanceTimersByTimeAsync(500);
    expect(a.root.querySelector('.site-sort-cheer')).toBeNull();
    expect(pile(a)).toBe(7);
    expect(landed(a, 'red') + landed(a, 'blue')).toBe(0);
  });

  it('sorts shapes into Boxes, three at most, and goes Back to Practice', async () => {
    const a = app({ topic: 'shapes', shapes: ['circle', 'square', 'triangle', 'star'] });
    leave = playScreen(a);
    await vi.advanceTimersByTimeAsync(500);
    expect(a.root.querySelector('.site-sort-stage')!.classList.contains('look-box')).toBe(true);
    expect(binLabels(a)).toHaveLength(3);
    expect(pile(a)).toBe(8);
    a.root.querySelector<HTMLButtonElement>('[aria-label="Back"]')!.click();
    expect(a.start).toHaveBeenCalled();
  });
});

describe('a Kinds Round', () => {
  let leave: () => void;
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    leave();
    vi.useRealTimers();
  });

  /** The Thing on the Spot's group: its crate's label, found through the Round's own words. */
  const crates = (a: App) => [...a.root.querySelectorAll<HTMLElement>('.bin.crate')];
  const ownCrate = (a: App, group: string) => a.root.querySelector<HTMLElement>(`.bin.crate[aria-label="${group}"]`)!;
  const loaded = (a: App) => a.root.querySelectorAll('.crate .landed').length;
  const onSpot = (a: App) => thing(a)!.textContent!;
  /** Which crate the Thing on the Spot belongs in, by trying each: the right one takes it. */
  async function sortOne(a: App): Promise<void> {
    const before = loaded(a);
    for (const crate of crates(a)) {
      if (loaded(a) > before) return;
      const spot = onSpot(a);
      press(crate);
      await vi.advanceTimersByTimeAsync(700);
      if (thing(a)?.textContent !== spot || loaded(a) > before) return;
    }
  }

  it('puts out a crate per group of the Step, each with three on its card, and names them before the first Thing', async () => {
    const a = app({ topic: 'kinds', kinds: ['animals-vehicles'] });
    leave = playScreen(a);
    await vi.advanceTimersByTimeAsync(500);
    expect(crates(a).map((c) => c.getAttribute('aria-label')).sort()).toEqual(['animals', 'vehicles']);
    for (const c of crates(a)) expect(c.querySelectorAll('.crate-card .emoji')).toHaveLength(3);
    expect(thing(a)).toBeNull();
    await vi.advanceTimersByTimeAsync(1500);
    expect(thing(a)).not.toBeNull();
    expect(pile(a)).toBe(7);
  });

  it('takes a Thing into its crate, and after two Misses puts it there by itself', async () => {
    const a = app({ topic: 'kinds', kinds: ['food-clothes'] });
    leave = playScreen(a);
    await vi.advanceTimersByTimeAsync(2000);
    const first = onSpot(a);
    press(ownCrate(a, 'food'));
    await vi.advanceTimersByTimeAsync(700);
    const wentIn = loaded(a) === 1;
    if (!wentIn) {
      // It was clothes: that was one Miss; a second puts it in by itself.
      expect(onSpot(a)).toBe(first);
      expect(ownCrate(a, 'clothes').classList.contains('site-sort-glow')).toBe(true);
      press(ownCrate(a, 'food'));
      await vi.advanceTimersByTimeAsync(1000);
      expect(ownCrate(a, 'clothes').querySelectorAll('.landed')).toHaveLength(1);
    } else {
      expect(ownCrate(a, 'food').querySelectorAll('.landed')).toHaveLength(1);
    }
    expect(pile(a)).toBe(6);
  });

  it('tidies when the Pile is empty, with something to look for', async () => {
    const a = app({ topic: 'kinds', kinds: ['birds-fish'] });
    leave = playScreen(a);
    await vi.advanceTimersByTimeAsync(2000);
    for (let i = 0; i < 8; i++) await sortOne(a);
    await vi.advanceTimersByTimeAsync(1500);
    expect(a.root.querySelector('.site-sort-look-for')!.textContent).toMatch(/Name another (bird|fish)!/);
  });
});

