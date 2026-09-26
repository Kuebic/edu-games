import { describe, expect, it, vi } from 'vitest';
import { openProgress, type Applies, type ProgressSpec } from './progress';
import { gameStorage, memoryStorage } from './storage';

/** A device holding these raw saves, under their real keys. */
const device = (seed: Record<string, string> = {}) => {
  const backing = memoryStorage(seed);
  return { backing, storage: gameStorage('g', backing), saved: () => JSON.parse(backing.dump()['g:v1'] ?? 'null') as unknown };
};

const quiet: Applies = { sound: () => {}, voice: () => {} };

interface Slot {
  skin: string;
  drafts: Record<string, string>;
}

/** A Game with two Groups of three, Sparkles, a slot with a Skin and drafts, and an old save shape `{ solved: number[], muted }`. */
const spec: ProgressSpec<Slot> = {
  key: 'v1',
  sizes: [3, 3],
  sparkles: true,
  game: {
    read(raw) {
      const r = (typeof raw === 'object' && raw) as Partial<Slot> | null;
      return { skin: typeof r?.skin === 'string' ? r.skin : 'sun', drafts: typeof r?.drafts === 'object' && r.drafts ? r.drafts : {} };
    },
    reset(game) {
      game.drafts = {};
    },
  },
  legacy(saved) {
    const done: Record<string, number[]> = {};
    if (Array.isArray(saved.solved)) for (const n of saved.solved as number[]) (done[Math.floor(n / 3)] ??= []).push(n % 3);
    return { done, settings: { sound: saved.muted !== true }, game: { skin: saved.skin } };
  },
};

describe('Saved progress', () => {
  it('starts fresh: nothing done, every switch on but "Every level open", the slot as the Game reads nothing', () => {
    const progress = openProgress(device().storage, spec, quiet);
    expect(progress.marks(0)).toEqual([{ done: false, sparkle: false }, { done: false, sparkle: false }, { done: false, sparkle: false }]);
    expect(progress.settings).toEqual({ sound: true, voice: true, everyLevelOpen: false });
    expect(progress.game).toEqual({ skin: 'sun', drafts: {} });
  });

  it('survives a save, in one shape under the Game’s key', () => {
    const d = device();
    const progress = openProgress(d.storage, spec, quiet);
    progress.finish(0, 0, true);
    progress.finish(1, 2);
    progress.set('voice', false);
    progress.game.drafts['0-1'] = 'up';
    progress.save();
    expect(d.saved()).toEqual({
      format: 1,
      done: { 0: [0], 1: [2] },
      sparkle: { 0: [0] },
      settings: { sound: true, voice: false, everyLevelOpen: false },
      game: { skin: 'sun', drafts: { '0-1': 'up' } },
    });
    const again = openProgress(d.storage, spec, quiet);
    expect(again.mark(0, 0)).toEqual({ done: true, sparkle: true });
    expect(again.mark(1, 2)).toEqual({ done: true, sparkle: false });
    expect(again.settings.voice).toBe(false);
    expect(again.game.drafts).toEqual({ '0-1': 'up' });
  });

  it('reads a save from before it through the Game’s legacy reader, and writes it back in the new shape', () => {
    const d = device({ 'g:v1': JSON.stringify({ solved: [0, 1, 5], muted: true, skin: 'moon' }) });
    const progress = openProgress(d.storage, spec, quiet);
    expect(progress.marks(0).map((m) => m.done)).toEqual([true, true, false]);
    expect(progress.marks(1).map((m) => m.done)).toEqual([false, false, true]);
    expect(progress.settings.sound).toBe(false);
    expect(progress.game.skin).toBe('moon');
    progress.save();
    expect(d.saved()).toMatchObject({ format: 1, done: { 0: [0, 1], 1: [2] } });
    expect(Object.keys(d.backing.dump())).toEqual(['g:v1']);
  });

  it('reads the save under a former key through the legacy reader, whatever its shape, until the new key has one', () => {
    // Groups moved: a new Group went in front, so every old one is one further on.
    const moved: ProgressSpec<Slot> = {
      ...spec,
      key: 'v2',
      formerKey: 'v1',
      legacy: (saved) => ({ done: { 1: (saved.done as Record<string, number[]>)[0]! }, settings: { sound: false } }),
    };
    const d = device({ 'g:v1': JSON.stringify({ format: 1, done: { 0: [0, 2] }, sparkle: {}, settings: { sound: true }, game: {} }) });
    const progress = openProgress(d.storage, moved, quiet);
    expect(progress.marks(1).map((m) => m.done)).toEqual([true, false, true]);
    expect(progress.settings.sound).toBe(false);
    progress.finish(0, 0);
    const again = openProgress(d.storage, moved, quiet);
    expect(again.marks(0).map((m) => m.done)).toEqual([true, false, false]);
    expect(again.marks(1).map((m) => m.done)).toEqual([true, false, true]);
    expect(JSON.parse(d.backing.dump()['g:v1']!)).toMatchObject({ done: { 0: [0, 2] } });
  });

  it('starts fresh from an old save when the Game has no legacy reader', () => {
    const d = device({ 'g:v1': JSON.stringify({ solved: [0] }) });
    const { legacy: _, ...noLegacy } = spec;
    expect(openProgress(d.storage, noLegacy, quiet).mark(0, 0).done).toBe(false);
  });

  it('keeps what still makes sense from a damaged save', () => {
    const d = device({
      'g:v1': JSON.stringify({ format: 1, done: { 0: [1, 'x', -1, 1, 2.5], no: [0], 1: 'all' }, sparkle: null, settings: { sound: 'off', everyLevelOpen: true }, game: 7 }),
    });
    const progress = openProgress(d.storage, spec, quiet);
    expect(progress.marks(0).map((m) => m.done)).toEqual([false, true, false]);
    expect(progress.marks(1).map((m) => m.done)).toEqual([false, false, false]);
    expect(progress.settings).toEqual({ sound: true, voice: true, everyLevelOpen: true });
    expect(progress.game).toEqual({ skin: 'sun', drafts: {} });
    expect(openProgress(device({ 'g:v1': '{not json' }).storage, spec, quiet).mark(0, 0).done).toBe(false);
  });

  it('finishes a Level once, keeps a Sparkle once earned, and says what was new', () => {
    const progress = openProgress(device().storage, spec, quiet);
    expect(progress.finish(0, 1)).toEqual({ done: true, sparkle: false });
    expect(progress.finish(0, 1, true)).toEqual({ done: false, sparkle: true });
    expect(progress.finish(0, 1, false)).toEqual({ done: false, sparkle: false });
    expect(progress.mark(0, 1)).toEqual({ done: true, sparkle: true });
  });

  it('gives marks without Sparkles in a Game that has none', () => {
    const progress = openProgress(device().storage, { key: 'v1', sizes: [2] }, quiet);
    progress.finish(0, 0, true);
    expect(progress.marks(0)).toEqual([{ done: true }, { done: false }]);
    expect(progress.game).toEqual({});
  });

  it('goes on to the next Level, then the next Group, and stops after the last; Groups can change', () => {
    let groups = 2;
    const progress = openProgress(device().storage, { ...spec, sizes: () => Array(groups).fill(3) }, quiet);
    expect(progress.after(0, 1)).toEqual({ group: 0, level: 2 });
    expect(progress.after(0, 2)).toEqual({ group: 1, level: 0 });
    expect(progress.after(1, 2)).toBeUndefined();
    groups = 3;
    expect(progress.after(1, 2)).toEqual({ group: 2, level: 0 });
    expect(progress.marks(2)).toHaveLength(3);
  });

  it('applies the Sound and Voice switches as it opens and as they change', () => {
    const applies = { sound: vi.fn(), voice: vi.fn() };
    const progress = openProgress(device({ 'g:v1': JSON.stringify({ format: 1, settings: { sound: false } }) }).storage, spec, applies);
    expect(applies.sound).toHaveBeenLastCalledWith(false);
    expect(applies.voice).toHaveBeenLastCalledWith(true);
    progress.set('voice', false);
    expect(applies.voice).toHaveBeenLastCalledWith(false);
    expect(progress.settings.voice).toBe(false);
  });

  it('resets what was played, keeping the switches and the Skin, and lets the Game wipe its slot', () => {
    const d = device();
    const progress = openProgress(d.storage, spec, quiet);
    progress.finish(0, 0, true);
    progress.set('everyLevelOpen', true);
    progress.game.skin = 'moon';
    progress.game.drafts['0-0'] = 'up';
    progress.reset();
    expect(progress.mark(0, 0)).toEqual({ done: false, sparkle: false });
    expect(progress.settings.everyLevelOpen).toBe(true);
    expect(progress.game).toEqual({ skin: 'moon', drafts: {} });
    expect(d.saved()).toMatchObject({ done: {}, sparkle: {}, game: { skin: 'moon', drafts: {} } });
  });

  it('forgets one Group, its done Levels and Sparkles, and leaves the rest', () => {
    const d = device();
    const progress = openProgress(d.storage, spec, quiet);
    progress.finish(0, 0, true);
    progress.finish(0, 1);
    progress.finish(1, 2, true);
    progress.forget(0);
    expect(progress.marks(0).some((m) => m.done || m.sparkle)).toBe(false);
    expect(progress.mark(1, 2)).toEqual({ done: true, sparkle: true });
    expect(d.saved()).toMatchObject({ done: { 1: [2] }, sparkle: { 1: [2] } });
  });

  it('keeps playing when storage is blocked', () => {
    const blocked = gameStorage('g', {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('full');
      },
    });
    const progress = openProgress(blocked, spec, quiet);
    expect(() => progress.finish(0, 0)).not.toThrow();
    expect(progress.mark(0, 0).done).toBe(true);
  });
});
