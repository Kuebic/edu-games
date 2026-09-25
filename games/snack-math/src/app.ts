import type { Save } from './progress';

/** What every screen gets: the page, the save, and the ways to the other screens. */
export interface App {
  root: HTMLElement;
  save: Save;
  persist(): void;
  /** Home: the Stage list, or with `stage` that Stage's Rounds. */
  home(stage?: number): void;
  /** Play one Round of a Stage. Both count from 0. */
  play(stage: number, round: number): void;
  stickers(): void;
  grownup(): void;
}

/** Renders into `app.root`; may return a cleanup to run when leaving the screen. */
export type Screen = (app: App) => (() => void) | void;
