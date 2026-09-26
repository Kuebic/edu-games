import { gameStorage, memoryStorage } from '@shared/storage';
import { describe, expect, it } from 'vitest';
import { hasName, loadProgress, setName } from './progress';

/** A device holding this raw save under its real key, or nothing. */
const device = (initial?: object | string) =>
  gameStorage(
    'my-letter',
    memoryStorage(initial === undefined ? {} : { 'my-letter:v1': typeof initial === 'string' ? initial : JSON.stringify(initial) }),
  );

const done = (marks: { done: boolean }[]) => marks.map((m) => m.done);

describe('Levels', () => {
  it('are none in My name without a Name, and always eight in New letters, none done to start with', () => {
    const progress = loadProgress(device());
    expect(progress.marks(0)).toEqual([]);
    expect(done(progress.marks(1))).toEqual(Array(8).fill(false));
    expect(hasName(progress)).toBe(false);
  });

  it('are one per Name letter in My name, and New letters stays Group 1 whatever the Name', () => {
    const progress = loadProgress(device());
    progress.finish(1, 0);
    setName(progress, 'Anna');
    expect(progress.marks(0)).toHaveLength(2);
    expect(done(progress.marks(1))[0]).toBe(true);
    setName(progress, '');
    expect(progress.marks(0)).toEqual([]);
    expect(done(progress.marks(1))[0]).toBe(true);
  });

  it('go on from My name into New letters, and stop after J', () => {
    const progress = loadProgress(device({ format: 1, game: { name: 'Sam' } }));
    expect(progress.after(0, 1)).toEqual({ group: 0, level: 2 });
    expect(progress.after(0, 2)).toEqual({ group: 1, level: 0 });
    expect(progress.after(1, 7)).toBeUndefined();
  });
});

describe('the Name', () => {
  it('is kept as typed, trimmed, and round-trips through the device', () => {
    const storage = device();
    setName(loadProgress(storage), '  Zoë ');
    const again = loadProgress(storage);
    expect(again.game.name).toBe('Zoë');
    expect(hasName(again)).toBe(true);
  });

  it('counts as no Name with no letters', () => {
    const progress = loadProgress(device());
    setName(progress, '42');
    expect(hasName(progress)).toBe(false);
    expect(progress.marks(0)).toEqual([]);
  });

  it('when it changes to different letters, clears My name’s Done marks, and only those', () => {
    const progress = loadProgress(device());
    setName(progress, 'Sam');
    progress.finish(0, 0);
    progress.finish(0, 1);
    progress.finish(1, 3);
    setName(progress, 'Sara');
    expect(done(progress.marks(0))).toEqual([false, false, false]);
    expect(done(progress.marks(1))[3]).toBe(true);
  });

  it('keeps My name’s Done marks when only case, spaces or accents change', () => {
    const progress = loadProgress(device());
    setName(progress, 'Zoe');
    progress.finish(0, 0);
    setName(progress, ' zoë');
    expect(done(progress.marks(0))).toEqual([true, false, false]);
  });

  it('outlasts a reset, as does a skip', () => {
    const storage = device();
    const first = loadProgress(storage);
    setName(first, 'Sam');
    first.game.skipped = true;
    first.save();
    first.finish(0, 0);
    first.finish(1, 0);
    first.reset();
    const again = loadProgress(storage);
    expect(again.game).toEqual({ name: 'Sam', skipped: true });
    expect(done(again.marks(0))).toEqual([false, false, false]);
  });

  it('starts empty and not skipped, and from a damaged slot', () => {
    expect(loadProgress(device()).game).toEqual({ name: '', skipped: false });
    expect(loadProgress(device({ format: 1, game: { name: 7, skipped: 'yes' } })).game).toEqual({ name: '', skipped: false });
    expect(loadProgress(device('{"game":')).game).toEqual({ name: '', skipped: false });
  });
});
