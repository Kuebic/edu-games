// @vitest-environment happy-dom
// The sorting screen with a made-up Game: Bins pressed from a keyboard (click with detail 0), since dragging
// needs a real layout; where a finger lets go is tested as data.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { askRounds, binAt, binsFrom, IDLE_MS, pileOf, playStage, sortRounds, type AskGame, type SortGame } from './sort';

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

  it('keep look-alikes apart when the Scope leaves another way, and still take each item in turn', () => {
    const apart = (a: string, b: string) => 'bd'.includes(a) && 'bd'.includes(b);
    const next = binsFrom([...'bdxy'], seeded(5), 3, apart);
    const seen = Array.from({ length: 40 }, next);
    for (const bins of seen) expect(bins.includes('b') && bins.includes('d'), bins.join('')).toBe(false);
    const all = seen.flat();
    // x and y are in every Round; b and d take turns in the third Bin.
    for (const k of 'bd') expect(all.filter((x) => x === k).length, k).toBeGreaterThanOrEqual(15);
    expect(binsFrom([...'bd'], seeded(1), 3, apart)().sort()).toEqual(['b', 'd']);
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
    async landed(t, first, pressed) {
      log.push(`landed ${t}${first ? ' first' : ''}${pressed ? ' pressed' : ''}`);
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
    expect(log).toContain('landed a first pressed');
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
    // Put in by itself: not a tap, so a Game that says what's tapped stays quiet.
    expect(log.slice(3)).toEqual(['missed a', 'landed a first']);
    expect(bin('a').textContent).toBe('a');
    expect(bin('b').textContent).toBe('');
  });

  it('tells the Game only the first Thing into each Bin a Round is the first, and which Bins were tapped', async () => {
    await vi.advanceTimersByTimeAsync(500);
    for (let i = 0; i < 4; i++) {
      press(bin(thing()!.dataset.t!));
      await vi.advanceTimersByTimeAsync(600);
    }
    expect(log.filter((l) => l.startsWith('landed')).sort()).toEqual([
      'landed a first pressed', 'landed a pressed', 'landed b first pressed', 'landed b pressed',
    ]);
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

/** A Game asking for letters from the table, recording what it was asked to do. */
function asking(log: string[]): AskGame<string> {
  const asker = document.createElement('button');
  asker.setAttribute('aria-label', 'asker');
  return {
    next: () => ({ kinds: ['a', 'b'], asks: [...'abab'] }),
    asker: { el: asker },
    thing(kind) {
      const b = document.createElement('button');
      b.dataset.t = kind;
      return b;
    },
    ask: (kind) => log.push(`ask ${kind}`),
    landed: (kind) => log.push(`landed ${kind}`),
    missed: (kind) => log.push(`missed ${kind}`),
    nudged: (kind, n) => log.push(`nudged ${kind} ${n}`),
    hush: () => {},
    async finish() {
      log.push('finish');
    },
    card: () => ({ art: document.createElement('b'), text: 'Find a with a grown-up!' }),
  };
}

describe('the asking screen', () => {
  let root: HTMLElement;
  let log: string[];
  let leave: () => void;
  const press = (el: Element) => el.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }));
  const thing = (k: string) => root.querySelector<HTMLElement>(`.site-sort-thing[data-t="${k}"]`)!;
  const asked = () => log.filter((l) => l.startsWith('ask')).at(-1)!.slice(4);

  beforeEach(() => {
    vi.useFakeTimers();
    root = document.createElement('div');
    log = [];
    const s = playStage(root, { back: () => {}, tools: [], confetti: { colours: ['red'] } });
    leave = askRounds(s, asking(log));
  });
  afterEach(() => {
    leave();
    vi.useRealTimers();
  });

  it('lays one of each kind on the table and asks for the first', async () => {
    await vi.advanceTimersByTimeAsync(500);
    expect(root.querySelectorAll('.site-sort-thing')).toHaveLength(2);
    expect(root.querySelector('.site-sort-asker')).not.toBeNull();
    expect(log).toEqual(['ask a']);
  });

  it('takes the Thing asked for, then asks for the next', async () => {
    await vi.advanceTimersByTimeAsync(500);
    press(thing('a'));
    await vi.advanceTimersByTimeAsync(1600);
    expect(log).toEqual(['ask a', 'landed a', 'ask b']);
  });

  it('asks again after a Miss, and after the second lights the right one and puts it in', async () => {
    await vi.advanceTimersByTimeAsync(500);
    press(thing('b'));
    await vi.advanceTimersByTimeAsync(500);
    expect(log).toEqual(['ask a', 'missed b', 'ask a']);
    press(thing('b'));
    await vi.advanceTimersByTimeAsync(500);
    expect(thing('a').classList.contains('site-sort-glow')).toBe(true);
    await vi.advanceTimersByTimeAsync(1000);
    expect(log.slice(3)).toEqual(['missed b', 'landed a']);
  });

  it('nudges, asks again from the second, and lights the Thing from the third', async () => {
    await vi.advanceTimersByTimeAsync(500);
    await vi.advanceTimersByTimeAsync(IDLE_MS * 4 + 100);
    expect(log).toEqual(['ask a', 'nudged a 1', 'nudged a 2', 'ask a', 'nudged a 3', 'ask a']);
    expect(thing('a').classList.contains('site-sort-glow')).toBe(true);
  });

  it('ends after the last Ask with the Game’s finish, the card and Next', async () => {
    await vi.advanceTimersByTimeAsync(500);
    for (let i = 0; i < 4; i++) {
      press(thing(asked()));
      await vi.advanceTimersByTimeAsync(1600);
    }
    expect(log.at(-1)).toBe('finish');
    expect(root.querySelector('.site-sort-cheer')?.textContent).toMatch(/grown-up/);
  });
});
