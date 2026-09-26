import { gameStorage, memoryStorage } from '@shared/storage';
import { describe, expect, it } from 'vitest';
import { STICKERS, finishRound, loadProgress, pickSticker, roundAfter } from './progress';

/** A device holding this raw save under its real key, or nothing. */
const device = (initial?: string) =>
  gameStorage('snack-math', memoryStorage(initial === undefined ? {} : { 'snack-math:v1': initial }));

/** How many of each Stage's Rounds are done. */
const counts = (progress: ReturnType<typeof loadProgress>) => Array.from({ length: 6 }, (_, s) => progress.marks(s).filter((m) => m.done).length);

describe('Rounds', () => {
  it('are done one by one, per Stage', () => {
    const progress = loadProgress(device(JSON.stringify({ rounds: [4, 2, 0, 0, 0, 0] })));
    expect(progress.marks(0).map((m) => m.done)).toEqual([true, true, true, true]);
    expect(progress.marks(1).map((m) => m.done)).toEqual([true, true, false, false]);
    expect(progress.marks(2).map((m) => m.done)).toEqual([false, false, false, false]);
  });

  it('count a finished Round, and a replayed one never takes any back', () => {
    const progress = loadProgress(device());
    finishRound(progress, 2, 0);
    finishRound(progress, 2, 1);
    finishRound(progress, 2, 0);
    expect(counts(progress)).toEqual([0, 0, 2, 0, 0, 0]);
  });

  it('praise the first finish of a Stage’s last Round only', () => {
    const progress = loadProgress(device(JSON.stringify({ rounds: [3, 0, 0, 0, 0, 0] })));
    expect(finishRound(progress, 0, 2)).toBe(false);
    expect(finishRound(progress, 0, 3)).toBe(true);
    expect(finishRound(progress, 0, 3)).toBe(false);
  });

  it('go on to the next Round, up the ladder to the next Stage, and stop after the last', () => {
    const progress = loadProgress(device());
    expect(roundAfter(progress, 0, 0)).toEqual({ stage: 0, round: 1 });
    expect(roundAfter(progress, 1, 3)).toEqual({ stage: 2, round: 0 });
    expect(roundAfter(progress, 5, 3)).toBeUndefined();
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
    const progress = loadProgress(storage);
    progress.finish(3, 0);
    progress.set('voice', false);
    progress.game.stickers.push('🦄');
    progress.game.nextFriend = 7;
    progress.save();
    const again = loadProgress(storage);
    expect(counts(again)).toEqual([0, 0, 0, 1, 0, 0]);
    expect(again.settings.voice).toBe(false);
    expect(again.game).toEqual({ stickers: ['🦄'], nextFriend: 7 });
  });

  it('loads a save written before the shell, from its old key', () => {
    const old = { stage: 2, stickers: ['🦄', '🐙'], voice: true, sound: false, nextFriend: 1 };
    const backing = memoryStorage({ 'snack-math:v1': JSON.stringify(old) });
    const progress = loadProgress(gameStorage('snack-math', backing));
    expect(counts(progress)).toEqual([4, 4, 0, 0, 0, 0]);
    expect(progress.settings).toMatchObject({ voice: true, sound: false });
    expect(progress.game).toEqual({ stickers: ['🦄', '🐙'], nextFriend: 1 });
    progress.save();
    expect(Object.keys(backing.dump())).toEqual(['snack-math:v1']);
  });

  it('counts the Stages below an old save’s Stage as done, and starts its own at Round 1', () => {
    const progress = loadProgress(device(JSON.stringify({ stage: 3 })));
    expect(counts(progress)).toEqual([4, 4, 4, 0, 0, 0]);
    expect(progress.marks(3).map((m) => m.done)).toEqual([false, false, false, false]);
  });

  it('keeps Rounds in range', () => {
    expect(counts(loadProgress(device(JSON.stringify({ stage: 3, rounds: [9, -1, 'x', 2] }))))).toEqual([4, 0, 0, 2, 0, 0]);
  });

  it('counts no Rounds done from a corrupt list, whatever Stage was last played', () => {
    // Since Stages are Groups, `stage` is only the one last played, so it says nothing about what is done.
    expect(counts(loadProgress(device(JSON.stringify({ stage: 4, rounds: null }))))).toEqual([0, 0, 0, 0, 0, 0]);
    expect(counts(loadProgress(device(JSON.stringify({ stage: 4, rounds: 'x' }))))).toEqual([0, 0, 0, 0, 0, 0]);
  });

  it('falls back to defaults for missing, corrupt, or out-of-range data', () => {
    for (const raw of [undefined, '{not json', JSON.stringify({ stage: 99, stickers: 'x' })]) {
      const progress = loadProgress(device(raw));
      expect(counts(progress)).toEqual([0, 0, 0, 0, 0, 0]);
      expect(progress.game).toEqual({ stickers: [], nextFriend: 0 });
      expect(progress.settings).toEqual({ sound: true, voice: true, everyLevelOpen: false });
    }
  });

  it('gives no Sparkles: every Round finishes, so there is nothing to score (ADR 0001)', () => {
    expect(loadProgress(device()).marks(0).some((m) => 'sparkle' in m)).toBe(false);
  });
});
