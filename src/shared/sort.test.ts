// @vitest-environment happy-dom
// The sorting screen with a made-up Game: Bins pressed from a keyboard (click with detail 0), since dragging
// needs a real layout; where a finger lets go is tested as data.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { binAt, binsFrom, IDLE_MS, pileOf, playStage, sortRounds, type SortGame } from './sort';

/** A seeded random, so a failure can be run again. */
function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 2 ** 32;
    return s / 2 ** 32;
  };
}

describe('Rounds as data', () => {
  it('take each Scope item once before any comes again, up to three Bins, never twice in one', () => {
    const next = binsFrom(['a', 'b', 'c', 'd', 'e', 'f', 'g'], seeded(3));
    const seen = Array.from({ length: 7 }, next);
    for (const bins of seen) expect(new Set(bins).size).toBe(3);
    const all = seen.flat();
    for (const k of 'abcdefg') expect(all.filter((x) => x === k).length).toBe(3);
    expect(binsFrom(['a', 'b'], seeded(1))().sort()).toEqual(['a', 'b']);
  });

  it('never deal three in a row for one Bin', () => {
    for (let seed = 1; seed < 80; seed++) {
      const pile = pileOf([...'aaaabbbb'], (x) => x, seeded(seed));
      expect(pile.some((x, i) => i >= 2 && x === pile[i - 1] && x === pile[i - 2]), pile.join('')).toBe(false);
    }
  });

  it('let go over the top half is no Bin; over the bottom half, the Bin whose column it is', () => {
    const area = { left: 0, top: 100, width: 300, height: 600 };
    expect(binAt({ x: 150, y: 399 }, area, 2)).toBeUndefined();
    expect(binAt({ x: 149, y: 400 }, area, 2)).toBe(0);
    expect(binAt({ x: 151, y: 690 }, area, 2)).toBe(1);
    expect(binAt({ x: 150, y: 500 }, area, 3)).toBe(1);
    expect(binAt({ x: -20, y: 500 }, area, 3)).toBe(0);
    expect(binAt({ x: 320, y: 800 }, area, 3)).toBe(2);
  });
});

/** A Game sorting letters into Bins by letter, recording what it was asked to do. */
function game(log: string[]): SortGame<string, string> {
  const button = (label: string) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', label);
    return b;
  };
  return {
    next: () => ({ bins: ['a', 'b'], pile: [...'abab'] }),
    binOf: (t) => t,
    bin: (k) => ({ el: button(k) }),
    thing: (t) => {
      const d = document.createElement('div');
      d.className = 'thing';
      d.dataset.t = t;
      return d;
    },
    piled: () => document.createElement('span'),
    land: (bin, t) => bin.el.append(Object.assign(document.createElement('i'), { textContent: t })),
    async opening(bins) {
      log.push(`open ${bins.length}`);
    },
    async landed(t, first) {
      log.push(`landed ${t}${first ? ' first' : ''}`);
    },
    missed: (t) => log.push(`missed ${t}`),
    helped: (t) => log.push(`helped ${t}`),
    tapped: (t) => void log.push(`tapped ${t}`),
    nudged: (t, n) => log.push(`nudged ${t} ${n}`),
    hush: () => {},
    async finish() {
      log.push('finish');
    },
    card: (round) => ({ art: document.createElement('b'), text: `Find ${round.bins.join(' and ')}` }),
  };
}

describe('the sorting screen', () => {
  let root: HTMLElement;
  let log: string[];
  let leave: () => void;
  const back = vi.fn();
  const press = (el: Element) => el.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }));
  const thing = () => root.querySelector<HTMLElement>('.site-sort-stage > .thing');
  const bin = (k: string) => root.querySelector<HTMLElement>(`.site-sort-bin[aria-label="${k}"]`)!;
  const other = (k: string) => (k === 'a' ? 'b' : 'a');

  beforeEach(() => {
    vi.useFakeTimers();
    root = document.createElement('div');
    log = [];
    const s = playStage(root, { back, tools: [], confetti: { colours: ['red'] } });
    leave = sortRounds(s, game(log));
  });
  afterEach(() => {
    leave();
    vi.useRealTimers();
  });

  it('opens the Round, then puts the first Thing on the Spot and the rest on the Pile', async () => {
    await vi.advanceTimersByTimeAsync(500);
    expect(log).toEqual(['open 2']);
    expect(thing()!.dataset.t).toBe('a');
    expect(root.querySelectorAll('.site-sort-pile > *')).toHaveLength(3);
  });

  it('lands a Thing in its own Bin, then serves the next', async () => {
    await vi.advanceTimersByTimeAsync(500);
    press(bin('a'));
    await vi.advanceTimersByTimeAsync(600);
    expect(log).toContain('landed a first');
    expect(bin('a').textContent).toBe('a');
    expect(thing()!.dataset.t).toBe('b');
  });

  it('sends a Miss back with its own Bin lit, and puts it in by itself after the second', async () => {
    await vi.advanceTimersByTimeAsync(500);
    press(bin('b'));
    await vi.advanceTimersByTimeAsync(500);
    expect(log.slice(1)).toEqual(['missed a', 'helped a']);
    expect(bin('a').classList.contains('site-sort-glow')).toBe(true);
    press(bin('b'));
    await vi.advanceTimersByTimeAsync(1000);
    expect(log.slice(3)).toEqual(['missed a', 'landed a first']);
    expect(bin('a').textContent).toBe('a');
    expect(bin('b').textContent).toBe('');
  });

  it('tells the Game only the first Thing into each Bin a Round is the first', async () => {
    await vi.advanceTimersByTimeAsync(500);
    for (let i = 0; i < 4; i++) {
      press(bin(thing()!.dataset.t!));
      await vi.advanceTimersByTimeAsync(600);
    }
    expect(log.filter((l) => l.startsWith('landed')).sort()).toEqual(['landed a', 'landed a first', 'landed b', 'landed b first']);
  });

  it('nudges after being still, three times at most', async () => {
    await vi.advanceTimersByTimeAsync(500 + 5 * IDLE_MS);
    expect(log.filter((l) => l.startsWith('nudged'))).toEqual(['nudged a 1', 'nudged a 2', 'nudged a 3']);
    expect(bin('a').classList.contains('site-sort-glow')).toBe(true);
  });

  it('ends an empty Pile with the Game’s finish, the card and Next to a new Round', async () => {
    await vi.advanceTimersByTimeAsync(500);
    for (let i = 0; i < 4; i++) {
      press(bin(thing()!.dataset.t!));
      await vi.advanceTimersByTimeAsync(600);
    }
    expect(log).toContain('finish');
    expect(root.querySelector('.site-sort-look-for')!.textContent).toBe('🔍 Find a and b');
    root.querySelector<HTMLButtonElement>('.site-sort-cheer .site-next')!.click();
    await vi.advanceTimersByTimeAsync(500);
    expect(root.querySelector('.site-sort-cheer')).toBeNull();
    expect(log.filter((l) => l === 'open 2')).toHaveLength(2);
    expect(bin('a').textContent).toBe('');
  });

  it('ignores a Bin while a Thing is on its way, and goes Back', async () => {
    await vi.advanceTimersByTimeAsync(500);
    const first = thing()!.dataset.t!;
    press(bin(other(first)));
    press(bin(first));
    await vi.advanceTimersByTimeAsync(500);
    expect(log.filter((l) => l.startsWith('landed'))).toEqual([]);
    root.querySelector<HTMLButtonElement>('[aria-label="Back"]')!.click();
    expect(back).toHaveBeenCalled();
  });
});
