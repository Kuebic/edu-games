import type { GameStorage } from '@shared/storage';
import { STAGES, type Rng } from './problems';

/** First Tries needed in one Round to move up a Stage. */
export const PROMOTE_AT = 4;

export const STICKERS = [
  '🦄', '🐙', '🦋', '🌈', '🚀', '🦖', '🐢', '🌟',
  '🍭', '🐳', '🦒', '🎈', '🐞', '🌻', '🐧', '🦊',
  '🐸', '🦁', '🍩', '🚂', '🐝', '🦉', '🐬', '🍉',
];

export interface Save {
  stage: number;
  stickers: string[];
  voice: boolean;
  sound: boolean;
  nextFriend: number;
}

/** Saved as "snack-math:v1": the shell puts the Slug in front. */
const KEY = 'v1';

export function defaultSave(): Save {
  return { stage: 0, stickers: [], voice: true, sound: true, nextFriend: 0 };
}

export function nextStage(stage: number, firstTries: number): number {
  if (firstTries >= PROMOTE_AT && stage < STAGES.length - 1) return stage + 1;
  return stage;
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
  if (Array.isArray(r.stickers)) save.stickers = r.stickers.filter((s) => typeof s === 'string');
  if (typeof r.voice === 'boolean') save.voice = r.voice;
  if (typeof r.sound === 'boolean') save.sound = r.sound;
  if (Number.isInteger(r.nextFriend) && (r.nextFriend as number) >= 0) save.nextFriend = r.nextFriend as number;
  return save;
}

export function writeSave(save: Save, storage: GameStorage): void {
  storage.write(KEY, save);
}

