// What the child has done, on the site's Saved progress (ADR 0012): Levels done and Sparkles are the
// site's; the Skin, each Level's best and where he left off, the Pool and the bonus Pack are Way Out's own.

import { openProgress, type Progress as SiteProgress } from '@shared/progress';
import type { GameStorage } from '@shared/storage';
import type { Board } from './game/board';
import { GROWN_UP_PACK, LEVELS_PER_PACK, type Level, type PoolPuzzle } from './packs';
import type { SkinId } from './skins';

/** The board and Move count at one point, for Undo. */
export interface Snapshot {
  board: Board;
  moves: number;
}

export interface InProgress extends Snapshot {
  /** Earlier Snapshots, oldest first. */
  history: Snapshot[];
}

/** What only Way Out saves about a Level. */
export interface LevelSave {
  bestMoves?: number;
  /** Where he left off, so coming back picks up there. */
  inProgress?: InProgress;
}

/** What only Way Out saves. */
export interface Save {
  skin: SkinId;
  levels: Record<string, LevelSave>;
  /** Pool boards already served, per Pack, so "more like this" doesn't repeat until they run out. */
  poolSeen: Record<string, Board[]>;
  /** Sparkles earned on Pool puzzles, per Pack. */
  poolSparkles: Record<string, number>;
  /** The bonus Pack is showing. */
  grownUp: boolean;
}

export type Progress = SiteProgress<Save>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isSnapshot = (s: unknown): s is Snapshot => isRecord(s) && typeof s.board === 'string' && typeof s.moves === 'number';

/** A Level's Pack and place from its id, "p1-01": both count from 1 in the files, from 0 in the site's marks. */
function placeOf(id: string): { group: number; level: number } | undefined {
  const m = /^p(\d+)-(\d+)$/.exec(id);
  return m ? { group: Number(m[1]) - 1, level: Number(m[2]) - 1 } : undefined;
}

function readLevel(raw: unknown): LevelSave | undefined {
  if (!isRecord(raw)) return undefined;
  const entry: LevelSave = {};
  if (typeof raw.bestMoves === 'number') entry.bestMoves = raw.bestMoves;
  const at = raw.inProgress;
  if (isRecord(at) && isSnapshot(at) && Array.isArray(at.history)) {
    entry.inProgress = { board: at.board, moves: at.moves, history: at.history.filter(isSnapshot) };
  }
  return Object.keys(entry).length ? entry : undefined;
}

/** A whole slot from whatever was saved, keeping the parts that make sense. */
function readSave(raw: unknown): Save {
  const r = isRecord(raw) ? raw : {};
  const save: Save = { skin: 'city', levels: {}, poolSeen: {}, poolSparkles: {}, grownUp: r.grownUp === true };
  if (r.skin === 'city' || r.skin === 'farm' || r.skin === 'space') save.skin = r.skin;
  if (isRecord(r.levels)) {
    for (const [id, level] of Object.entries(r.levels)) {
      const entry = readLevel(level);
      if (entry) save.levels[id] = entry;
    }
  }
  if (isRecord(r.poolSeen)) {
    for (const [pack, seen] of Object.entries(r.poolSeen)) {
      if (Array.isArray(seen)) save.poolSeen[pack] = seen.filter((b): b is string => typeof b === 'string');
    }
  }
  if (isRecord(r.poolSparkles)) {
    for (const [pack, count] of Object.entries(r.poolSparkles)) {
      if (typeof count === 'number') save.poolSparkles[pack] = count;
    }
  }
  return save;
}

/** Saved as "way-out:v1": the shell puts the Slug in front. */
export function loadProgress(storage: GameStorage): Progress {
  const progress: Progress = openProgress(storage, {
    key: 'v1',
    // The bonus Pack comes and goes with its switch, so Next and the marks ask each time.
    sizes: () => Array.from({ length: shownPacks(progress) }, () => LEVELS_PER_PACK),
    sparkles: true,
    game: {
      read: readSave,
      reset(save) {
        save.levels = {};
        save.poolSeen = {};
        save.poolSparkles = {};
      },
    },
    // Before ADR 0012: { version, skin, levels: { 'p1-01': { done, sparkle, bestMoves, inProgress } }, poolSeen, poolSparkles, settings, unlockAll, grownUp }.
    legacy(saved) {
      const done: Record<string, number[]> = {};
      const sparkle: Record<string, number[]> = {};
      if (isRecord(saved.levels)) {
        for (const [id, level] of Object.entries(saved.levels)) {
          const at = placeOf(id);
          if (!at || !isRecord(level)) continue;
          if (level.done === true) (done[at.group] ??= []).push(at.level);
          if (level.sparkle === true) (sparkle[at.group] ??= []).push(at.level);
        }
      }
      const settings = isRecord(saved.settings) ? saved.settings : {};
      return {
        done,
        sparkle,
        settings: { sound: settings.sound !== false, voice: settings.voice !== false, everyLevelOpen: saved.unlockAll === true },
        game: saved,
      };
    },
  });
  return progress;
}

/** Way Out's own record of a Level, made if there is none yet. */
export function levelSave(progress: Progress, id: string): LevelSave {
  return (progress.game.levels[id] ??= {});
}

/** Records a solved Level. Returns true if this solve earned its Sparkle for the first time. */
export function recordSolve(progress: Progress, level: Level, moves: number): boolean {
  const entry = levelSave(progress, level.id);
  entry.bestMoves = Math.min(entry.bestMoves ?? Infinity, moves);
  delete entry.inProgress;
  return progress.finish(level.pack - 1, level.index - 1, moves <= level.par).sparkle;
}

export function recordPoolSolve(progress: Progress, pack: number, puzzle: PoolPuzzle, moves: number): void {
  if (moves <= puzzle[1]) progress.game.poolSparkles[pack] = (progress.game.poolSparkles[pack] ?? 0) + 1;
  progress.save();
}

export function packLevels(levels: readonly Level[], pack: number): Level[] {
  return levels.filter((l) => l.pack === pack);
}

/** A Pack's Sparkles: its Levels' and its Pool's. */
export function packSparkles(progress: Progress, pack: number): number {
  return progress.marks(pack - 1).filter((m) => m.sparkle).length + (progress.game.poolSparkles[pack] ?? 0);
}

/**
 * How many Packs the child sees. The bonus Pack is last, and shows only while its Grown-up Corner switch
 * or "Every level open" is on. Which Levels are open is the site's rule (ADR 0009).
 */
export function shownPacks(progress: Progress): number {
  return progress.game.grownUp || progress.settings.everyLevelOpen ? GROWN_UP_PACK : GROWN_UP_PACK - 1;
}

/** Where Next goes: the next Level in its Pack, else the next shown Pack's first (always open), else undefined. */
export function levelAfter(progress: Progress, levels: readonly Level[], level: Level): Level | undefined {
  const to = progress.after(level.pack - 1, level.index - 1);
  return to && packLevels(levels, to.group + 1)[to.level];
}

/**
 * A random Pool puzzle he hasn't been served yet. Once the whole Pool has been seen,
 * it starts over. Saves.
 */
export function takePoolPuzzle(progress: Progress, pack: number, pool: readonly PoolPuzzle[], random = Math.random): PoolPuzzle {
  let seen = new Set(progress.game.poolSeen[pack] ?? []);
  let fresh = pool.filter(([board]) => !seen.has(board));
  if (fresh.length === 0) {
    seen = new Set();
    fresh = [...pool];
  }
  const puzzle = fresh[Math.floor(random() * fresh.length)]!;
  progress.game.poolSeen[pack] = [...seen, puzzle[0]];
  progress.save();
  return puzzle;
}
