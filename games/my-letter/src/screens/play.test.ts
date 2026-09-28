// @vitest-environment happy-dom
import { gameStorage, memoryStorage } from '@shared/storage';
import { hush } from '@shared/voice';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { App } from '../app';
import { MY_WORDS } from '../letters';
import { loadProgress, setName } from '../progress';
import { playScreen } from './play';

// A Voice as slow as a browser whose speech engine never speaks: every line waits out a 2-second guard.
vi.mock(import('@shared/voice'), async (actual) => ({
  ...(await actual()),
  say: vi.fn(() => new Promise<void>((resolve) => setTimeout(resolve, 2000))),
  hush: vi.fn(),
}));

function app(name: string): App {
  const progress = loadProgress(gameStorage('my-letter', memoryStorage()));
  setName(progress, name);
  return {
    root: document.createElement('div'),
    progress,
    groups: vi.fn(),
    play: vi.fn(),
    board: vi.fn(),
    corner: {
      gear: vi.fn(() => document.createElement('button')),
      open: vi.fn(),
    },
  };
}

/** The Tiles still to find, as their letters. */
const tilesLeft = (a: App) => [...a.root.querySelectorAll<HTMLElement>('.tile:not(.right)')];
const tile = (a: App, letter: string) => tilesLeft(a).find((t) => t.textContent === letter)!;
const filled = (a: App) => [...a.root.querySelectorAll('.nl-filled')].map((c) => c.textContent).join('');

describe('a Spell', () => {
  let leave: () => void;
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    leave();
    vi.useRealTimers();
  });

  it('shows every letter of the word as a Tile, in a jumble', async () => {
    const a = app('Anna');
    leave = playScreen(a, MY_WORDS, 0);
    await vi.advanceTimersByTimeAsync(300);
    const tiles = [...a.root.querySelectorAll('.tile')].map((t) => t.textContent);
    expect([...tiles].sort().join('')).toBe('AANN');
    expect(tiles.join('')).not.toBe('ANNA');
  });

  it('takes the next letter at once, while the last one is still being said', async () => {
    const a = app('Kaia');
    leave = playScreen(a, MY_WORDS, 0);
    await vi.advanceTimersByTimeAsync(300);
    tile(a, 'K').click();
    await vi.advanceTimersByTimeAsync(0);
    expect(filled(a)).toBe('K');
    // "That's the letter K!" is still being said.
    vi.mocked(hush).mockClear();
    tile(a, 'A').click();
    await vi.advanceTimersByTimeAsync(0);
    expect(hush).toHaveBeenCalled();
    expect(filled(a)).toBe('KA');
    tile(a, 'I').click();
    tile(a, 'A').click();
    await vi.advanceTimersByTimeAsync(0);
    expect(filled(a)).toBe('KAIA');
    expect(a.progress.marks(MY_WORDS)[0]!.done).toBe(false);
    // The last letter's line is said out, then the Level is done.
    await vi.advanceTimersByTimeAsync(2100);
    expect(a.progress.marks(MY_WORDS)[0]!.done).toBe(true);
  });

  it('keeps a Tile tapped out of turn, as it’s needed later', async () => {
    const a = app('Sam');
    leave = playScreen(a, MY_WORDS, 0);
    await vi.advanceTimersByTimeAsync(300);
    tile(a, 'M').click();
    await vi.advanceTimersByTimeAsync(2100);
    expect(filled(a)).toBe('');
    expect(tilesLeft(a)).toHaveLength(3);
    for (const letter of 'SAM') tile(a, letter).click();
    await vi.advanceTimersByTimeAsync(0);
    expect(filled(a)).toBe('SAM');
  });
});
