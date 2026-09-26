// Push Pals' clips, Kenney's CC0 interface sounds, on the site's Sound. The win is the site's cheer.

import { cheer, clip } from '@shared/sound';
import goalUrl from './assets/sounds/goal.ogg';
import pushUrl from './assets/sounds/push.ogg';
import tapUrl from './assets/sounds/tap.ogg';
import undoUrl from './assets/sounds/undo.ogg';

const CLIPS = { push: clip(pushUrl), goal: clip(goalUrl), undo: clip(undoUrl), tap: clip(tapUrl), win: cheer };

export type Sound = keyof typeof CLIPS;

export function play(name: Sound): void {
  CLIPS[name]();
}
