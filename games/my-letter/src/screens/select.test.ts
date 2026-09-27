// @vitest-environment happy-dom
import { gameStorage, memoryStorage } from '@shared/storage';
import { describe, expect, it, vi } from 'vitest';
import type { App } from '../app';
import { MY_NAME, NEW_LETTERS, NEW_LETTER_ORDER } from '../letters';
import { loadProgress } from '../progress';
import { GROUP_COLOURS, groupBadge, myLetterSelect } from './select';

/** An App on a save as the Game wrote it, under its real key. */
function app(save: object): App {
  return {
    root: undefined as never,
    progress: loadProgress(gameStorage('my-letter', memoryStorage({ 'my-letter:v1': JSON.stringify(save) }))),
    groups: vi.fn(),
    play: vi.fn(),
    board: vi.fn(),
    corner: { gear: vi.fn(() => document.createElement('button')), open: vi.fn() },
  };
}

describe("My Letter's level select", () => {
  it('shows My name with one card, the Name, then New letters, each in its own colour', () => {
    const groups = myLetterSelect(app({ format: 1, game: { name: 'Anna' } })).groups();
    expect(groups.map((g) => g.name)).toEqual(['My name', 'New letters']);
    expect(groups.map((g) => g.labels)).toEqual([['ANNA'], NEW_LETTER_ORDER]);
    expect(groups.map((g) => g.levels.length)).toEqual([1, 8]);
    expect(groups.map((g) => g.colour)).toEqual([...GROUP_COLOURS]);
  });

  it('gives My name no Levels without a Name, so it is left out and New letters stays Group 1', () => {
    const groups = myLetterSelect(app({})).groups();
    expect(groups[MY_NAME]!.levels).toEqual([]);
    expect(groups[NEW_LETTERS]!.levels).toHaveLength(8);
  });

  it('passes Every level open through, and plays the Level tapped', () => {
    const a = app({ format: 1, settings: { everyLevelOpen: true } });
    expect(myLetterSelect(a).everyLevelOpen!()).toBe(true);
    myLetterSelect(a).play(NEW_LETTERS, 2);
    expect(a.play).toHaveBeenCalledWith(NEW_LETTERS, 2);
  });

  it('draws the Name’s first letter on My name’s badge, and a B on New letters’', () => {
    expect(groupBadge(MY_NAME, 'Zoë')).toMatch(/>Z<\/text>/);
    expect(groupBadge(NEW_LETTERS, 'Zoë')).toMatch(/>B<\/text>/);
  });

  it('has a Letter board button beside the gear on the Group list only, which opens the board', () => {
    const a = app({});
    const tools = myLetterSelect(a).tools!();
    expect(tools).toHaveLength(2);
    const board = tools[0]!;
    expect(board.getAttribute('aria-label')).toBe('Letter board');
    expect(board.className).toBe('site-tool');
    board.click();
    expect(a.board).toHaveBeenCalledOnce();
    expect(myLetterSelect(a).tools!(NEW_LETTERS)).toHaveLength(1);
  });
});
