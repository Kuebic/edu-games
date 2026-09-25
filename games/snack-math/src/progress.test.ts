import { describe, expect, it } from 'vitest';
import { STICKERS, defaultSave, loadSave, nextStage, pickSticker, writeSave } from './progress';

function memoryStorage(initial?: string) {
  const data = new Map<string, string>();
  if (initial !== undefined) data.set('snack-math:v1', initial);
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
}

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
    const storage = memoryStorage();
    const save = { ...defaultSave(), stage: 3, stickers: ['🦄'], voice: false, nextFriend: 7 };
    writeSave(save, storage);
    expect(loadSave(storage)).toEqual(save);
  });

  it('falls back to defaults for missing, corrupt, or out-of-range data', () => {
    expect(loadSave(memoryStorage())).toEqual(defaultSave());
    expect(loadSave(memoryStorage('{not json'))).toEqual(defaultSave());
    expect(loadSave(memoryStorage(JSON.stringify({ stage: 99, stickers: 'x' })))).toEqual(defaultSave());
  });
});
