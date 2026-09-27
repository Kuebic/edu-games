// @vitest-environment happy-dom
import { gameStorage, memoryStorage } from '@shared/storage';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { App } from '../app';
import { loadProgress } from '../progress';
import { playScreen } from './play';

// A Voice as slow as a browser whose speech engine never speaks: every line waits out a 2-second guard.
vi.mock(import('@shared/voice'), async (actual) => ({
  ...(await actual()),
  say: vi.fn(() => new Promise<void>((resolve) => setTimeout(resolve, 2000))),
  hush: vi.fn(),
}));

function app(): App {
  return {
    root: document.createElement('div'),
    progress: loadProgress(gameStorage('hop-race', memoryStorage())),
    groups: vi.fn(),
    play: vi.fn(),
    corner: { gear: vi.fn(() => document.createElement('button')), open: vi.fn() },
  };
}

describe('a Race with a slow Voice', () => {
  let leave: () => void;
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    leave();
    vi.useRealTimers();
  });

  it('takes the first tap on a glowing Spinner or Hopper, cutting off the ask', async () => {
    const a = app();
    leave = playScreen(a, 0, 0);
    // The start line.
    await vi.advanceTimersByTimeAsync(2300);
    const spinner = a.root.querySelector<HTMLElement>('.spinner.glow');
    expect(spinner).not.toBeNull();
    spinner!.click();
    await vi.advanceTimersByTimeAsync(0);
    expect(a.root.querySelector<HTMLElement>('.arrow')!.style.rotate).not.toBe('');

    // The spin lands, and the Hopper glows while "One hop!" or "Two hops!" is still being said.
    await vi.advanceTimersByTimeAsync(1450);
    const hopper = a.root.querySelector<HTMLElement>('.big-animal.glow');
    expect(hopper).not.toBeNull();
    hopper!.click();
    await vi.advanceTimersByTimeAsync(0);
    expect(a.root.querySelector<HTMLElement>('.lane-hopper .token')!.style.getPropertyValue('--at')).toBe('1');
  });
});
