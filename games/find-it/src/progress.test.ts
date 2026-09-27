import { gameStorage, memoryStorage } from '@shared/storage';
import { describe, expect, it } from 'vitest';
import { loadProgress } from './progress';

/** A device holding this raw save under its real key, or nothing. */
const device = (initial?: string) => gameStorage('find-it', memoryStorage(initial === undefined ? {} : { 'find-it:v1': initial }));

describe('the picks', () => {
  it('start on Numbers, 0 to 10 and A to E, both on Mix', () => {
    expect(loadProgress(device()).game).toEqual({
      topic: 'number',
      scopes: { number: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], letter: ['A', 'B', 'C', 'D', 'E'] },
      ways: { number: 'mix', letter: 'mix' },
    });
  });

  it('round-trip through the device', () => {
    const storage = device();
    const first = loadProgress(storage);
    first.game.topic = 'letter';
    first.game.scopes.letter = ['A', 'M', 'Z'];
    first.game.scopes.number = [];
    first.game.ways.letter = 'find-picture';
    first.save();
    const again = loadProgress(storage).game;
    expect(again.topic).toBe('letter');
    expect(again.scopes).toEqual({ number: [], letter: ['A', 'M', 'Z'] });
    expect(again.ways).toEqual({ number: 'mix', letter: 'find-picture' });
  });

  it('keep only a Scope’s own items, in order, and fall back for anything else saved', () => {
    const saved = { format: 1, game: { topic: 'shapes', scopes: { number: ['7', '3', '3', '99', 'A'], letter: 'ABC' }, ways: { number: 'sideways' } } };
    const { game } = loadProgress(device(JSON.stringify(saved)));
    expect(game.topic).toBe('number');
    expect(game.scopes.number).toEqual(['3', '7']);
    expect(game.scopes.letter).toEqual(['A', 'B', 'C', 'D', 'E']);
    expect(game.ways.number).toBe('mix');
  });

  it('keep the Ways from a save made when Find It had Rounds, and start fresh from a damaged one', () => {
    const old = { format: 1, done: { 0: [0, 1] }, game: { ways: { number: 'find-symbol', letter: 'find-picture' } } };
    expect(loadProgress(device(JSON.stringify(old))).game.ways).toEqual({ number: 'find-symbol', letter: 'find-picture' });
    expect(loadProgress(device('{"game":')).game.topic).toBe('number');
  });
});
