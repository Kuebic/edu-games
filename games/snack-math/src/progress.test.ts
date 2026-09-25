import { gameStorage, memoryStorage } from '@shared/storage';
import { describe, expect, it } from 'vitest';
import { STICKERS, defaultSave, finishRound, loadSave, pickSticker, roundAfter, roundsDone, writeSave } from './progress';

/** A device holding this raw save under its real key, or nothing. */
const device = (initial?: string) =>
  gameStorage('snack-math', memoryStorage(initial === undefined ? {} : { 'snack-math:v1': initial }));

describe('Rounds', () => {
  it('are done in order, a count per Stage', () => {
    const save = { ...defaultSave(), rounds: [4, 2, 0, 0, 0, 0] };
    expect(roundsDone(save, 0)).toEqual([true, true, true, true]);
    expect(roundsDone(save, 1)).toEqual([true, true, false, false]);
    expect(roundsDone(save, 2)).toEqual([false, false, false, false]);
  });

  it('count a finished Round, and a replayed one never takes any back', () => {
    const save = defaultSave();
    finishRound(save, 2, 0);
    finishRound(save, 2, 1);
    finishRound(save, 2, 0);
    expect(save.rounds).toEqual([0, 0, 2, 0, 0, 0]);
  });

  it('praise the first finish of a Stage’s last Round only', () => {
    const save = { ...defaultSave(), rounds: [3, 0, 0, 0, 0, 0] };
    expect(finishRound(save, 0, 2)).toBe(false);
    expect(finishRound(save, 0, 3)).toBe(true);
    expect(finishRound(save, 0, 3)).toBe(false);
  });

  it('go on to the next Round, up the ladder to the next Stage, and stop after the last', () => {
    expect(roundAfter(0, 0)).toEqual({ stage: 0, round: 1 });
    expect(roundAfter(1, 3)).toEqual({ stage: 2, round: 0 });
    expect(roundAfter(5, 3)).toBeUndefined();
  });
});

describe('pickSticker', () => {
  it('prefers a Sticker not owned yet', () => {
    const owned = STICKERS.slice(1);
    expect(pickSticker(owned, () => 0.5)).toBe(STICKERS[0]);
  });

  it('still gives one when all are owned', () => {
    expect(STICKERS).toContain(pickSticker(STICKERS, () => 0.99));
  });
});

describe('save', () => {
  it('round-trips', () => {
    const storage = device();
    const save = { ...defaultSave(), stage: 3, rounds: [4, 4, 4, 1, 0, 0], stickers: ['🦄'], voice: false, nextFriend: 7 };
    writeSave(save, storage);
    expect(loadSave(storage)).toEqual(save);
  });

  it('loads a save written before the shell, from its old key', () => {
    const old = { stage: 2, stickers: ['🦄', '🐙'], voice: true, sound: false, nextFriend: 1 };
    const backing = memoryStorage({ 'snack-math:v1': JSON.stringify(old) });
    const save = loadSave(gameStorage('snack-math', backing));
    expect(save).toEqual({ ...old, rounds: [4, 4, 0, 0, 0, 0] });
    writeSave(save, gameStorage('snack-math', backing));
    expect(Object.keys(backing.dump())).toEqual(['snack-math:v1']);
  });

  it('counts the Stages below an old save’s Stage as done, and starts its own at Round 1', () => {
    const save = loadSave(device(JSON.stringify({ stage: 3 })));
    expect(save.rounds).toEqual([4, 4, 4, 0, 0, 0]);
    expect(save.stage).toBe(3);
    expect(roundsDone(save, 3)).toEqual([false, false, false, false]);
  });

  it('keeps Rounds in range', () => {
    expect(loadSave(device(JSON.stringify({ stage: 3, rounds: [9, -1, 'x', 2] }))).rounds).toEqual([4, 0, 0, 2, 0, 0]);
  });

  it('falls back to defaults for missing, corrupt, or out-of-range data', () => {
    expect(loadSave(device())).toEqual(defaultSave());
    expect(loadSave(device('{not json'))).toEqual(defaultSave());
    expect(loadSave(device(JSON.stringify({ stage: 99, stickers: 'x' })))).toEqual(defaultSave());
  });
});
