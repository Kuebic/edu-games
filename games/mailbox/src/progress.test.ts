import { gameStorage, memoryStorage } from '@shared/storage';
import { describe, expect, it } from 'vitest';
import { loadProgress } from './progress';

const open = (saved?: object) => loadProgress(gameStorage('mailbox', memoryStorage(saved ? { 'mailbox:v1': JSON.stringify(saved) } : {})));

describe("Mailbox's Saved progress", () => {
  it('starts on Sort, with O and S, and every Hint showing', () => {
    expect(open().game).toEqual({ letters: ['o', 's'], way: 'sort', learnt: {} });
  });

  it('keeps the Scope, the Way and the Hints', () => {
    const storage = gameStorage('mailbox', memoryStorage());
    const p = loadProgress(storage);
    p.game.letters = ['a', 'b'];
    p.game.way = 'find';
    p.game.learnt = { a: 2, b: 1 };
    p.save();
    expect(loadProgress(storage).game).toEqual({ letters: ['a', 'b'], way: 'find', learnt: { a: 2, b: 1 } });
  });

  it('reads a damaged slot as a new save, and keeps only real letters, in order', () => {
    expect(open({ format: 1, game: 'junk' }).game).toEqual({ letters: ['o', 's'], way: 'sort', learnt: {} });
    expect(open({ format: 1, game: { letters: ['z', 'A', 'ab', 'c'], way: 'post', learnt: { a: 9, B: 1, c: -1, d: 'x' } } }).game).toEqual({
      letters: ['c', 'z'],
      way: 'sort',
      learnt: { a: 2 },
    });
  });
});
