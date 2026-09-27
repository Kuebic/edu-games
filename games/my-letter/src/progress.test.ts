import { gameStorage, memoryStorage } from '@shared/storage';
import { describe, expect, it } from 'vitest';
import { MY_NAME, NEW_LETTERS } from './letters';
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
    expect(progress.marks(MY_NAME)).toEqual([]);
    expect(done(progress.marks(NEW_LETTERS))).toEqual(Array(8).fill(false));
    expect(hasName(progress)).toBe(false);
  });

  it('are one in My name once there’s a Name, and New letters stays Group 1 whatever the Name', () => {
    const progress = loadProgress(device());
    progress.finish(NEW_LETTERS, 0);
    setName(progress, 'Anna');
    expect(progress.marks(MY_NAME)).toHaveLength(1);
    expect(done(progress.marks(NEW_LETTERS))[0]).toBe(true);
    setName(progress, '');
    expect(progress.marks(MY_NAME)).toEqual([]);
    expect(done(progress.marks(NEW_LETTERS))[0]).toBe(true);
  });

  it('go on from My name into New letters, and stop after J', () => {
    const progress = loadProgress(device({ format: 1, game: { name: 'Sam' } }));
    expect(progress.after(MY_NAME, 0)).toEqual({ group: NEW_LETTERS, level: 0 });
    expect(progress.after(NEW_LETTERS, 7)).toBeUndefined();
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
    expect(progress.marks(MY_NAME)).toEqual([]);
  });

  it('when it’s spelt differently, clears My name’s Done mark, and only that', () => {
    const progress = loadProgress(device());
    setName(progress, 'Sam');
    progress.finish(MY_NAME, 0);
    progress.finish(NEW_LETTERS, 3);
    expect(setName(progress, 'Sara')).toBe(true);
    expect(done(progress.marks(MY_NAME))).toEqual([false]);
    expect(done(progress.marks(NEW_LETTERS))[3]).toBe(true);
    // The same letters in another order are another spelling.
    progress.finish(MY_NAME, 0);
    expect(setName(progress, 'Aras')).toBe(true);
    expect(done(progress.marks(MY_NAME))).toEqual([false]);
  });

  it('keeps My name’s Done marks when only case, spaces or accents change', () => {
    const progress = loadProgress(device());
    setName(progress, 'Zoe');
    progress.finish(MY_NAME, 0);
    expect(setName(progress, ' zoë')).toBe(false);
    expect(done(progress.marks(MY_NAME))).toEqual([true]);
  });

  it('outlasts a reset, as does a skip', () => {
    const storage = device();
    const first = loadProgress(storage);
    setName(first, 'Sam');
    first.game.skipped = true;
    first.save();
    first.finish(MY_NAME, 0);
    first.finish(NEW_LETTERS, 0);
    first.reset();
    const again = loadProgress(storage);
    expect(again.game).toEqual({ name: 'Sam', skipped: true });
    expect(done(again.marks(MY_NAME))).toEqual([false]);
  });

  it('starts empty and not skipped, and from a damaged slot', () => {
    expect(loadProgress(device()).game).toEqual({ name: '', skipped: false });
    expect(loadProgress(device({ format: 1, game: { name: 7, skipped: 'yes' } })).game).toEqual({ name: '', skipped: false });
    expect(loadProgress(device('{"game":')).game).toEqual({ name: '', skipped: false });
  });
});
