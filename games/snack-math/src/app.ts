import type { GrownUpCorner } from '@shared/grownup';
import type { Progress } from './progress';

/** What every screen gets: the page, the Saved progress, and the ways to the other screens. */
export interface App {
  root: HTMLElement;
  progress: Progress;
  /** The level select: the Stage list, or with `stage` that Stage's Rounds. */
  stages(stage?: number): void;
  /** Play one Round of a Stage. Both count from 0. */
  play(stage: number, round: number): void;
  stickers(): void;
  /** The Grown-up Corner, over whatever screen is showing. */
  corner: GrownUpCorner;
}

/** Renders into `app.root`; may return a cleanup to run when leaving the screen. */
export type Screen = (app: App) => (() => void) | void;
