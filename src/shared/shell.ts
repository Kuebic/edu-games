// What every page on the site does when it starts: the Hub calls startPage(), a Game calls startGame().
// A Game imports this before anything else, so the Shared look loads first and the Game's CSS can override it.

import './base.css';
import { registerOffline } from './pwa';
import { deviceStorage, gameStorage, type Backing, type GameStorage } from './storage';

export interface GameOptions {
  /**
   * Called on every touch, before the page sees it. Browsers only start audio and speech
   * after a touch, and may suspend audio again later, so this runs each time, not once.
   */
  unlock?: () => void;
}

export interface GameShell {
  /** The page's #app element. The Game owns everything inside it. */
  root: HTMLElement;
  /** Where the Game keeps its Saved progress, under its Slug. */
  storage: GameStorage;
}

/** What the shell touches. The browser gives the real one; tests pass fakes. */
export interface PageEnv {
  document: EventTarget & Pick<Document, 'querySelector'>;
  storage: Backing | undefined;
  registerOffline: () => void;
}

const browser = (): PageEnv => ({
  document,
  storage: deviceStorage(),
  // The dev server has no service worker to register.
  registerOffline: import.meta.env.PROD ? registerOffline : () => {},
});

/** Starts the Hub, or any page that isn't a Game: #app, offline install, touch guards. */
export function startPage(env: PageEnv = browser()): HTMLElement {
  const root = env.document.querySelector<HTMLElement>('#app');
  if (!root) throw new Error('Game Shelf: this page has no <div id="app">');
  guardTouches(env.document);
  env.registerOffline();
  return root;
}

/**
 * Starts a Game. Call it first thing in the Game's main.ts, with the Game's Slug (its folder name).
 * The Slug names its saved keys, so it must never change once the Game has been On.
 */
export function startGame(slug: string, options: GameOptions = {}, env: PageEnv = browser()): GameShell {
  const root = startPage(env);
  if (options.unlock) env.document.addEventListener('pointerdown', options.unlock, { capture: true });
  return { root, storage: gameStorage(slug, env.storage) };
}

/** Keep stray little fingers from zooming or opening the long-press menu. */
function guardTouches(page: EventTarget): void {
  const block = (event: Event) => event.preventDefault();
  page.addEventListener('contextmenu', block);
  for (const type of ['gesturestart', 'gesturechange']) page.addEventListener(type, block, { passive: false });
  page.addEventListener(
    'touchmove',
    (event) => {
      if ((event as TouchEvent).touches.length > 1) event.preventDefault();
    },
    { passive: false },
  );
}
