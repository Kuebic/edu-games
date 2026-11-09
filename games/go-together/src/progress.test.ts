import { gameStorage, memoryStorage } from '@shared/storage';
import { describe, expect, it } from 'vitest';
import { loadProgress } from './progress';

const open = (saved?: object) => loadProgress(gameStorage('go-together', memoryStorage(saved ? { 'go-together:v1': JSON.stringify(saved) } : {})));
const NEW = { topic: 'kinds', same: ['animals', 'vehicles'], colors: ['red', 'blue'], kinds: ['animals', 'vehicles', 'food', 'clothes'], board: 6 };

describe("Go Together's Saved progress", () => {
  it('starts on Kinds, the Easy groups, a Board of 6', () => {
    expect(open().game).toEqual(NEW);
  });

  it('keeps the Topic, each Scope and the Board', () => {
    const storage = gameStorage('go-together', memoryStorage());
    const p = loadProgress(storage);
    p.game.topic = 'same';
    p.game.same = ['toys'];
    p.game.colors = ['pink'];
    p.game.kinds = ['birds', 'fish'];
    p.game.board = 16;
    p.save();
    expect(loadProgress(storage).game).toEqual({ topic: 'same', same: ['toys'], colors: ['pink'], kinds: ['birds', 'fish'], board: 16 });
  });

  it('reads a damaged slot as a new save, and keeps only real items, in order', () => {
    expect(open({ format: 1, game: 'junk' }).game).toEqual(NEW);
    expect(open({ format: 1, game: { topic: 'shapes', same: ['plants', 'cars', 'animals'], colors: 'red', kinds: ['mammals', 'fish'], board: 5 } }).game).toEqual({
      topic: 'kinds',
      same: ['animals', 'plants'],
      colors: ['red', 'blue'],
      kinds: ['fish'],
      board: 6,
    });
  });
});
