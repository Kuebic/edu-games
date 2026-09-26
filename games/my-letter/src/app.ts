import type { GrownUpCorner } from '@shared/grownup';
import type { Progress } from './progress';

/** What every screen gets: the page, the Saved progress, and the ways to the other screens. */
export interface App {
  root: HTMLElement;
  progress: Progress;
  /** The level select: the Group list, or with `group` that Group's Levels. */
  groups(group?: number): void;
  /** Play one Level of a Group. Both count from 0. */
  play(group: number, level: number): void;
  /** The Letter board: every letter, to tap and hear. */
  board(): void;
  /** The Grown-up Corner, over whatever screen is showing. */
  corner: GrownUpCorner;
}
