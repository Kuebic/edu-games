// @vitest-environment happy-dom
import { gameStorage, memoryStorage } from '@shared/storage';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { App } from '../app';
import { loadProgress, type Save } from '../progress';
import { playScreen } from './play';

// A Voice as slow as a browser whose speech engine never speaks: every line waits out a 2-second guard.
vi.mock(import('@shared/voice'), async (actual) => ({
  ...(await actual()),
  say: vi.fn(() => new Promise<void>((resolve) => setTimeout(resolve, 2000))),
  hush: vi.fn(),
}));

function app(picks: Partial<Save>): App {
  const progress = loadProgress(gameStorage('which-way', memoryStorage()));
  Object.assign(progress.game, picks);
  return {
    root: document.createElement('div'),
    progress,
    start: vi.fn(),
    play: vi.fn(),
    corner: { gear: vi.fn(() => document.createElement('button')), open: vi.fn() },
  };
}

const filled = (a: App) => a.root.querySelectorAll('.dot.filled').length;
const pointer = (a: App) => a.root.querySelector<HTMLElement>('.pointer')!;
/** Which way the Treat is from the middle of a ←→ field. */
const treatSide = (a: App) => (Number(a.root.querySelector<HTMLElement>('.treat')!.style.getPropertyValue('--x')) > 2 ? 'Right' : 'Left');
const pick = (a: App, word: string) => a.root.querySelector<HTMLButtonElement>(`.pick[aria-label="${word}"]`)!;

describe('Trips with a slow Voice', () => {
  let leave: () => void;
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    leave();
    vi.useRealTimers();
  });

  it('in Watch, go by themselves, with the Arrow showing, and cheer after five', async () => {
    const a = app({ way: 'watch', scope: ['up'] });
    leave = playScreen(a);
    await vi.advanceTimersByTimeAsync(300);
    expect(pointer(a).hidden).toBe(false);
    expect(a.root.querySelector('.controls')!.children).toHaveLength(0);
    await vi.advanceTimersByTimeAsync(2000);
    expect(filled(a)).toBe(1);
    // Each Trip is 3.6 s; the Cheer comes once the fifth is back in the middle.
    await vi.advanceTimersByTimeAsync(4 * 3600 + 2500);
    expect(a.root.querySelector('.cheer')).not.toBeNull();
  });

  it('in Go, wait for the Go button, and take the first tap on it', async () => {
    const a = app({ way: 'go', scope: ['left'] });
    leave = playScreen(a);
    await vi.advanceTimersByTimeAsync(20000);
    expect(filled(a)).toBe(0);
    expect(pointer(a).hidden).toBe(false);
    a.root.querySelector<HTMLButtonElement>('.go-button')!.click();
    await vi.advanceTimersByTimeAsync(800);
    expect(filled(a)).toBe(1);
  });

  it('in Pick, go the Wrong way and back, glow the right Arrow, then show it beside the Mover', async () => {
    const a = app({ way: 'pick', scope: ['left', 'right'] });
    leave = playScreen(a);
    await vi.advanceTimersByTimeAsync(300);
    expect(pointer(a).hidden).toBe(true);
    const right = treatSide(a);
    const wrong = right === 'Left' ? 'Right' : 'Left';

    pick(a, wrong).click();
    // A tap while the Mover is out does nothing.
    await vi.advanceTimersByTimeAsync(100);
    pick(a, right).click();
    await vi.advanceTimersByTimeAsync(2100);
    expect(filled(a)).toBe(0);
    expect(pick(a, right).classList.contains('glow')).toBe(true);
    expect(pointer(a).hidden).toBe(true);

    pick(a, wrong).click();
    await vi.advanceTimersByTimeAsync(2100);
    expect(pointer(a).hidden).toBe(false);

    pick(a, right).click();
    await vi.advanceTimersByTimeAsync(800);
    expect(filled(a)).toBe(1);
  });
});
