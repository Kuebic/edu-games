// What's saved on the device: Levels done, Sparkles, each Level's Draft, the Skin and settings.
// Storage can be blocked (private browsing); then the game still plays, it just won't remember.

import type { GameStorage } from '@shared/storage';
import type { Program } from './game/level';
import { LEVELS_PER_WORLD, WORLDS } from './levels';

/** Saved as "robot-path:v1": the shell puts the Slug in front. */
const KEY = 'v1';
const VERSION = 2;
/** Levels done in a World before the next World opens, so one stuck Level never blocks him. */
export const WORLD_UNLOCK_AT = 6;

export const SKINS = ['garden', 'planet', 'sea'] as const;
export type SkinId = (typeof SKINS)[number];
export const SPEEDS = ['slow', 'normal', 'fast'] as const;
export type Speed = (typeof SPEEDS)[number];

export interface LevelProgress {
  done: boolean;
  sparkle: boolean;
  /** The Program in the bar when he last left, so his work is still there. */
  draft?: Program;
}

export interface Progress {
  version: typeof VERSION;
  skin: SkinId;
  levels: Record<string, LevelProgress>;
  settings: { sound: boolean; voice: boolean; speed: Speed };
  unlockAll: boolean;
}

export function freshProgress(): Progress {
  return { version: VERSION, skin: 'garden', levels: {}, settings: { sound: true, voice: true, speed: 'normal' }, unlockAll: false };
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Version 2 put three maze Worlds in as worlds 3-5, so version 1's worlds 3-5 are now 6-8. */
function levelIdNow(id: string, version: unknown): string {
  const old = /^w([3-5])-(\d+)$/.exec(id);
  return version === 1 && old ? `w${Number(old[1]) + 3}-${old[2]}` : id;
}

/**
 * Turns whatever was saved into a current Progress, keeping everything that still makes sense.
 * A future version bump adds a step here that upgrades the old shape; it never wipes.
 */
export function migrate(raw: unknown): Progress {
  const progress = freshProgress();
  if (!isObject(raw)) return progress;
  if (SKINS.includes(raw.skin as SkinId)) progress.skin = raw.skin as SkinId;
  if (isObject(raw.levels))
    for (const [id, saved] of Object.entries(raw.levels)) {
      if (!isObject(saved)) continue;
      progress.levels[levelIdNow(id, raw.version)] = {
        done: saved.done === true,
        sparkle: saved.sparkle === true,
        ...(Array.isArray(saved.draft) && { draft: saved.draft as Program }),
      };
    }
  if (isObject(raw.settings)) {
    const { sound, voice, speed } = raw.settings;
    progress.settings = {
      sound: sound !== false,
      voice: voice !== false,
      speed: SPEEDS.includes(speed as Speed) ? (speed as Speed) : 'normal',
    };
  }
  progress.unlockAll = raw.unlockAll === true;
  return progress;
}

export function loadProgress(storage: GameStorage): Progress {
  return migrate(storage.read(KEY));
}

export function saveProgress(progress: Progress, storage: GameStorage): void {
  storage.write(KEY, progress);
}

const levelOf = (progress: Progress, id: string): LevelProgress => progress.levels[id] ?? { done: false, sparkle: false };

export function withDraft(progress: Progress, id: string, draft: Program): Progress {
  return { ...progress, levels: { ...progress.levels, [id]: { ...levelOf(progress, id), draft } } };
}

/** A Sparkle, once earned, stays. */
export function withWin(progress: Progress, id: string, sparkle: boolean): Progress {
  const before = levelOf(progress, id);
  return { ...progress, levels: { ...progress.levels, [id]: { ...before, done: true, sparkle: before.sparkle || sparkle } } };
}

export function doneIn(progress: Progress, world: number): number {
  return WORLDS[world]!.levels.filter((level) => progress.levels[level.id]?.done).length;
}

/** Worlds count from 0. */
export function isWorldUnlocked(progress: Progress, world: number): boolean {
  if (progress.unlockAll || world === 0) return true;
  return isWorldUnlocked(progress, world - 1) && doneIn(progress, world - 1) >= WORLD_UNLOCK_AT;
}

/** Levels count from 0 within their World. Finishing one opens the next. */
export function isLevelUnlocked(progress: Progress, world: number, index: number): boolean {
  if (!isWorldUnlocked(progress, world)) return false;
  if (progress.unlockAll || index === 0) return true;
  const levels = WORLDS[world]!.levels;
  return !!(progress.levels[levels[index - 1]!.id]?.done || progress.levels[levels[index]!.id]?.done);
}

/** Where "next" goes after a win: the next Level in the World, then the next World if it's open. */
export function nextLevel(progress: Progress, world: number, index: number): { world: number; index: number } | null {
  if (index + 1 < LEVELS_PER_WORLD) return { world, index: index + 1 };
  if (world + 1 < WORLDS.length && isWorldUnlocked(progress, world + 1)) return { world: world + 1, index: 0 };
  return null;
}
