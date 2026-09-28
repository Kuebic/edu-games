import { gameStorage, memoryStorage } from '@shared/storage';
import { describe, expect, it } from 'vitest';
import { loadProgress } from './progress';

const open = (saved?: object) =>
  loadProgress(gameStorage('piggy-bank', memoryStorage(saved ? { 'piggy-bank:v1': JSON.stringify(saved) } : {})));

describe("Piggy Bank's Saved progress", () => {
  it('starts on Sort, with the penny and the quarter', () => {
    expect(open().game).toEqual({ money: ['penny', 'quarter'], way: 'sort' });
  });

  it('keeps the Scope and the Way', () => {
    const storage = gameStorage('piggy-bank', memoryStorage());
    const p = loadProgress(storage);
    p.game.money = ['dime', 'dollar'];
    p.game.way = 'find';
    p.save();
    expect(loadProgress(storage).game).toEqual({ money: ['dime', 'dollar'], way: 'find' });
  });

  it('reads a damaged slot as a new save, and keeps only real money, in order', () => {
    expect(open({ format: 1, game: 'junk' }).game).toEqual({ money: ['penny', 'quarter'], way: 'sort' });
    expect(open({ format: 1, game: { money: ['dollar', 'euro', 'penny'], way: 'shop' } }).game).toEqual({ money: ['penny', 'dollar'], way: 'sort' });
  });
});
