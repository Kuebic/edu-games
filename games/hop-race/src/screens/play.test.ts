// @vitest-environment happy-dom
import { gameStorage, memoryStorage } from '@shared/storage';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { App } from '../app';
import { loadProgress, setPlayers } from '../progress';
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

describe('a Race with Two players', () => {
  let leave: () => void;
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    leave();
    vi.useRealTimers();
  });

  it('waits for a tap on the Friend’s turn too, with the Friend on the big button', async () => {
    const a = app();
    setPlayers(a.progress, 2);
    leave = playScreen(a, 0, 0);
    const glowing = () => a.root.querySelector<HTMLElement>('.glow');
    const friendAt = () => a.root.querySelector<HTMLElement>('.lane-friend .token')!.style.getPropertyValue('--at');
    await vi.advanceTimersByTimeAsync(2300);
    // The Hopper's turn: spin, then hop until the Spinner glows again.
    glowing()!.click();
    await vi.advanceTimersByTimeAsync(0);
    for (let i = 0; i < 20 && !glowing()?.classList.contains('spinner'); i++) {
      await vi.advanceTimersByTimeAsync(1500);
      if (glowing()?.classList.contains('big-animal')) glowing()!.click();
    }
    // The Friend's turn: the Spinner glows and waits, and the Friend hasn't moved.
    expect(glowing()!.classList.contains('spinner')).toBe(true);
    expect(a.root.querySelector('.big-animal')!.getAttribute('aria-label')).toBe('Hop Frog');
    await vi.advanceTimersByTimeAsync(10000);
    expect(friendAt()).toBe('0');
    glowing()!.click();
    await vi.advanceTimersByTimeAsync(1500);
    glowing()!.click();
    await vi.advanceTimersByTimeAsync(0);
    expect(friendAt()).toBe('1');
  });
});
