// What's saved on the device, on the site's Saved progress (ADR 0012): Levels done and Sparkles are
// the site's; the Skin, the Speed and each Level's Draft are Robot Path's own.

import { openProgress, type Progress as SiteProgress } from '@shared/progress';
import type { GameStorage } from '@shared/storage';
import type { Program } from './game/level';
import { WORLDS } from './levels';

export const SKINS = ['garden', 'planet', 'sea'] as const;
export type SkinId = (typeof SKINS)[number];
export const SPEEDS = ['slow', 'normal', 'fast'] as const;
export type Speed = (typeof SPEEDS)[number];

/** What only Robot Path saves. */
export interface Save {
  skin: SkinId;
  speed: Speed;
  /** The Program in the bar when he last left each Level, by Level id, so his work is still there. */
  drafts: Record<string, Program>;
}

export type Progress = SiteProgress<Save>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Version 2 put three maze Worlds in as worlds 3-5, so version 1's worlds 3-5 are now 6-8. */
function levelIdNow(id: string, version: unknown): string {
  const old = /^w([3-5])-(\d+)$/.exec(id);
  return version === 1 && old ? `w${Number(old[1]) + 3}-${old[2]}` : id;
}

/** A Level's World and place from its id, "w1-01": both count from 1 in the files, from 0 here. */
function placeOf(id: string): { group: number; level: number } | undefined {
  const m = /^w(\d+)-(\d+)$/.exec(id);
  return m ? { group: Number(m[1]) - 1, level: Number(m[2]) - 1 } : undefined;
}

/** Saved as "robot-path:v1": the shell puts the Slug in front. */
export function loadProgress(storage: GameStorage): Progress {
  return openProgress(storage, {
    key: 'v1',
    sizes: WORLDS.map((w) => w.levels.length),
    sparkles: true,
    game: {
      read(raw) {
        const r = isRecord(raw) ? raw : {};
        const drafts: Record<string, Program> = {};
        if (isRecord(r.drafts)) for (const [id, draft] of Object.entries(r.drafts)) if (Array.isArray(draft)) drafts[id] = draft as Program;
        return {
          skin: SKINS.includes(r.skin as SkinId) ? (r.skin as SkinId) : 'garden',
          speed: SPEEDS.includes(r.speed as Speed) ? (r.speed as Speed) : 'normal',
          drafts,
        };
      },
      reset(save) {
        save.drafts = {};
      },
    },
    // Before ADR 0012: { version, skin, levels: { 'w1-01': { done, sparkle, draft } }, settings: { sound, voice, speed }, unlockAll }.
    legacy(saved) {
      const done: Record<string, number[]> = {};
      const sparkle: Record<string, number[]> = {};
      const drafts: Record<string, unknown> = {};
      if (isRecord(saved.levels)) {
        for (const [id, level] of Object.entries(saved.levels)) {
          if (!isRecord(level)) continue;
          const now = levelIdNow(id, saved.version);
          const at = placeOf(now);
          if (!at) continue;
          if (level.done === true) (done[at.group] ??= []).push(at.level);
          if (level.sparkle === true) (sparkle[at.group] ??= []).push(at.level);
          if (Array.isArray(level.draft)) drafts[now] = level.draft;
        }
      }
      const settings = isRecord(saved.settings) ? saved.settings : {};
      return {
        done,
        sparkle,
        settings: { sound: settings.sound !== false, voice: settings.voice !== false, everyLevelOpen: saved.unlockAll === true },
        game: { skin: saved.skin, speed: settings.speed, drafts },
      };
    },
  });
}

/** A change to a Level's Program: kept as his Draft. */
export function saveDraft(progress: Progress, id: string, draft: Program): void {
  progress.game.drafts[id] = draft;
  progress.save();
}

/**
 * Where Next goes after a win: the next Level in the World, else the next World's first (every World
 * is open, ADR 0009), else undefined after the very last. Worlds and Levels count from 0.
 */
export function levelAfter(progress: Progress, world: number, index: number): { world: number; index: number } | undefined {
  const to = progress.after(world, index);
  return to && { world: to.group, index: to.level };
}
