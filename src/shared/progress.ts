// Saved progress: what every Game remembers on the device (ADR 0012). Done Levels, Sparkles and the
// three site switches are the site's; a Game keeps a slot for what only it saves. One shape on disk,
// under the Game's own key; a save from before this goes through the Game's `legacy` reader.

import { setSoundEnabled } from './sound';
import type { GameStorage } from './storage';
import { nextLevel } from './unlock';
import { setVoiceEnabled } from './voice';

/** The Grown-up Corner's three site switches. */
export interface Settings {
  sound: boolean;
  voice: boolean;
  /** "Every level open": every Level open, not just the next one (unlock.ts). */
  everyLevelOpen: boolean;
}

/** One Level as the level select draws it. */
export interface LevelMark {
  done: boolean;
  /** Left out in a Game without Sparkles. */
  sparkle?: boolean;
}

/** The Game's slot: what only it saves, as a JSON-able object. */
export interface GameSlot<G> {
  /**
   * A whole slot from whatever was saved: undefined on a fresh save, or anything at all from a damaged
   * one. Keep what still makes sense and fill in the rest. Never throws.
   */
  read(saved: unknown): G;
  /** On a reset, wipes the slot's play data in place. Settings-like fields, such as a Skin, stay. */
  reset?(game: G): void;
}

/** A save from before this module, read into its parts. Anything left out starts fresh. */
export interface LegacySave {
  /** Each Group's done Levels, by Group index. */
  done?: Record<string, number[]>;
  sparkle?: Record<string, number[]>;
  settings?: Partial<Settings>;
  /** Handed to the slot's `read`. */
  game?: unknown;
}

export interface ProgressSpec<G> {
  /** Saved as "<slug>:<key>" by the shell. Never changes once the Game has been On, except to move Groups (`formerKey`). */
  key: string;
  /** Each Group's Level count, easiest first; a function when it can change (Way Out's bonus Pack). */
  sizes: readonly number[] | (() => readonly number[]);
  /** The Game gives Sparkles, so its marks carry them. */
  sparkles?: boolean;
  game?: GameSlot<G>;
  /** Reads a save made before this module. Without one, such a save starts fresh. */
  legacy?(saved: Record<string, unknown>): LegacySave;
  /**
   * The key the Game saved under before its Groups moved (Push Pals added Chapters in front). While `key`
   * holds nothing, the save there is read through `legacy`, whatever its shape, and saved under `key`.
   */
  formerKey?: string;
}

export interface Progress<G> {
  /** The site switches. Change one with set(), which saves and applies it. */
  readonly settings: Readonly<Settings>;
  /** The Game's own. Change it, then save(). */
  readonly game: G;
  /** One Level's marks. Groups and Levels count from 0. */
  mark(group: number, level: number): LevelMark;
  /** A Group's Levels in play order, for the level select. */
  marks(group: number): LevelMark[];
  /**
   * The child finished a Level, with a Sparkle if it was earned this time. A Sparkle, once earned, stays.
   * Saves. Says whether the Level was done for the first time, and whether the Sparkle is new.
   */
  finish(group: number, level: number, sparkle?: boolean): { done: boolean; sparkle: boolean };
  /** Where Next goes from a Level: the next one, the next Group's first, or undefined after the very last. */
  after(group: number, level: number): { group: number; level: number } | undefined;
  set(setting: keyof Settings, on: boolean): void;
  /** Erases done Levels, Sparkles and the slot's play data. Settings and the Skin stay. Saves. */
  reset(): void;
  /** Erases one Group's done Levels and Sparkles, when its Levels changed (My Letter's new Name). Saves. */
  forget(group: number): void;
  save(): void;
}

/** What the switches drive. The browser gets the Sound and the Voice; tests pass fakes. */
export interface Applies {
  sound(on: boolean): void;
  voice(on: boolean): void;
}

/** The shape on disk. */
interface Saved<G> {
  format: 1;
  done: Record<string, number[]>;
  sparkle: Record<string, number[]>;
  settings: Settings;
  game: G;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Each Group's Level indices, sorted and unique, from anything. */
function readMarks(raw: unknown): Record<string, number[]> {
  const marks: Record<string, number[]> = {};
  if (!isRecord(raw)) return marks;
  for (const [group, levels] of Object.entries(raw)) {
    if (!/^\d+$/.test(group) || !Array.isArray(levels)) continue;
    const clean = [...new Set(levels.filter((l): l is number => Number.isInteger(l) && l >= 0))].sort((a, b) => a - b);
    if (clean.length) marks[group] = clean;
  }
  return marks;
}

function readSettings(raw: unknown): Settings {
  const r = isRecord(raw) ? raw : {};
  return { sound: r.sound !== false, voice: r.voice !== false, everyLevelOpen: r.everyLevelOpen === true };
}

const has = (marks: Record<string, number[]>, group: number, level: number) => marks[group]?.includes(level) === true;

/** Adds a Level to a Group's marks. True if it wasn't there. */
function add(marks: Record<string, number[]>, group: number, level: number): boolean {
  if (has(marks, group, level)) return false;
  marks[group] = [...(marks[group] ?? []), level].sort((a, b) => a - b);
  return true;
}

const browser: Applies = { sound: setSoundEnabled, voice: setVoiceEnabled };

/**
 * Opens a Game's Saved progress: reads the save (or the Game's old one), applies the Sound and Voice
 * switches, and gives the handle every screen uses. Storage never throws (ADR 0006), so neither does this.
 */
export function openProgress<G = Record<string, never>>(storage: GameStorage, spec: ProgressSpec<G>, applies: Applies = browser): Progress<G> {
  const slot: GameSlot<G> = spec.game ?? { read: () => ({}) as G };
  const raw = storage.read(spec.key);
  const former = raw === undefined && spec.formerKey !== undefined ? storage.read(spec.formerKey) : undefined;
  const parts: Partial<Saved<unknown>> | LegacySave =
    isRecord(raw) && raw.format === 1
      ? raw
      : isRecord(raw) && spec.legacy
        ? spec.legacy(raw)
        : isRecord(former) && spec.legacy
          ? spec.legacy(former)
          : {};
  const saved: Saved<G> = {
    format: 1,
    done: readMarks(parts.done),
    sparkle: readMarks(parts.sparkle),
    settings: readSettings(parts.settings),
    game: slot.read(parts.game),
  };
  const sizes = () => (typeof spec.sizes === 'function' ? spec.sizes() : spec.sizes);
  const mark = (group: number, level: number): LevelMark =>
    spec.sparkles ? { done: has(saved.done, group, level), sparkle: has(saved.sparkle, group, level) } : { done: has(saved.done, group, level) };
  const save = () => storage.write(spec.key, saved);
  const apply = () => {
    applies.sound(saved.settings.sound);
    applies.voice(saved.settings.voice);
  };
  apply();

  return {
    settings: saved.settings,
    game: saved.game,
    mark,
    marks: (group) => Array.from({ length: sizes()[group] ?? 0 }, (_, level) => mark(group, level)),
    finish(group, level, sparkle = false) {
      const first = { done: add(saved.done, group, level), sparkle: spec.sparkles === true && sparkle && add(saved.sparkle, group, level) };
      save();
      return first;
    },
    after: (group, level) => nextLevel(sizes(), group, level),
    set(setting, on) {
      saved.settings[setting] = on;
      apply();
      save();
    },
    reset() {
      saved.done = {};
      saved.sparkle = {};
      slot.reset?.(saved.game);
      save();
    },
    forget(group) {
      delete saved.done[group];
      delete saved.sparkle[group];
      save();
    },
    save,
  };
}
