import { gameStorage, memoryStorage } from '@shared/storage';
import { describe, expect, it } from 'vitest';
import { STICKERS, defaultSave, loadSave, nextStage, pickSticker, writeSave } from './progress';

/** A device holding this raw save under its real key, or nothing. */
const device = (initial?: string) =>
  gameStorage('snack-math', memoryStorage(initial === undefined ? {} : { 'snack-math:v1': initial }));

describe('nextStage', () => {
  it('moves up after 4 or 5 First Tries', () => {
    expect(nextStage(0, 4)).toBe(1);
    expect(nextStage(2, 5)).toBe(3);
  });

  it('stays put below 4 and never moves down', () => {
    expect(nextStage(3, 3)).toBe(3);
    expect(nextStage(3, 0)).toBe(3);
  });

  it('stops at the last stage', () => {
    expect(nextStage(5, 5)).toBe(5);
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
    const save = { ...defaultSave(), stage: 3, stickers: ['🦄'], voice: false, nextFriend: 7 };
    writeSave(save, storage);
    expect(loadSave(storage)).toEqual(save);
  });

  it('loads a save written before the shell, from its old key', () => {
    const old = { stage: 2, stickers: ['🦄', '🐙'], voice: true, sound: false, nextFriend: 1 };
    const backing = memoryStorage({ 'snack-math:v1': JSON.stringify(old) });
    const save = loadSave(gameStorage('snack-math', backing));
    expect(save).toEqual(old);
    writeSave(save, gameStorage('snack-math', backing));
    expect(Object.keys(backing.dump())).toEqual(['snack-math:v1']);
  });

  it('falls back to defaults for missing, corrupt, or out-of-range data', () => {
    expect(loadSave(device())).toEqual(defaultSave());
    expect(loadSave(device('{not json'))).toEqual(defaultSave());
    expect(loadSave(device(JSON.stringify({ stage: 99, stickers: 'x' })))).toEqual(defaultSave());
  });
});
