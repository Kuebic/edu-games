// What Hop Race remembers, on the site's Saved progress (ADR 0012): which Races of each Track are done,
// and in its own slot the Hopper the child picked.

import { openProgress, type Progress as SiteProgress } from '@shared/progress';
import type { GameStorage } from '@shared/storage';
import { isHopper, type HopperId } from './animals';
import { TRACKS } from './race';

/** What only Hop Race saves. The Hopper is a Skin, so a reset leaves it. */
export interface Save {
  hopper: HopperId;
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
        const hopper = isRecord(raw) ? raw.hopper : undefined;
        return { hopper: isHopper(hopper) ? hopper : 'bunny' };
      },
    },
  });
}

/** Saves the Hopper a child picked from the chips. */
export function setHopper(progress: Progress, hopper: HopperId): void {
  progress.game.hopper = hopper;
  progress.save();
}
