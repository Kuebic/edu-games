import type { GrownUpCorner } from '@shared/grownup';
import type { Progress } from './progress';

/** What every screen gets: the page, the Saved progress, and the ways to the other screens. */
export interface App {
  root: HTMLElement;
  progress: Progress;
  /** The level select: the Track list, or with `track` that Track's Races. */
  groups(track?: number): void;
  /** Play one Race of a Track. Both count from 0. */
  play(track: number, race: number): void;
  /** The Grown-up Corner, over whatever screen is showing. */
  corner: GrownUpCorner;
}
