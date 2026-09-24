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

const KEY = 'snack-math:v1';

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

type Storage = Pick<globalThis.Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function loadSave(storage: Storage): Save {
  const save = defaultSave();
  let raw: unknown;
  try {
    raw = JSON.parse(storage.getItem(KEY) ?? 'null');
  } catch {
    return save;
  }
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

export function writeSave(save: Save, storage: Storage): void {
  try {
    storage.setItem(KEY, JSON.stringify(save));
  } catch {
    // Private mode or full storage: progress just won't persist.
  }
}

