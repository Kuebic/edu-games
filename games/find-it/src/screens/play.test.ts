// @vitest-environment happy-dom
// Practice as a finger plays it: the prompt and the Choices pressed with click(). What the Voice says is logged.
import { gameStorage, memoryStorage } from '@shared/storage';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { App } from '../app';
import { loadProgress, type Save } from '../progress';
import { playScreen } from './play';

const said: string[] = [];
vi.mock('@shared/voice', async (actual) => ({
  ...(await actual<typeof import('@shared/voice')>()),
  say: vi.fn((text: string) => {
    said.push(text);
    return Promise.resolve();
  }),
  hush: vi.fn(),
}));
vi.mock('@shared/sound', async (actual) => ({ ...(await actual<typeof import('@shared/sound')>()), note: vi.fn(), buzz: vi.fn(), cheer: vi.fn() }));

function app(picks: Partial<Save> = {}): App {
  const progress = loadProgress(gameStorage('find-it', memoryStorage()));
  Object.assign(progress.game, picks);
  return {
    root: document.createElement('div'),
    progress,
    start: vi.fn(),
    play: vi.fn(),
    corner: { gear: vi.fn(() => document.createElement('button')), open: vi.fn() },
  };
}

const prompt = (a: App) => a.root.querySelector<HTMLButtonElement>('.prompt')!;
const choices = (a: App) => [...a.root.querySelectorAll<HTMLButtonElement>('.choice')];
const label = (el: Element) => el.getAttribute('aria-label')!;
const press = (el: HTMLElement) => el.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }));

describe('a tap', () => {
  let leave: () => void;
  beforeEach(() => {
    vi.useFakeTimers();
    said.length = 0;
  });
  afterEach(() => {
    leave();
    vi.useRealTimers();
  });

  it('on a letter says its name, nothing more', async () => {
    const a = app({ scopes: { number: ['7'], letter: ['A'] }, ways: { number: 'mix', letter: 'find-picture' } });
    leave = playScreen(a, 'letter');
    await vi.advanceTimersByTimeAsync(300);
    expect(said).toHaveLength(1);
    press(prompt(a));
    expect(said.at(-1)).toBe('the letter A');
  });

  it('on a picture says its word, nothing more', async () => {
    const a = app({ scopes: { number: ['7'], letter: ['A'] }, ways: { number: 'mix', letter: 'find-symbol' } });
    leave = playScreen(a, 'letter');
    await vi.advanceTimersByTimeAsync(300);
    press(prompt(a));
    expect(['Apple', 'Ant']).toContain(said.at(-1));
  });

  it('on a number says it; on a Tray, counts it', async () => {
    const a = app({ scopes: { number: ['7'], letter: ['A'] }, ways: { number: 'find-picture', letter: 'mix' } });
    leave = playScreen(a, 'number');
    await vi.advanceTimersByTimeAsync(300);
    press(prompt(a));
    expect(said.at(-1)).toBe('7');
    leave();
    said.length = 0;
    const b = app({ scopes: { number: ['7'], letter: ['A'] }, ways: { number: 'find-symbol', letter: 'mix' } });
    leave = playScreen(b, 'number');
    await vi.advanceTimersByTimeAsync(300);
    press(prompt(b));
    await vi.advanceTimersByTimeAsync(5000);
    expect(said.slice(1)).toEqual(["Let's count!", '1', '2', '3', '4', '5', '6', '7']);
  });

  it('on the prompt while the Find answers a wrong pick is left alone, so the count and the ask come whole', async () => {
    const a = app({ scopes: { number: ['3'], letter: ['A'] }, ways: { number: 'find-symbol', letter: 'mix' } });
    leave = playScreen(a, 'number');
    await vi.advanceTimersByTimeAsync(300);
    const ask = said[0]!;
    press(choices(a).find((c) => label(c) !== '3')!);
    await vi.advanceTimersByTimeAsync(500);
    press(prompt(a));
    await vi.advanceTimersByTimeAsync(5000);
    expect(said.slice(2)).toEqual(["Let's count!", '1', '2', '3', ask]);
    press(prompt(a));
    expect(said.at(-1)).toBe("Let's count!");
  });

  it('on an empty Tray says zero', async () => {
    const a = app({ scopes: { number: ['0'], letter: ['A'] }, ways: { number: 'find-symbol', letter: 'mix' } });
    leave = playScreen(a, 'number');
    await vi.advanceTimersByTimeAsync(300);
    press(prompt(a));
    expect(said.at(-1)).toBe('Zero');
  });

  it('on a wrong Choice says only what it is, then asks again', async () => {
    const a = app({ scopes: { number: ['7'], letter: ['A'] }, ways: { number: 'mix', letter: 'find-picture' } });
    leave = playScreen(a, 'letter');
    await vi.advanceTimersByTimeAsync(300);
    const ask = said[0]!;
    const wrong = choices(a).find((c) => !label(c).startsWith('a'))!;
    press(wrong);
    await vi.advanceTimersByTimeAsync(100);
    const word = label(wrong);
    expect(said.slice(1)).toEqual([word[0]!.toUpperCase() + word.slice(1), ask]);
  });
});
