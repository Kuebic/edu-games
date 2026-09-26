// @vitest-environment happy-dom
// The level select as a child and a screen reader meet it: found by role and aria-label, tapped with click().
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { showLevelSelect, type GroupView, type LevelMark, type LevelSelectGame } from './level-select';

/** Levels from a picture: x done, * done with a Sparkle, . not done. */
const marks = (row: string): LevelMark[] => [...row].map((c) => ({ done: c !== '.', sparkle: c === '*' }));

function testGame(extra: Partial<LevelSelectGame> = {}) {
  const groups: GroupView[] = [
    { name: 'Easy', colour: '#2fa36b', badge: () => '<svg></svg>', levels: marks('*x..') },
    { name: 'Hard', colour: '#2f9be0', badge: () => document.createElement('b'), levels: marks('........'), bonusSparkles: 0 },
  ];
  const play = vi.fn();
  const game: LevelSelectGame = { title: 'Test', groups: () => groups, play, ...extra };
  return { game, groups, play };
}

let root: HTMLElement;
beforeEach(() => {
  document.body.innerHTML = '<div id="app"></div>';
  root = document.querySelector('#app')!;
});

const byLabel = (label: string) => root.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`);
const labels = (selector: string) => [...root.querySelectorAll(selector)].map((e) => e.getAttribute('aria-label'));
const key = (name: string) => window.dispatchEvent(new KeyboardEvent('keydown', { key: name }));

describe('the Group list', () => {
  it('shows every Group as an open card with how much is done, and the House button', () => {
    const { game } = testGame();
    showLevelSelect(root, game);
    expect(root.querySelector('h1')!.textContent).toBe('Test');
    expect(labels('main > *:not(header) button')).toEqual(['Easy: 2 of 4 done', 'Hard: 0 of 8 done']);
    expect(byLabel('Hard: 0 of 8 done')!.disabled).toBe(false);
    expect(byLabel('All games')).not.toBeNull();
  });

  it('counts Sparkles with the bonus ones, and shows none at 0', () => {
    const { game, groups } = testGame();
    groups[0]!.bonusSparkles = 2;
    showLevelSelect(root, game);
    const counts = [...root.querySelectorAll('.site-group')].map((c) => c.querySelector('.site-sparkles')!.textContent);
    expect(counts).toEqual(['3', '']);
  });

  it('shows the tools, or a space where they would be', () => {
    const { game } = testGame();
    showLevelSelect(root, game);
    expect(root.querySelectorAll('header > *')).toHaveLength(3);
    expect(root.querySelector('header > .site-tool-space')).not.toBeNull();

    const tool = document.createElement('button');
    tool.setAttribute('aria-label', 'Sound');
    showLevelSelect(root, { ...game, tools: () => [tool] });
    expect(labels('header > *')).toEqual(['All games', null, 'Sound']);
  });

  it('shows Skin chips as a radio group, and redraws after one is chosen', () => {
    let current = 'sun';
    const choose = vi.fn((id: string) => (current = id));
    const chips = [
      { id: 'sun', label: 'Sun', picture: '<svg></svg>', colour: '#ff0' },
      { id: 'moon', label: 'Moon', picture: '<svg></svg>', colour: '#00f' },
    ];
    const { game } = testGame({ skins: { chips, current: () => current, choose } });
    showLevelSelect(root, game);
    expect(root.querySelector('[role="radiogroup"]')).not.toBeNull();
    const checked = () => [...root.querySelectorAll('[role="radio"]')].map((c) => c.getAttribute('aria-checked'));
    expect(checked()).toEqual(['true', 'false']);
    byLabel('Moon')!.click();
    expect(choose).toHaveBeenCalledWith('moon');
    expect(checked()).toEqual(['false', 'true']);
    // Focus stays on the chip chosen, not on a Group card.
    expect(document.activeElement).toBe(byLabel('Moon'));
  });

  it('draws no chips in a Game without Skins', () => {
    showLevelSelect(root, testGame().game);
    expect(root.querySelector('[role="radiogroup"]')).toBeNull();
  });

  it('puts the Game’s node under the list', () => {
    const book = document.createElement('button');
    book.setAttribute('aria-label', 'Sticker book');
    showLevelSelect(root, testGame({ underList: () => book }).game);
    expect(root.querySelector('main')!.lastElementChild).toBe(book);
  });

  it('throws on a Game with no Groups, or none with Levels', () => {
    expect(() => showLevelSelect(root, { title: 'Empty', groups: () => [], play() {} })).toThrow(/no Groups/);
    const { game, groups } = testGame();
    groups[0]!.levels = [];
    groups[1]!.levels = [];
    expect(() => showLevelSelect(root, game)).toThrow(/no Groups/);
  });

  it('leaves out a Group with no Levels, and the others keep their numbers', () => {
    const { game, groups, play } = testGame();
    groups[0]!.levels = [];
    showLevelSelect(root, game);
    expect(labels('.site-group')).toEqual(['Hard: 0 of 8 done']);
    byLabel('Hard: 0 of 8 done')!.click();
    byLabel('Level 1')!.click();
    expect(play).toHaveBeenCalledWith(1, 0);
    // Opened straight away, the empty one lands on the list; back from Hard, focus is on Hard's card.
    showLevelSelect(root, game, 0);
    expect(byLabel('All games')).not.toBeNull();
    showLevelSelect(root, game, 1);
    byLabel('Back')!.click();
    expect(document.activeElement).toBe(byLabel('Hard: 0 of 8 done'));
  });

  it('starts the arrow keys from the Group last opened when no card has focus, else the first', () => {
    const { game } = testGame();
    showLevelSelect(root, game, 1);
    key('Escape');
    expect(document.activeElement).toBe(byLabel('Hard: 0 of 8 done'));
    (document.activeElement as HTMLElement).blur();
    key('ArrowDown');
    expect(document.activeElement).toBe(byLabel('Hard: 0 of 8 done'));
    // One Group now, so the one last opened isn't shown.
    showLevelSelect(root, { ...game, groups: () => game.groups().slice(0, 1) });
    expect(document.activeElement).toBe(document.body);
    key('ArrowRight');
    expect(document.activeElement).toBe(byLabel('Easy: 2 of 4 done'));
  });

  it('asks for the tools with the Group whose screen is up', () => {
    const tools = vi.fn(() => []);
    showLevelSelect(root, testGame({ tools }).game);
    expect(tools).toHaveBeenLastCalledWith(undefined);
    byLabel('Hard: 0 of 8 done')!.click();
    expect(tools).toHaveBeenLastCalledWith(1);
  });
});

describe('a Group screen', () => {
  it('opens from its card, with back instead of the House button', () => {
    showLevelSelect(root, testGame().game);
    byLabel('Hard: 0 of 8 done')!.click();
    expect(root.querySelector('[role="img"]')!.getAttribute('aria-label')).toBe('Hard');
    expect(byLabel('All games')).toBeNull();
    byLabel('Back')!.click();
    expect(byLabel('All games')).not.toBeNull();
  });

  it('opens straight away with a Group number, and lands on the list with one not shown', () => {
    const { game } = testGame();
    showLevelSelect(root, game, 1);
    expect(byLabel('Hard')).not.toBeNull();
    showLevelSelect(root, game, 2);
    expect(byLabel('All games')).not.toBeNull();
  });

  it('marks done Levels and Sparkles, opens the next, and locks the rest', () => {
    showLevelSelect(root, testGame().game, 0);
    expect(labels('.site-level')).toEqual(['Level 1, done, sparkle', 'Level 2, done', 'Level 3', 'Level 4, locked']);
    expect([...root.querySelectorAll<HTMLButtonElement>('.site-level')].map((b) => b.disabled)).toEqual([false, false, false, true]);
    expect(byLabel('Level 3')!.textContent).toBe('3');
  });

  it('shows a Group’s own card labels in place of numbers', () => {
    const { game, groups } = testGame();
    groups[0]!.labels = ['S', 'A', 'M', 'Y'];
    showLevelSelect(root, game, 0);
    expect(labels('.site-level')).toEqual(['Level S, done, sparkle', 'Level A, done', 'Level M', 'Level Y, locked']);
    expect(byLabel('Level M')!.textContent).toBe('M');
  });

  it('names the Levels with the Game’s own word', () => {
    showLevelSelect(root, testGame({ levelWord: 'Round' }).game, 0);
    expect(labels('.site-level')).toEqual(['Round 1, done, sparkle', 'Round 2, done', 'Round 3', 'Round 4, locked']);
  });

  it('opens every Level under "Every level open"', () => {
    showLevelSelect(root, testGame({ everyLevelOpen: () => true }).game, 1);
    expect(labels('.site-level').filter((l) => l!.includes('locked'))).toEqual([]);
  });

  it('plays a tapped Level after leaving, and not a locked one', () => {
    const { game, play } = testGame();
    showLevelSelect(root, game, 0);
    byLabel('Level 4, locked')!.click();
    expect(play).not.toHaveBeenCalled();
    play.mockImplementation(() => {
      // The level select has already let go of the keys.
      key('Escape');
      expect(byLabel('Level 3')).not.toBeNull();
    });
    byLabel('Level 3')!.click();
    expect(play).toHaveBeenCalledWith(0, 2);
  });

  it('goes back to the list on Esc', () => {
    showLevelSelect(root, testGame().game, 0);
    key('Escape');
    expect(byLabel('All games')).not.toBeNull();
  });

  it('leaves the keys to a Grown-up Corner over it, wherever the focus is', () => {
    showLevelSelect(root, testGame().game, 0);
    const corner = document.createElement('section');
    corner.setAttribute('role', 'dialog');
    corner.innerHTML = '<button>Sound</button>';
    root.querySelector('main')!.append(corner);
    corner.querySelector('button')!.focus();
    key('Escape');
    (document.activeElement as HTMLElement).blur();
    key('Escape');
    key('ArrowLeft');
    expect(byLabel('Back')).not.toBeNull();
    expect(corner.isConnected).toBe(true);
    corner.remove();
    key('Escape');
    expect(byLabel('All games')).not.toBeNull();
  });

  it('plays nothing while a Grown-up Corner is over it, though the Corner’s own buttons work', () => {
    const { game, play } = testGame();
    showLevelSelect(root, game, 0);
    const corner = document.createElement('section');
    corner.setAttribute('role', 'dialog');
    corner.innerHTML = '<button>Close</button>';
    const close = vi.fn();
    corner.querySelector('button')!.addEventListener('click', close);
    root.querySelector('main')!.append(corner);
    // Enter or Space on the card that had focus.
    byLabel('Level 3')!.click();
    byLabel('Back')!.click();
    expect(play).not.toHaveBeenCalled();
    expect(byLabel('Back')).not.toBeNull();
    corner.querySelector('button')!.click();
    expect(close).toHaveBeenCalled();
    corner.remove();
    byLabel('Level 3')!.click();
    expect(play).toHaveBeenCalledWith(0, 2);
  });

  it('walks the Levels with the arrow keys, from the one to play next', () => {
    showLevelSelect(root, testGame().game, 0);
    expect(document.activeElement).toBe(byLabel('Level 3'));
    key('ArrowLeft');
    expect(document.activeElement).toBe(byLabel('Level 2, done'));
    key('ArrowRight');
    key('ArrowRight');
    // Level 4 is locked, so focus stays.
    expect(document.activeElement).toBe(byLabel('Level 3'));
  });

  it('starts the arrow keys from the Level to play next when no card has focus, else the first', () => {
    const { game, groups } = testGame();
    showLevelSelect(root, game, 0);
    (document.activeElement as HTMLElement).blur();
    key('ArrowRight');
    expect(document.activeElement).toBe(byLabel('Level 3'));
    byLabel('Back')!.focus();
    key('ArrowDown');
    expect(document.activeElement).toBe(byLabel('Level 3'));
    // Every Level done: nothing to play next, so nothing has focus until an arrow.
    groups[0]!.levels = marks('xxxx');
    showLevelSelect(root, game, 0);
    expect(document.activeElement).toBe(document.body);
    key('ArrowLeft');
    expect(document.activeElement).toBe(byLabel('Level 1, done'));
  });

  it('puts the Game’s node under the Levels', () => {
    const underGroup = vi.fn((g: number) => {
      const more = document.createElement('button');
      more.setAttribute('aria-label', `More like ${g}`);
      return more;
    });
    showLevelSelect(root, testGame({ underGroup }).game, 1);
    expect(underGroup).toHaveBeenCalledWith(1);
    expect(root.querySelector('main')!.lastElementChild!.getAttribute('aria-label')).toBe('More like 1');
  });

  it('reads the marks again on redraw, and stops listening on leave', () => {
    const { game, groups } = testGame();
    const view = showLevelSelect(root, game, 0);
    groups[0]!.levels = marks('*xx.');
    view.redraw();
    expect(labels('.site-level').at(-1)).toBe('Level 4');
    view.leave();
    view.leave();
    key('Escape');
    expect(byLabel('Back')).not.toBeNull();
  });
});
