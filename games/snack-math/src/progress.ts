import type { GameStorage } from '@shared/storage';
import { nextLevel } from '@shared/unlock';
import { STAGES, type Rng } from './problems';

/** Every Stage is a Group of this many Rounds (ADR 0003). */
export const ROUNDS_PER_STAGE = 4;

export const STICKERS = [
  '🦄', '🐙', '🦋', '🌈', '🚀', '🦖', '🐢', '🌟',
  '🍭', '🐳', '🦒', '🎈', '🐞', '🌻', '🐧', '🦊',
  '🐸', '🦁', '🍩', '🚂', '🐝', '🦉', '🐬', '🍉',
];

export interface Save {
  /** The Stage last played. */
  stage: number;
  /** How many of each Stage's Rounds are done. They are done in order, so a count says which. */
  rounds: number[];
  stickers: string[];
  voice: boolean;
  sound: boolean;
  nextFriend: number;
}

/** Saved as "snack-math:v1": the shell puts the Slug in front. */
const KEY = 'v1';

export function defaultSave(): Save {
  return { stage: 0, rounds: STAGES.map(() => 0), stickers: [], voice: true, sound: true, nextFriend: 0 };
}

/** Which of a Stage's Rounds are done, in play order. Which are open is the site's rule (ADR 0009). */
export function roundsDone(save: Save, stage: number): boolean[] {
  return Array.from({ length: ROUNDS_PER_STAGE }, (_, round) => round < (save.rounds[stage] ?? 0));
}

/**
 * Marks a Round finished. Returns true the first time this finishes the Stage's last Round,
 * which is when the child hears how good they're getting.
 */
export function finishRound(save: Save, stage: number, round: number): boolean {
  const before = save.rounds[stage] ?? 0;
  save.rounds[stage] = Math.max(before, round + 1);
  return round === ROUNDS_PER_STAGE - 1 && before < ROUNDS_PER_STAGE;
}

/** Where Next goes from a Round: the next one, on into the next Stage, or undefined after the very last. */
export function roundAfter(stage: number, round: number): { stage: number; round: number } | undefined {
  const to = nextLevel(STAGES.map(() => ROUNDS_PER_STAGE), stage, round);
  return to && { stage: to.group, round: to.level };
}

/** A Sticker the child doesn't have yet; once all are owned, any Sticker. */
export function pickSticker(owned: readonly string[], rng: Rng = Math.random): string {
  const fresh = STICKERS.filter((s) => !owned.includes(s));
  const pool = fresh.length > 0 ? fresh : STICKERS;
  return pool[Math.floor(rng() * pool.length)];
}

export function loadSave(storage: GameStorage): Save {
  const save = defaultSave();
  const raw = storage.read(KEY);
  if (!raw || typeof raw !== 'object') return save;
  const r = raw as Record<string, unknown>;
  if (Number.isInteger(r.stage) && (r.stage as number) >= 0 && (r.stage as number) < STAGES.length) {
    save.stage = r.stage as number;
  }
  if (!('rounds' in r)) {
    // Saved before Stages were Groups, when a child moved up by playing: the Stages below theirs count as done.
    save.rounds = STAGES.map((_, s) => (s < save.stage ? ROUNDS_PER_STAGE : 0));
  } else if (Array.isArray(r.rounds)) {
    const saved = r.rounds as unknown[];
    save.rounds = STAGES.map((_, s) => {
      const n = saved[s];
      return Number.isInteger(n) && (n as number) >= 0 ? Math.min(n as number, ROUNDS_PER_STAGE) : 0;
    });
  }
  if (Array.isArray(r.stickers)) save.stickers = r.stickers.filter((s) => typeof s === 'string');
  if (typeof r.voice === 'boolean') save.voice = r.voice;
  if (typeof r.sound === 'boolean') save.sound = r.sound;
  if (Number.isInteger(r.nextFriend) && (r.nextFriend as number) >= 0) save.nextFriend = r.nextFriend as number;
  return save;
}

export function writeSave(save: Save, storage: GameStorage): void {
  storage.write(KEY, save);
}

