// What Hop Race remembers, on the site's Saved progress (ADR 0012): which Races of each Track are done,
// and in its own slot the Hopper the child picked and whether they race One or Two players.

import { openProgress, type Progress as SiteProgress } from '@shared/progress';
import type { GameStorage } from '@shared/storage';
import { isHopper, type HopperId } from './animals';
import { TRACKS, type Players } from './race';

/** What only Hop Race saves. Both are picks on the first screen, so a reset leaves them. */
export interface Save {
  hopper: HopperId;
  players: Players;
}

export type Progress = SiteProgress<Save>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Saved as "hop-race:v1": the shell puts the Slug in front. */
export function loadProgress(storage: GameStorage): Progress {
  return openProgress(storage, {
    key: 'v1',
    sizes: TRACKS.map((t) => t.races),
    game: {
      read(raw) {
        const r = isRecord(raw) ? raw : {};
        return { hopper: isHopper(r.hopper) ? r.hopper : 'bunny', players: r.players === 2 ? 2 : 1 };
      },
    },
  });
}

/** Saves the Hopper a child picked from the chips. */
export function setHopper(progress: Progress, hopper: HopperId): void {
  progress.game.hopper = hopper;
  progress.save();
}

/** Saves One or Two players, picked under the Tracks. */
export function setPlayers(progress: Progress, players: Players): void {
  progress.game.players = players;
  progress.save();
}
