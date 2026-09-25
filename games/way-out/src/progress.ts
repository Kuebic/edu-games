// What the child has done, saved on the device. The shell's storage never throws, so the
// game still plays with storage blocked; it just won't remember.

import type { GameStorage } from '@shared/storage';
import { nextLevel } from '@shared/unlock';
import type { Board } from './game/board';
import { GROWN_UP_PACK, type Level, type PoolPuzzle } from './packs';
import type { SkinId } from './skins';

/** Saved as "way-out:v1": the shell puts the Slug in front. */
const KEY = 'v1';

/** The board and Move count at one point, for Undo. */
export interface Snapshot {
  board: Board;
  moves: number;
}

export interface InProgress extends Snapshot {
  /** Earlier Snapshots, oldest first. */
  history: Snapshot[];
}

export interface LevelProgress {
  done: boolean;
  sparkle: boolean;
  bestMoves?: number;
  /** Where he left off, so coming back picks up there. */
  inProgress?: InProgress;
}

export interface Progress {
  version: 1;
  skin: SkinId;
  levels: Record<string, LevelProgress>;
  /** Pool boards already served, per Pack, so "more like this" doesn't repeat until they run out. */
  poolSeen: Record<string, Board[]>;
  /** Sparkles earned on Pool puzzles, per Pack. */
  poolSparkles: Record<string, number>;
  settings: { sound: boolean; voice: boolean };
  unlockAll: boolean;
  /** The bonus Pack is showing. */
  grownUp: boolean;
}

export function freshProgress(): Progress {
  return {
    version: 1,
    skin: 'city',
    levels: {},
    poolSeen: {},
    poolSparkles: {},
    settings: { sound: true, voice: true },
    unlockAll: false,
    grownUp: false,
  };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Reads a save, keeping whatever parts of it make sense. A save from a future version is
 * read the same way; when the format changes, bump `version` and convert old saves here.
 */
export function loadProgress(storage: GameStorage): Progress {
  const progress = freshProgress();
  const saved = storage.read(KEY);
  if (!isRecord(saved)) return progress;
  if (saved.skin === 'city' || saved.skin === 'farm' || saved.skin === 'space') progress.skin = saved.skin;
  if (isRecord(saved.levels)) {
    for (const [id, level] of Object.entries(saved.levels)) {
      if (!isRecord(level)) continue;
      const entry: LevelProgress = { done: level.done === true, sparkle: level.sparkle === true };
      if (typeof level.bestMoves === 'number') entry.bestMoves = level.bestMoves;
      const at = level.inProgress;
      if (isRecord(at) && typeof at.board === 'string' && typeof at.moves === 'number' && Array.isArray(at.history)) {
        entry.inProgress = {
          board: at.board,
          moves: at.moves,
          history: at.history.filter(
            (s): s is Snapshot => isRecord(s) && typeof s.board === 'string' && typeof s.moves === 'number',
          ),
        };
      }
      progress.levels[id] = entry;
    }
  }
  if (isRecord(saved.poolSeen)) {
    for (const [pack, seen] of Object.entries(saved.poolSeen)) {
      if (Array.isArray(seen)) progress.poolSeen[pack] = seen.filter((b): b is string => typeof b === 'string');
    }
  }
  if (isRecord(saved.poolSparkles)) {
    for (const [pack, count] of Object.entries(saved.poolSparkles)) {
      if (typeof count === 'number') progress.poolSparkles[pack] = count;
    }
  }
  if (isRecord(saved.settings)) {
    progress.settings.sound = saved.settings.sound !== false;
    progress.settings.voice = saved.settings.voice !== false;
  }
  progress.unlockAll = saved.unlockAll === true;
  progress.grownUp = saved.grownUp === true;
  return progress;
}

export function saveProgress(progress: Progress, storage: GameStorage): void {
  storage.write(KEY, progress);
}

export function levelProgress(progress: Progress, id: string): LevelProgress {
  return (progress.levels[id] ??= { done: false, sparkle: false });
}

/** Records a solved Level. Returns true if this solve earned its Sparkle for the first time. */
export function recordSolve(progress: Progress, level: Level, moves: number): boolean {
  const entry = levelProgress(progress, level.id);
  const fresh = moves <= level.par && !entry.sparkle;
  entry.done = true;
  entry.sparkle ||= moves <= level.par;
  entry.bestMoves = Math.min(entry.bestMoves ?? Infinity, moves);
  delete entry.inProgress;
  return fresh;
}

export function recordPoolSolve(progress: Progress, pack: number, puzzle: PoolPuzzle, moves: number): void {
  if (moves <= puzzle[1]) progress.poolSparkles[pack] = (progress.poolSparkles[pack] ?? 0) + 1;
}

export function packLevels(levels: readonly Level[], pack: number): Level[] {
  return levels.filter((l) => l.pack === pack);
}

export function packStats(progress: Progress, levels: readonly Level[], pack: number) {
  const inPack = packLevels(levels, pack);
  return {
    done: inPack.filter((l) => progress.levels[l.id]?.done).length,
    sparkles: inPack.filter((l) => progress.levels[l.id]?.sparkle).length + (progress.poolSparkles[pack] ?? 0),
  };
}

/**
 * How many Packs the child sees. The bonus Pack is last, and shows only while its Grown-up Corner switch
 * or "Every level open" is on. Which Levels are open is the site's rule (ADR 0009), worked out from `levels`.
 */
export function shownPacks(progress: Progress): number {
  return progress.grownUp || progress.unlockAll ? GROWN_UP_PACK : GROWN_UP_PACK - 1;
}

/** Where Next goes: the next Level in its Pack, else the next shown Pack's first (always open), else undefined. */
export function levelAfter(progress: Progress, levels: readonly Level[], level: Level): Level | undefined {
  const sizes = Array.from({ length: shownPacks(progress) }, (_, i) => packLevels(levels, i + 1).length);
  const to = nextLevel(sizes, level.pack - 1, level.index - 1);
  return to && packLevels(levels, to.group + 1)[to.level];
}

/**
 * A random Pool puzzle he hasn't been served yet. Once the whole Pool has been seen,
 * it starts over.
 */
export function takePoolPuzzle(progress: Progress, pack: number, pool: readonly PoolPuzzle[], random = Math.random): PoolPuzzle {
  let seen = new Set(progress.poolSeen[pack] ?? []);
  let fresh = pool.filter(([board]) => !seen.has(board));
  if (fresh.length === 0) {
    seen = new Set();
    fresh = [...pool];
  }
  const puzzle = fresh[Math.floor(random() * fresh.length)]!;
  progress.poolSeen[pack] = [...seen, puzzle[0]];
  return puzzle;
}
