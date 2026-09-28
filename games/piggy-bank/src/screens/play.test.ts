// @vitest-environment happy-dom
// Rounds as a keyboard or a switch plays them: pigs and coins pressed with click(). Dragging needs a real
// layout, so where a finger lets go is tested as data in money.test.ts. There's no audio here, so every
// Word is silent and the pig's bubble shows a picture.
import { gameStorage, memoryStorage } from '@shared/storage';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { App } from '../app';
import { loadProgress, type Save } from '../progress';
import { playScreen } from './play';

function app(picks: Partial<Save> = {}): App {
  const progress = loadProgress(gameStorage('piggy-bank', memoryStorage()));
  Object.assign(progress.game, picks);
  return {
    root: document.createElement('div'),
    progress,
    start: vi.fn(),
    play: vi.fn(),
    corner: { gear: vi.fn(() => document.createElement('button')), open: vi.fn() },
  };
}

/** A keyboard's press: click() with no pointer, detail 0. */
const press = (el: Element) => el.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }));
const cheer = (a: App) => a.root.querySelector('.cheer');

let leave: () => void;
beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  leave();
  vi.useRealTimers();
});

describe('Sort', () => {
  const onSpot = (a: App) => a.root.querySelector<HTMLElement>('.stage > .piece')!.dataset.money!;
  const bank = (a: App, money: string) => a.root.querySelector(`.pig[aria-label="${money}"]`)!;
  const inBelly = (a: App, money: string) => bank(a, money).querySelectorAll('.in-belly').length;
  const purse = (a: App) => a.root.querySelectorAll('.purse .piece').length;
  const other = (money: string) => (money === 'penny' ? 'quarter' : 'penny');

  it('puts a Bank out for the penny and the quarter, each with its picture, and a piece on the Spot', async () => {
    const a = app();
    leave = playScreen(a);
    await vi.advanceTimersByTimeAsync(500);
    expect([...a.root.querySelectorAll('.pig')].map((p) => p.getAttribute('aria-label')).sort()).toEqual(['penny', 'quarter']);
    expect(bank(a, 'penny').querySelector('.tag')).not.toBeNull();
    expect(['penny', 'quarter']).toContain(onSpot(a));
    expect(purse(a)).toBe(7);
  });

  it('takes a piece into its own Bank, where it shows through, then serves the next', async () => {
    const a = app();
    leave = playScreen(a);
    await vi.advanceTimersByTimeAsync(500);
    const money = onSpot(a);
    press(bank(a, money));
    await vi.advanceTimersByTimeAsync(700);
    expect(inBelly(a, money)).toBe(1);
    expect(purse(a)).toBe(6);
  });

  it('sends a piece back after a Miss, and into its own Bank by itself after two', async () => {
    const a = app();
    leave = playScreen(a);
    await vi.advanceTimersByTimeAsync(500);
    const money = onSpot(a);
    press(bank(a, other(money)));
    await vi.advanceTimersByTimeAsync(500);
    expect(bank(a, money).classList.contains('glow')).toBe(true);
    expect(inBelly(a, money)).toBe(0);
    press(bank(a, other(money)));
    await vi.advanceTimersByTimeAsync(1000);
    expect(inBelly(a, money)).toBe(1);
    expect(inBelly(a, other(money))).toBe(0);
  });

  it('ends when the Purse is empty, with a card for the grown-up, and Next deals again', async () => {
    const a = app();
    leave = playScreen(a);
    await vi.advanceTimersByTimeAsync(500);
    for (let i = 0; i < 8; i++) {
      press(bank(a, onSpot(a)));
      await vi.advanceTimersByTimeAsync(700);
    }
    await vi.advanceTimersByTimeAsync(1500);
    expect(cheer(a)?.textContent).toMatch(/Find a (penny|quarter) with a grown-up!/);
    (cheer(a)!.querySelector('.site-next') as HTMLElement).click();
    await vi.advanceTimersByTimeAsync(500);
    expect(purse(a)).toBe(7);
  });
});

describe('Find', () => {
  const wanted = (a: App) => /wants a (\w+)/.exec(a.root.querySelector('.pig')!.getAttribute('aria-label')!)?.[1];
  const coin = (a: App, money: string) => a.root.querySelector<HTMLElement>(`.stage > .piece[data-money="${money}"]`)!;
  const inBelly = (a: App) => a.root.querySelectorAll('.pig .in-belly').length;
  const find = () => app({ way: 'find' });

  it('lays one of each kind on the table and asks for one, with its picture when there is no sound', async () => {
    const a = find();
    leave = playScreen(a);
    await vi.advanceTimersByTimeAsync(500);
    expect([...a.root.querySelectorAll('.stage > .piece')].map((p) => (p as HTMLElement).dataset.money).sort()).toEqual(['penny', 'quarter']);
    expect(['penny', 'quarter']).toContain(wanted(a));
    expect(a.root.querySelector('.bubble.up img')).not.toBeNull();
  });

  it('takes the coin asked for into the pig, then asks again', async () => {
    const a = find();
    leave = playScreen(a);
    await vi.advanceTimersByTimeAsync(500);
    press(coin(a, wanted(a)!));
    await vi.advanceTimersByTimeAsync(1700);
    expect(inBelly(a)).toBe(1);
    expect(a.root.querySelector('.bubble.up')).not.toBeNull();
  });

  it('asks for the same coin again after a Miss, and lights it and puts it in by itself after two', async () => {
    const a = find();
    leave = playScreen(a);
    await vi.advanceTimersByTimeAsync(500);
    const right = wanted(a)!;
    const wrong = right === 'penny' ? 'quarter' : 'penny';
    const bubble = a.root.querySelector('.bubble')!;
    bubble.classList.remove('asking');
    press(coin(a, wrong));
    await vi.advanceTimersByTimeAsync(500);
    expect(wanted(a)).toBe(right);
    expect(bubble.classList.contains('asking')).toBe(true);
    expect(bubble.querySelector('img')!.getAttribute('src')).toBe(coin(a, right).querySelector('img')!.getAttribute('src'));
    expect(coin(a, right).classList.contains('glow')).toBe(false);
    expect(inBelly(a)).toBe(0);
    press(coin(a, wrong));
    await vi.advanceTimersByTimeAsync(500);
    expect(coin(a, right).classList.contains('glow')).toBe(true);
    await vi.advanceTimersByTimeAsync(1500);
    expect(inBelly(a)).toBe(1);
    expect(a.root.querySelector('.pig .in-belly')!.getAttribute('src')).toBe(coin(a, right).querySelector('img')!.getAttribute('src'));
  });

  it('ends after six Asks, with a card for the grown-up', async () => {
    const a = find();
    leave = playScreen(a);
    await vi.advanceTimersByTimeAsync(500);
    for (let i = 0; i < 6; i++) {
      press(coin(a, wanted(a)!));
      await vi.advanceTimersByTimeAsync(1700);
    }
    await vi.advanceTimersByTimeAsync(1500);
    expect(inBelly(a)).toBe(6);
    expect(cheer(a)?.textContent).toMatch(/with a grown-up!/);
  });
});
