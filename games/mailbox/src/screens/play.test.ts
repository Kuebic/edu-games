// @vitest-environment happy-dom
// Rounds as a keyboard or a switch plays them: Mailboxes and letters pressed with click(). Dragging needs a
// real layout, so where a finger lets go is tested in @shared/sort. There's no audio here, so every Name
// is silent.
import { gameStorage, memoryStorage } from '@shared/storage';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { App } from '../app';
import { loadProgress, type Save } from '../progress';
import { playScreen } from './play';

function app(picks: Partial<Save> = {}): App {
  const progress = loadProgress(gameStorage('mailbox', memoryStorage()));
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
const cheer = (a: App) => a.root.querySelector('.site-sort-cheer');

let leave: () => void;
beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  leave();
  vi.useRealTimers();
});

describe('Sort', () => {
  const onSpot = (a: App) => a.root.querySelector<HTMLElement>('.site-sort-stage > .card')!.dataset.letter!;
  const box = (a: App, letter: string) => a.root.querySelector(`.mailbox[data-letter="${letter}"]`)!;
  const bag = (a: App) => a.root.querySelectorAll('.site-sort-pile .card').length;
  const other = (letter: string) => (letter === 'o' ? 's' : 'o');

  it('puts out a Mailbox for O and S, wearing their capitals, and a lowercase letter on the Spot', async () => {
    const a = app();
    leave = playScreen(a);
    await vi.advanceTimersByTimeAsync(500);
    expect([...a.root.querySelectorAll('.mailbox')].map((m) => m.getAttribute('aria-label')).sort()).toEqual(['O', 'S']);
    expect(box(a, 'o').querySelector('.cap')!.textContent).toBe('O');
    expect(['o', 's']).toContain(onSpot(a));
    expect(bag(a)).toBe(7);
  });

  it('posts a letter into its own Mailbox, which puts its flag up, then serves the next', async () => {
    const a = app();
    leave = playScreen(a);
    await vi.advanceTimersByTimeAsync(500);
    const letter = onSpot(a);
    press(box(a, letter));
    await vi.advanceTimersByTimeAsync(700);
    expect(box(a, letter).classList.contains('has-mail')).toBe(true);
    expect(box(a, other(letter)).classList.contains('has-mail')).toBe(false);
    expect(bag(a)).toBe(6);
  });

  it('sends a letter back after a Miss, and into its own Mailbox by itself after two', async () => {
    const a = app();
    leave = playScreen(a);
    await vi.advanceTimersByTimeAsync(500);
    const letter = onSpot(a);
    press(box(a, other(letter)));
    await vi.advanceTimersByTimeAsync(600);
    expect(box(a, letter).classList.contains('site-sort-glow')).toBe(true);
    expect(bag(a)).toBe(7);
    press(box(a, other(letter)));
    await vi.advanceTimersByTimeAsync(1000);
    expect(box(a, letter).classList.contains('has-mail')).toBe(true);
    expect(box(a, other(letter)).classList.contains('has-mail')).toBe(false);
  });

  it('shows a Hint beside an Unlike capital until two clean Rounds, and saves how far it has faded', async () => {
    const a = app({ letters: ['a', 'm'] });
    leave = playScreen(a);
    await vi.advanceTimersByTimeAsync(500);
    expect(box(a, 'a').querySelector('.hint')!.textContent).toBe('a');
    for (let i = 0; i < 8; i++) {
      press(box(a, onSpot(a)));
      await vi.advanceTimersByTimeAsync(700);
    }
    await vi.advanceTimersByTimeAsync(1500);
    expect(cheer(a)?.textContent).toMatch(/in a book together!/);
    expect(a.progress.game.learnt).toEqual({ a: 1, m: 1 });
    press(cheer(a)!.querySelector('.site-next')!);
    await vi.advanceTimersByTimeAsync(500);
    expect(Number(box(a, 'a').querySelector('.hint')!.getAttribute('opacity'))).toBeLessThan(0.45);
  });

  it('shows no Hint on a Same-shape letter', async () => {
    const a = app();
    leave = playScreen(a);
    await vi.advanceTimersByTimeAsync(500);
    expect(a.root.querySelector('.hint')).toBeNull();
  });
});

describe('Find', () => {
  const asker = (a: App) => a.root.querySelector<HTMLElement>('.mailbox.big')!;
  const wanted = (a: App) => asker(a).dataset.letter!;
  const card = (a: App, letter: string) => a.root.querySelector<HTMLElement>(`.site-sort-stage > .card[data-letter="${letter}"]`)!;
  const find = (picks: Partial<Save> = {}) => app({ way: 'find', ...picks });

  it('lays one of each letter on the table, and the Mailbox wears the capital it wants', async () => {
    const a = find();
    leave = playScreen(a);
    await vi.advanceTimersByTimeAsync(500);
    expect([...a.root.querySelectorAll('.site-sort-stage > .card')].map((c) => (c as HTMLElement).dataset.letter).sort()).toEqual(['o', 's']);
    expect(['o', 's']).toContain(wanted(a));
    expect(asker(a).querySelector('.cap')!.textContent).toBe(wanted(a).toUpperCase());
  });

  it('takes the letter asked for, and asks for the same after a Miss', async () => {
    const a = find();
    leave = playScreen(a);
    await vi.advanceTimersByTimeAsync(500);
    const right = wanted(a);
    press(card(a, right === 'o' ? 's' : 'o'));
    await vi.advanceTimersByTimeAsync(500);
    expect(wanted(a)).toBe(right);
    expect(asker(a).classList.contains('has-mail')).toBe(false);
    press(card(a, right));
    await vi.advanceTimersByTimeAsync(1700);
    expect(asker(a).classList.contains('has-mail')).toBe(true);
  });

  it('ends after six Asks with a card, and a Miss keeps that letter’s Hint', async () => {
    const a = find({ letters: ['a', 'm'] });
    leave = playScreen(a);
    await vi.advanceTimersByTimeAsync(500);
    const first = wanted(a);
    press(card(a, first === 'a' ? 'm' : 'a'));
    await vi.advanceTimersByTimeAsync(500);
    for (let i = 0; i < 6; i++) {
      press(card(a, wanted(a)));
      await vi.advanceTimersByTimeAsync(1700);
    }
    await vi.advanceTimersByTimeAsync(1500);
    expect(cheer(a)?.textContent).toMatch(/in a book together!/);
    expect(a.progress.game.learnt).toEqual({ [first]: 0, [first === 'a' ? 'm' : 'a']: 1 });
  });
});
