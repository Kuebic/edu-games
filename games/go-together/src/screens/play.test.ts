// @vitest-environment happy-dom
// A Board as a keyboard or a switch plays it: Cards pressed with click(). There's no audio here, so every
// Word is silent, and no layout, so the Frames' positions aren't measured.
import { gameStorage, memoryStorage } from '@shared/storage';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { App } from '../app';
import { loadProgress, type Save } from '../progress';
import { IDLE_MS, playScreen } from './play';

function app(picks: Partial<Save> = {}): App {
  const progress = loadProgress(gameStorage('go-together', memoryStorage()));
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
const cards = (a: App) => [...a.root.querySelectorAll<HTMLElement>('.card')];
const frames = (a: App) => [...a.root.querySelectorAll<HTMLElement>('.frame')];
const groupOf = (card: HTMLElement) => card.dataset.group!;
/** The Cards of the first Card's group, and one Card from another. */
const split = (a: App) => {
  const all = cards(a);
  const group = groupOf(all[0]!);
  return { own: all.filter((c) => groupOf(c) === group), other: all.find((c) => groupOf(c) !== group)! };
};
const cheer = (a: App) => a.root.querySelector('.site-sort-cheer');
const showMe = (a: App) => a.root.querySelector<HTMLButtonElement>('.show-me')!;

let leave: () => void;
beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  leave();
  vi.useRealTimers();
});

describe('a Board', () => {
  it('deals six Cards in two hidden groups under two empty Frames, each Card named for a screen reader', async () => {
    const a = app();
    leave = playScreen(a);
    await vi.advanceTimersByTimeAsync(100);
    expect(cards(a)).toHaveLength(6);
    expect(frames(a)).toHaveLength(2);
    expect(new Set(cards(a).map(groupOf)).size).toBe(2);
    for (const c of cards(a)) expect(c.getAttribute('aria-label')).toBeTruthy();
    for (const f of frames(a)) expect(f.classList.contains('full')).toBe(false);
  });

  it('lifts a tapped Card, puts it down on a second tap', async () => {
    const a = app();
    leave = playScreen(a);
    await vi.advanceTimersByTimeAsync(100);
    const [first] = cards(a);
    press(first!);
    expect(first!.getAttribute('aria-pressed')).toBe('true');
    press(first!);
    expect(first!.getAttribute('aria-pressed')).toBe('false');
  });

  it('gathers a whole group into the next Frame, leaving its places empty', async () => {
    const a = app();
    leave = playScreen(a);
    await vi.advanceTimersByTimeAsync(100);
    const { own } = split(a);
    for (const c of own) press(c);
    await vi.advanceTimersByTimeAsync(1500);
    expect(frames(a)[0]!.classList.contains('full')).toBe(true);
    expect(frames(a)[0]!.querySelectorAll('.emoji')).toHaveLength(3);
    for (const c of own) expect(c.classList.contains('gone')).toBe(true);
  });

  it('bumps a Card outside the lead’s group, however often, without showing where the group is or gathering it', async () => {
    const a = app();
    leave = playScreen(a);
    await vi.advanceTimersByTimeAsync(100);
    const { own, other } = split(a);
    press(own[0]!);
    for (let miss = 0; miss < 8; miss++) {
      press(other);
      await vi.advanceTimersByTimeAsync(2000);
      expect(other.getAttribute('aria-pressed')).toBe('false');
      expect(own[0]!.getAttribute('aria-pressed')).toBe('true');
      // Nothing marks the Cards she is looking for.
      for (const c of own.slice(1)) expect(c.className).toBe('card');
      expect(frames(a)[0]!.classList.contains('full')).toBe(false);
    }
    press(own[1]!);
    press(own[2]!);
    await vi.advanceTimersByTimeAsync(1500);
    expect(frames(a)[0]!.classList.contains('full')).toBe(true);
  });

  it('shows Show Me only after a Miss, and it gathers the lead’s group and goes away', async () => {
    const a = app();
    leave = playScreen(a);
    await vi.advanceTimersByTimeAsync(100);
    const { own, other } = split(a);
    expect(showMe(a).hidden).toBe(true);
    press(own[0]!);
    expect(showMe(a).hidden).toBe(true);
    press(other);
    expect(showMe(a).hidden).toBe(false);
    press(showMe(a));
    expect(showMe(a).hidden).toBe(true);
    await vi.advanceTimersByTimeAsync(2000);
    expect(frames(a)[0]!.classList.contains('full')).toBe(true);
    expect(frames(a)[0]!.dataset.group).toBe(groupOf(own[0]!));
    for (const c of own) expect(c.classList.contains('gone')).toBe(true);
    expect(showMe(a).hidden).toBe(true);
  });

  it('takes Show Me away when the lead is put down', async () => {
    const a = app();
    leave = playScreen(a);
    await vi.advanceTimersByTimeAsync(100);
    const { own, other } = split(a);
    press(own[0]!);
    press(other);
    press(own[0]!);
    expect(showMe(a).hidden).toBe(true);
  });

  it('ignores taps while Show Me is still gathering, so the two groups land in their own Frames', async () => {
    const a = app();
    leave = playScreen(a);
    await vi.advanceTimersByTimeAsync(100);
    const { own, other } = split(a);
    press(own[0]!);
    press(other);
    press(showMe(a));
    press(other);
    press(showMe(a));
    await vi.advanceTimersByTimeAsync(2000);
    expect(frames(a)[0]!.classList.contains('full')).toBe(true);
    expect(frames(a)[1]!.classList.contains('full')).toBe(false);
    expect(cheer(a)).toBeNull();
  });

  it('gathers the last group on its first tap and ends with a card for the grown-up', async () => {
    const a = app();
    leave = playScreen(a);
    await vi.advanceTimersByTimeAsync(100);
    const { own, other } = split(a);
    for (const c of own) press(c);
    await vi.advanceTimersByTimeAsync(1500);
    press(other);
    await vi.advanceTimersByTimeAsync(4000);
    expect(frames(a)[1]!.classList.contains('full')).toBe(true);
    expect(cheer(a)?.textContent).toMatch(/go together/);
    press(cheer(a)!.querySelector('.site-next')!);
    await vi.advanceTimersByTimeAsync(100);
    expect(cheer(a)).toBeNull();
    expect(cards(a).filter((c) => !c.classList.contains('gone'))).toHaveLength(6);
  });

  it('nudges a Card after a quiet while; with a lead up it nudges the lead, then Show Me, never the group', async () => {
    const a = app();
    leave = playScreen(a);
    await vi.advanceTimersByTimeAsync(100);
    await vi.advanceTimersByTimeAsync(IDLE_MS);
    expect(cards(a).some((c) => c.classList.contains('site-sort-nudge'))).toBe(true);
    const { own, other } = split(a);
    press(own[0]!);
    for (const c of cards(a)) c.classList.remove('site-sort-nudge');
    await vi.advanceTimersByTimeAsync(IDLE_MS);
    expect(own[0]!.classList.contains('site-sort-nudge')).toBe(true);
    for (const c of own.slice(1)) expect(c.className).toBe('card');
    press(other);
    await vi.advanceTimersByTimeAsync(IDLE_MS);
    expect(showMe(a).classList.contains('site-sort-nudge')).toBe(true);
    for (const c of own.slice(1)) expect(c.className).toBe('card');
  });

  it('deals a Board of 16 in four groups of four on Same', async () => {
    const a = app({ topic: 'same', board: 16 });
    leave = playScreen(a);
    await vi.advanceTimersByTimeAsync(100);
    expect(cards(a)).toHaveLength(16);
    expect(frames(a)).toHaveLength(4);
    const { own } = split(a);
    expect(own).toHaveLength(4);
    expect(new Set(own.map((c) => c.textContent)).size).toBe(1);
  });
});
