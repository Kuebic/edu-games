import type { GrownUpCorner } from '@shared/grownup';
import type { Progress } from './progress';

/** What every screen gets: the page, the Saved progress, and the ways to the other screens. */
export interface App {
  root: HTMLElement;
  progress: Progress;
  /** The level select: the Box list, or with `box` that Box's Rounds. */
  boxes(box?: number): void;
  /** Play one Round of a Box. Both count from 0. */
  play(box: number, round: number): void;
  /** The Grown-up Corner, over whatever screen is showing. */
  corner: GrownUpCorner;
}
