import type { GrownUpCorner } from '@shared/grownup';
import type { Progress } from './progress';

/** What every screen gets: the page, the Saved progress, and the ways to the other screens. */
export interface App {
  root: HTMLElement;
  progress: Progress;
  /** Practice, where a grown-up picks the Way and the Scope. */
  start(): void;
  /** Rounds with the saved picks, until Back. */
  play(): void;
  /** The Grown-up Corner, over whatever screen is showing. */
  corner: GrownUpCorner;
}
