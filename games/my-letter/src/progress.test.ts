import { gameStorage, memoryStorage } from '@shared/storage';
import { describe, expect, it } from 'vitest';
import { MY_WORDS, NEW_LETTERS } from './letters';
import { hasName, loadProgress, myWords, setName, setWords } from './progress';

/** A device holding this raw save under its real key, or nothing. */
const device = (initial?: object | string) =>
  gameStorage(
    'my-letter',
    memoryStorage(initial === undefined ? {} : { 'my-letter:v1': typeof initial === 'string' ? initial : JSON.stringify(initial) }),
  );

const done = (marks: { done: boolean }[]) => marks.map((m) => m.done);

describe('Levels', () => {
  it('are none in My words without a Name or a Word, and always eight in New letters, none done to start with', () => {
    const progress = loadProgress(device());
    expect(progress.marks(MY_WORDS)).toEqual([]);
    expect(done(progress.marks(NEW_LETTERS))).toEqual(Array(8).fill(false));
    expect(hasName(progress)).toBe(false);
  });

  it('are one in My words once there’s a Name, and New letters stays Group 1 whatever the Name', () => {
    const progress = loadProgress(device());
    progress.finish(NEW_LETTERS, 0);
    setName(progress, 'Anna');
    expect(progress.marks(MY_WORDS)).toHaveLength(1);
    expect(done(progress.marks(NEW_LETTERS))[0]).toBe(true);
    setName(progress, '');
    expect(progress.marks(MY_WORDS)).toEqual([]);
    expect(done(progress.marks(NEW_LETTERS))[0]).toBe(true);
  });

  it('go on from My words into New letters, and stop after J', () => {
    const progress = loadProgress(device({ format: 1, game: { name: 'Sam' } }));
    expect(progress.after(MY_WORDS, 0)).toEqual({ group: NEW_LETTERS, level: 0 });
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
    expect(progress.marks(MY_WORDS)).toEqual([]);
  });

  it('when it’s spelt differently, clears My words’ Done marks, and only those', () => {
    const progress = loadProgress(device());
    setName(progress, 'Sam');
    progress.finish(MY_WORDS, 0);
    progress.finish(NEW_LETTERS, 3);
    expect(setName(progress, 'Sara')).toBe(true);
    expect(done(progress.marks(MY_WORDS))).toEqual([false]);
    expect(done(progress.marks(NEW_LETTERS))[3]).toBe(true);
    // The same letters in another order are another spelling.
    progress.finish(MY_WORDS, 0);
    expect(setName(progress, 'Aras')).toBe(true);
    expect(done(progress.marks(MY_WORDS))).toEqual([false]);
  });

  it('keeps My words’ Done marks when only case, spaces or accents change', () => {
    const progress = loadProgress(device());
    setName(progress, 'Zoe');
    progress.finish(MY_WORDS, 0);
    expect(setName(progress, ' zoë')).toBe(false);
    expect(done(progress.marks(MY_WORDS))).toEqual([true]);
  });

  it('outlasts a reset, as does a skip', () => {
    const storage = device();
    const first = loadProgress(storage);
    setName(first, 'Sam');
    first.game.skipped = true;
    first.save();
    first.finish(MY_WORDS, 0);
    first.finish(NEW_LETTERS, 0);
    first.reset();
    const again = loadProgress(storage);
    expect(again.game).toEqual({ name: 'Sam', words: [], faint: true, skipped: true });
    expect(done(again.marks(MY_WORDS))).toEqual([false]);
  });

  it('starts empty and not skipped, and from a damaged slot', () => {
    expect(loadProgress(device()).game).toEqual({ name: '', words: [], faint: true, skipped: false });
    expect(loadProgress(device({ format: 1, game: { name: 7, words: 'Mama', skipped: 'yes' } })).game).toEqual({ name: '', words: [], faint: true, skipped: false });
    expect(loadProgress(device('{"game":')).game).toEqual({ name: '', words: [], faint: true, skipped: false });
  });
});

describe('the Words', () => {
  it('are Levels after the Name, kept as typed, trimmed, through the device', () => {
    const storage = device();
    const progress = loadProgress(storage);
    setName(progress, 'Sam');
    setWords(progress, [' Mama', 'Dada ']);
    const again = loadProgress(storage);
    expect(again.game.words).toEqual(['Mama', 'Dada']);
    expect(myWords(again)).toEqual(['Sam', 'Mama', 'Dada']);
    expect(again.marks(MY_WORDS)).toHaveLength(3);
    expect(again.after(MY_WORDS, 2)).toEqual({ group: NEW_LETTERS, level: 0 });
  });

  it('make My words without a Name', () => {
    const progress = loadProgress(device());
    setWords(progress, ['Mama']);
    expect(hasName(progress)).toBe(false);
    expect(progress.marks(MY_WORDS)).toHaveLength(1);
  });

  it('added at the end keep My words’ Done marks', () => {
    const progress = loadProgress(device());
    setName(progress, 'Sam');
    progress.finish(MY_WORDS, 0);
    expect(setWords(progress, ['Mama'])).toBe(false);
    progress.finish(MY_WORDS, 1);
    expect(setWords(progress, ['Mama', 'Leo'])).toBe(false);
    expect(done(progress.marks(MY_WORDS))).toEqual([true, true, false]);
  });

  it('changed, moved or taken away start My words fresh, and New letters stays', () => {
    const progress = loadProgress(device());
    setName(progress, 'Sam');
    setWords(progress, ['Mama', 'Dada']);
    progress.finish(MY_WORDS, 0);
    progress.finish(NEW_LETTERS, 2);
    expect(setWords(progress, ['Dada'])).toBe(true);
    expect(done(progress.marks(MY_WORDS))).toEqual([false, false]);
    expect(done(progress.marks(NEW_LETTERS))[2]).toBe(true);
    progress.finish(MY_WORDS, 0);
    expect(setWords(progress, ['Dad'])).toBe(true);
    expect(done(progress.marks(MY_WORDS))).toEqual([false, false]);
  });

  it('keep My words’ Done marks when only case or spaces change', () => {
    const progress = loadProgress(device());
    setWords(progress, ['Mama']);
    progress.finish(MY_WORDS, 0);
    expect(setWords(progress, ['mama '])).toBe(false);
    expect(done(progress.marks(MY_WORDS))).toEqual([true]);
  });

  it('outlast a reset, and read only strings from a damaged slot', () => {
    const storage = device({ format: 1, game: { words: ['Mama', 3, null, ' Leo '] } });
    const progress = loadProgress(storage);
    expect(progress.game.words).toEqual(['Mama', 'Leo']);
    progress.reset();
    expect(loadProgress(storage).game.words).toEqual(['Mama', 'Leo']);
  });
});

describe('Faint letters', () => {
  it('are on to start with, and from a damaged slot', () => {
    expect(loadProgress(device()).game.faint).toBe(true);
    expect(loadProgress(device({ format: 1, game: { faint: 'no' } })).game.faint).toBe(true);
  });

  it('stay off once a grown-up turns them off, through a reset', () => {
    const storage = device();
    const progress = loadProgress(storage);
    progress.game.faint = false;
    progress.save();
    progress.reset();
    expect(loadProgress(storage).game.faint).toBe(false);
  });
});
