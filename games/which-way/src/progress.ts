// What Which Way? remembers, on the site's Saved progress (ADR 0012). Practice has no Levels, so there's
// nothing done to keep; its own slot holds the picks: the Way, the Scope and the Skin.

import { openProgress, type Progress as SiteProgress } from '@shared/progress';
import type { GameStorage } from '@shared/storage';
import { isSkin, type Skin } from './skins';
import { ARROWS, RANGES, WAYS, type Arrow, type Way } from './trips';

/** What only Which Way? saves. All of it is a setting. */
export interface Save {
  way: Way;
  /** The Arrows that come up, in ARROWS order. May be empty. */
  scope: Arrow[];
  skin: Skin;
}

export type Progress = SiteProgress<Save>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Saved as "which-way:v1": the shell puts the Slug in front. A new save starts on Watch, ←→ and the puppy. */
export function loadProgress(storage: GameStorage): Progress {
  return openProgress(storage, {
    key: 'v1',
    sizes: [],
    game: {
      read(raw) {
        const r = isRecord(raw) ? raw : {};
        const scope = r.scope;
        return {
          way: WAYS.includes(r.way as Way) ? (r.way as Way) : 'watch',
          scope: Array.isArray(scope) ? ARROWS.filter((a) => scope.includes(a)) : [...RANGES[0]!],
          skin: isSkin(r.skin) ? r.skin : 'puppy',
        };
      },
    },
  });
}
