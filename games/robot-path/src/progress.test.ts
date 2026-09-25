import { gameStorage, memoryStorage } from '@shared/storage';
import { describe, expect, it } from 'vitest';
import { freshProgress, levelAfter, loadProgress, saveProgress, withDraft, withWin } from './progress';

/** A device holding these raw saves, under their real keys. */
const device = (seed: Record<string, string> = {}) => gameStorage('robot-path', memoryStorage(seed));

describe('progress', () => {
  it('starts fresh and survives a save', () => {
    const storage = device();
    expect(loadProgress(storage)).toEqual(freshProgress());
    const saved = withDraft(withWin(freshProgress(), 'w1-01', true), 'w1-02', [{ op: 'up' }]);
    saveProgress({ ...saved, skin: 'planet' }, storage);
    expect(loadProgress(storage)).toEqual({ ...saved, skin: 'planet' });
  });

  it('loads a save written before the shell, from its old key', () => {
    const backing = memoryStorage({
      'robot-path:v1': JSON.stringify({ version: 2, skin: 'planet', levels: { 'w1-01': { done: true, sparkle: true } } }),
    });
    const progress = loadProgress(gameStorage('robot-path', backing));
    expect(progress.skin).toBe('planet');
    expect(progress.levels['w1-01']).toEqual({ done: true, sparkle: true });
    saveProgress(progress, gameStorage('robot-path', backing));
    expect(Object.keys(backing.dump())).toEqual(['robot-path:v1']);
  });

  it('keeps what still makes sense from an odd save', () => {
    const storage = device({ 'robot-path:v1': JSON.stringify({ skin: 'moon', levels: { 'w1-01': { done: true, draft: 'x' } }, settings: { speed: 'warp', voice: false } }) });
    const progress = loadProgress(storage);
    expect(progress.skin).toBe('garden');
    expect(progress.levels['w1-01']).toEqual({ done: true, sparkle: false });
    expect(progress.settings).toEqual({ sound: true, voice: false, speed: 'normal' });
  });

  it('moves version 1 saves past the maze Worlds', () => {
    const old = { version: 1, levels: { 'w2-08': { done: true }, 'w3-01': { done: true, sparkle: true }, 'w5-08': { done: true } } };
    const storage = device({ 'robot-path:v1': JSON.stringify(old) });
    expect(Object.keys(loadProgress(storage).levels)).toEqual(['w2-08', 'w6-01', 'w8-08']);
    saveProgress(loadProgress(storage), storage);
    expect(Object.keys(loadProgress(storage).levels)).toEqual(['w2-08', 'w6-01', 'w8-08']);
  });

  it('never takes a Sparkle away', () => {
    const once = withWin(freshProgress(), 'w1-01', true);
    expect(withWin(once, 'w1-01', false).levels['w1-01']!.sparkle).toBe(true);
  });

  it('goes on to the next Level, then the next World, and stops after the last', () => {
    expect(levelAfter(0, 3)).toEqual({ world: 0, index: 4 });
    expect(levelAfter(0, 7)).toEqual({ world: 1, index: 0 });
    expect(levelAfter(6, 7)).toEqual({ world: 7, index: 0 });
    expect(levelAfter(7, 7)).toBeUndefined();
  });
});
