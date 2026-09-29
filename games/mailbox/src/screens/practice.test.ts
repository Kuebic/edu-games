import { gameStorage, memoryStorage } from '@shared/storage';
import { describe, expect, it, vi } from 'vitest';
import type { App } from '../app';
import { loadProgress } from '../progress';
import { mailboxPractice } from './practice';

function app(save: object = {}): App {
  const storage = gameStorage('mailbox', memoryStorage({ 'mailbox:v1': JSON.stringify(save) }));
  return {
    root: undefined as never,
    progress: loadProgress(storage),
    start: vi.fn(),
    play: vi.fn(),
    corner: { gear: vi.fn(), open: vi.fn() },
  };
}

describe("Mailbox's Practice", () => {
  it('has one Topic: Aa to Zz, four Ranges and All, two Ways, and needs two', () => {
    const { topics } = mailboxPractice(app());
    expect(topics).toHaveLength(1);
    const [letters] = topics;
    expect(letters!.items).toHaveLength(26);
    expect(letters!.items.slice(0, 3)).toEqual(['Aa', 'Bb', 'Cc']);
    expect(letters!.ranges.map((r) => r.label)).toEqual(['Same', 'Close', 'Unlike', 'Tricky', 'All']);
    expect(letters!.ranges[0]!.items).toEqual(['Cc', 'Oo', 'Ss', 'Vv', 'Ww', 'Xx', 'Zz']);
    expect(letters!.ways.map((w) => w.id)).toEqual(['sort', 'find']);
    expect(letters!.fewest).toBe(2);
  });

  it('shows the saved picks and saves new ones', () => {
    const a = app();
    const practice = mailboxPractice(a);
    expect(practice.scope(0)).toEqual(['Oo', 'Ss']);
    expect(practice.way(0)).toBe('sort');
    practice.setScope(0, ['Aa', 'Mm']);
    practice.chooseWay(0, 'find');
    expect(a.progress.game.letters).toEqual(['a', 'm']);
    expect(a.progress.game.way).toBe('find');
  });

  it('plays with the saved picks', () => {
    const a = app();
    mailboxPractice(a).play(0);
    expect(a.play).toHaveBeenCalled();
  });
});
