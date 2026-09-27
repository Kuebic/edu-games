// @vitest-environment happy-dom
// Practice as a grown-up and a screen reader meet it: found by role and aria-label, tapped with click().
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { showPractice, toggleRange, type PracticeGame, type PracticeTopic } from './practice';

const LETTERS = [...'ABCDEFGHIJ'];
const topics: PracticeTopic[] = [
  {
    name: 'Numbers',
    colour: '#ff8a3d',
    badge: () => '<svg></svg>',
    items: ['0', '1', '2', '3'],
    ranges: [{ label: '0–3', items: ['0', '1', '2', '3'] }],
    ways: [{ id: 'a', label: 'Beans to numbers', text: '🫘 → 3' }],
  },
  {
    name: 'Letters',
    colour: '#7a6cf0',
    badge: () => document.createElement('b'),
    items: LETTERS,
    ranges: [
      { label: 'A–E', items: [...'ABCDE'] },
      { label: 'F–J', items: [...'FGHIJ'] },
    ],
    ways: [
      { id: 'find-symbol', label: 'Pictures to letters', text: '🍎 → A' },
      { id: 'mix', label: 'Mix', text: 'Mix' },
    ],
  },
];

/** A Game that keeps its picks in memory, as a Game's Saved progress would. */
function testGame(extra: Partial<PracticeGame> = {}) {
  const state = { topic: 1, scopes: [['0'], ['A', 'B']] as string[][], ways: ['a', 'mix'] };
  const play = vi.fn();
  const game: PracticeGame = {
    title: 'Test',
    topics,
    topic: () => state.topic,
    chooseTopic: (t) => (state.topic = t),
    scope: (t) => state.scopes[t]!,
    setScope: (t, items) => (state.scopes[t] = [...items]),
    way: (t) => state.ways[t]!,
    chooseWay: (t, way) => (state.ways[t] = way),
    play,
    ...extra,
  };
  return { game, state, play };
}

let root: HTMLElement;
beforeEach(() => {
  document.body.innerHTML = '<div id="app"></div>';
  root = document.querySelector('#app')!;
});

const byLabel = (label: string) => root.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)!;
const labels = (selector: string) => [...root.querySelectorAll(selector)].map((e) => e.getAttribute('aria-label'));
const on = (selector: string) =>
  [...root.querySelectorAll(selector)].filter((e) => e.getAttribute('aria-pressed') === 'true' || e.getAttribute('aria-checked') === 'true').map((e) => e.getAttribute('aria-label'));

describe('Practice', () => {
  it('has the House button, the heading and the Game’s tools', () => {
    const tool = document.createElement('button');
    tool.setAttribute('aria-label', 'Grown-ups');
    showPractice(root, testGame({ tools: () => [tool] }).game);
    expect(root.querySelector('h1')!.textContent).toBe('Test');
    expect(labels('header > *')).toEqual(['All games', null, 'Grown-ups']);
  });

  it('shows the Topic that’s up, with its Way, Ranges and Scope marked', () => {
    showPractice(root, testGame().game);
    expect(on('.site-topic')).toEqual(['Letters']);
    expect(labels('.site-way')).toEqual(['Pictures to letters', 'Mix']);
    expect(on('.site-way')).toEqual(['Mix']);
    expect(labels('.site-item')).toEqual(LETTERS);
    expect(on('.site-item')).toEqual(['A', 'B']);
    expect(on('.site-range')).toEqual([]);
  });

  it('switches Topic in one tap', () => {
    const { game, state } = testGame();
    showPractice(root, game);
    byLabel('Numbers').click();
    expect(state.topic).toBe(0);
    expect(labels('.site-item')).toEqual(['0', '1', '2', '3']);
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Numbers');
  });

  it('has no tabs with one Topic', () => {
    showPractice(root, testGame({ topics: [topics[0]!], topic: () => 0 }).game);
    expect(root.querySelector('.site-topics')).toBeNull();
  });

  it('picks a Way in one tap', () => {
    const { game, state } = testGame();
    showPractice(root, game);
    byLabel('Pictures to letters').click();
    expect(state.ways[1]).toBe('find-symbol');
    expect(on('.site-way')).toEqual(['Pictures to letters']);
  });

  it('turns one item on or off, keeping the Scope in order', () => {
    const { game, state } = testGame();
    showPractice(root, game);
    byLabel('J').click();
    byLabel('C').click();
    expect(state.scopes[1]).toEqual(['A', 'B', 'C', 'J']);
    byLabel('A').click();
    expect(state.scopes[1]).toEqual(['B', 'C', 'J']);
    expect(document.activeElement?.getAttribute('aria-label')).toBe('A');
  });

  it('turns a whole Range on, then off, and mixes Ranges', () => {
    const { game, state } = testGame();
    showPractice(root, game);
    byLabel('F–J').click();
    expect(state.scopes[1]).toEqual(['A', 'B', 'F', 'G', 'H', 'I', 'J']);
    expect(on('.site-range')).toEqual(['F–J']);
    byLabel('A–E').click();
    expect(state.scopes[1]).toEqual(LETTERS);
    byLabel('A–E').click();
    expect(state.scopes[1]).toEqual([...'FGHIJ']);
  });

  it('plays the Topic that’s up, and waits while the Scope is empty', () => {
    const { game, play } = testGame();
    showPractice(root, game);
    byLabel('A').click();
    byLabel('B').click();
    expect(byLabel('Play').disabled).toBe(true);
    byLabel('C').click();
    byLabel('Play').click();
    expect(play).toHaveBeenCalledWith(1);
  });

  it('draws nothing more once it has left', () => {
    const { game } = testGame();
    const view = showPractice(root, game);
    view.leave();
    root.replaceChildren();
    view.redraw();
    expect(root.children).toHaveLength(0);
  });
});

describe('a Range', () => {
  it('turns its items on unless they are all on, and leaves the rest alone', () => {
    expect(toggleRange(LETTERS, ['A', 'J'], [...'ABC'])).toEqual(['A', 'B', 'C', 'J']);
    expect(toggleRange(LETTERS, ['A', 'B', 'C', 'J'], [...'ABC'])).toEqual(['J']);
  });
});
