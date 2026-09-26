// What My Letter remembers, on the site's Saved progress (ADR 0012): which Levels of each Group are done,
// and its own slot: the Name a grown-up typed, and whether they closed the Corner without one.

import { openProgress, type Progress as SiteProgress } from '@shared/progress';
import type { GameStorage } from '@shared/storage';
import { GROUP_NAMES, MY_NAME, levelLetters, nameLetters } from './letters';

/** What only My Letter saves. Both are settings, so a reset leaves them. */
export interface Save {
  /** The child's first name as typed, trimmed. Empty for none. */
  name: string;
  /** A grown-up closed the Corner without a Name, so it doesn't open by itself again. */
  skipped: boolean;
}

export type Progress = SiteProgress<Save>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Saved as "my-letter:v1": the shell puts the Slug in front. */
export function loadProgress(storage: GameStorage): Progress {
  const progress: Progress = openProgress(storage, {
    key: 'v1',
    // My name has a Level per Name letter, none without a Name; it keeps its place, so New letters never moves.
    sizes: () => GROUP_NAMES.map((_, group) => levelLetters(progress.game.name, group).length),
    game: {
      read(raw) {
        const r = isRecord(raw) ? raw : {};
        return { name: typeof r.name === 'string' ? r.name.trim() : '', skipped: r.skipped === true };
      },
    },
  });
  return progress;
}

/** There's a Name with letters in it, so My name has Levels. */
export const hasName = (progress: Progress) => nameLetters(progress.game.name).length > 0;

/**
 * Saves a Name typed in the Corner. A Name with different letters starts My name fresh (ADR 0002); New letters
 * stays. Says whether it did, since a My name Level being played is then about letters that have gone.
 */
export function setName(progress: Progress, typed: string): boolean {
  const name = typed.trim();
  const fresh = nameLetters(name).join('') !== nameLetters(progress.game.name).join('');
  if (fresh) progress.forget(MY_NAME);
  progress.game.name = name;
  progress.save();
  return fresh;
}
