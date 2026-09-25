import type { Save } from './progress';

export type ScreenName = 'home' | 'play' | 'stickers' | 'grownup';

export interface App {
  root: HTMLElement;
  save: Save;
  persist(): void;
  go(screen: ScreenName): void;
}

/** Renders into `app.root`; may return a cleanup to run when leaving the screen. */
export type Screen = (app: App) => (() => void) | void;
