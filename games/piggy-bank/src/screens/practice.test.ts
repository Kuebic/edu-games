import { gameStorage, memoryStorage } from '@shared/storage';
import { describe, expect, it, vi } from 'vitest';
import type { App } from '../app';
import { loadProgress } from '../progress';
import { piggyBankPractice } from './practice';

function app(save: object = {}): App {
  const storage = gameStorage('piggy-bank', memoryStorage({ 'piggy-bank:v1': JSON.stringify(save) }));
  return {
    root: undefined as never,
    progress: loadProgress(storage),
    start: vi.fn(),
    play: vi.fn(),
    corner: { gear: vi.fn(), open: vi.fn() },
  };
}

describe("Piggy Bank's Practice", () => {
  it('has one Topic: the money in order, the first pair, three, All, two Ways, and needs two', () => {
    const { topics } = piggyBankPractice(app());
    expect(topics).toHaveLength(1);
    const [money] = topics;
    expect(money!.items).toEqual(['1¢', '5¢', '10¢', '25¢', '$1']);
    expect(money!.ranges.map((r) => r.label)).toEqual(['1¢ 25¢', '1¢ 10¢ 25¢', 'All']);
    expect(money!.ways.map((w) => w.id)).toEqual(['sort', 'find']);
    expect(money!.fewest).toBe(2);
  });

  it('shows the saved picks and saves new ones', () => {
    const a = app();
    const practice = piggyBankPractice(a);
    expect(practice.scope(0)).toEqual(['1¢', '25¢']);
    expect(practice.way(0)).toBe('sort');
    practice.setScope(0, ['10¢', '$1']);
    practice.chooseWay(0, 'find');
    expect(a.progress.game).toEqual({ money: ['dime', 'dollar'], way: 'find' });
  });

  it('plays with the saved picks', () => {
    const a = app();
    piggyBankPractice(a).play(0);
    expect(a.play).toHaveBeenCalled();
  });
});
