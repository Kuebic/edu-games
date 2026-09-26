import { gameStorage, memoryStorage } from '@shared/storage';
import { describe, expect, it } from 'vitest';
import { levelAfter, loadProgress, saveDraft } from './progress';

/** A device holding these raw saves, under their real keys. */
const device = (seed: Record<string, string> = {}) => gameStorage('robot-path', memoryStorage(seed));

/** The ids of every Level done, "w1-01" style. */
const doneIds = (progress: ReturnType<typeof loadProgress>) =>
  Array.from({ length: 8 }, (_, w) => progress.marks(w).flatMap((m, i) => (m.done ? [`w${w + 1}-${String(i + 1).padStart(2, '0')}`] : []))).flat();

describe('progress', () => {
  it('starts fresh and survives a save', () => {
    const storage = device();
    const fresh = loadProgress(storage);
    expect(doneIds(fresh)).toEqual([]);
    expect(fresh.game).toEqual({ skin: 'garden', speed: 'normal', drafts: {} });
    fresh.finish(0, 0, true);
    saveDraft(fresh, 'w1-02', [{ op: 'up' }]);
    fresh.game.skin = 'planet';
    fresh.game.speed = 'fast';
    fresh.save();
    const again = loadProgress(storage);
    expect(again.mark(0, 0)).toEqual({ done: true, sparkle: true });
    expect(again.game).toEqual({ skin: 'planet', speed: 'fast', drafts: { 'w1-02': [{ op: 'up' }] } });
  });

  it('loads a save written before the shell, from its old key', () => {
    const backing = memoryStorage({
      'robot-path:v1': JSON.stringify({ version: 2, skin: 'planet', levels: { 'w1-01': { done: true, sparkle: true, draft: [{ op: 'left' }] } } }),
    });
    const progress = loadProgress(gameStorage('robot-path', backing));
    expect(progress.game.skin).toBe('planet');
    expect(progress.mark(0, 0)).toEqual({ done: true, sparkle: true });
    expect(progress.game.drafts['w1-01']).toEqual([{ op: 'left' }]);
    progress.save();
    expect(Object.keys(backing.dump())).toEqual(['robot-path:v1']);
  });

  it('keeps what still makes sense from an odd save', () => {
    const storage = device({ 'robot-path:v1': JSON.stringify({ skin: 'moon', levels: { 'w1-01': { done: true, draft: 'x' } }, settings: { speed: 'warp', voice: false }, unlockAll: true }) });
    const progress = loadProgress(storage);
    expect(progress.game).toEqual({ skin: 'garden', speed: 'normal', drafts: {} });
    expect(progress.mark(0, 0)).toEqual({ done: true, sparkle: false });
    expect(progress.settings).toEqual({ sound: true, voice: false, everyLevelOpen: true });
  });

  it('moves version 1 saves past the maze Worlds', () => {
    const old = { version: 1, levels: { 'w2-08': { done: true }, 'w3-01': { done: true, sparkle: true, draft: [{ op: 'up' }] }, 'w5-08': { done: true } } };
    const storage = device({ 'robot-path:v1': JSON.stringify(old) });
    const progress = loadProgress(storage);
    expect(doneIds(progress)).toEqual(['w2-08', 'w6-01', 'w8-08']);
    expect(progress.mark(5, 0).sparkle).toBe(true);
    expect(Object.keys(progress.game.drafts)).toEqual(['w6-01']);
    progress.save();
    expect(doneIds(loadProgress(storage))).toEqual(['w2-08', 'w6-01', 'w8-08']);
  });

  it('never takes a Sparkle away', () => {
    const progress = loadProgress(device());
    progress.finish(0, 0, true);
    progress.finish(0, 0, false);
    expect(progress.mark(0, 0).sparkle).toBe(true);
  });

  it('keeps the Skin and Speed on a reset, and wipes the Drafts', () => {
    const progress = loadProgress(device());
    progress.game.skin = 'sea';
    saveDraft(progress, 'w1-01', [{ op: 'up' }]);
    progress.finish(0, 0);
    progress.reset();
    expect(progress.game).toEqual({ skin: 'sea', speed: 'normal', drafts: {} });
    expect(progress.mark(0, 0).done).toBe(false);
  });

  it('goes on to the next Level, then the next World, and stops after the last', () => {
    const progress = loadProgress(device());
    expect(levelAfter(progress, 0, 3)).toEqual({ world: 0, index: 4 });
    expect(levelAfter(progress, 0, 7)).toEqual({ world: 1, index: 0 });
    expect(levelAfter(progress, 6, 7)).toEqual({ world: 7, index: 0 });
    expect(levelAfter(progress, 7, 7)).toBeUndefined();
  });
});
