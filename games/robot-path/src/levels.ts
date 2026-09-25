// Every Level, from the hand-made files in levels/ (one per World). `levels.test.ts`
// checks each one with the level validator, so the game can trust their shape.

import type { Level } from './game/level';
import world1 from './levels/world-1.json';
import world2 from './levels/world-2.json';
import world3 from './levels/world-3.json';
import world4 from './levels/world-4.json';
import world5 from './levels/world-5.json';
import world6 from './levels/world-6.json';
import world7 from './levels/world-7.json';
import world8 from './levels/world-8.json';

export interface World {
  name: string;
  color: string;
  levels: Level[];
}

export const WORLDS: readonly World[] = [
  { name: 'Arrows', color: '#2f9be0', levels: world1 as Level[] },
  { name: 'Collectors', color: '#e0457b', levels: world2 as Level[] },
  { name: 'Twisty paths', color: '#0e9fb3', levels: world3 as Level[] },
  { name: 'Mazes', color: '#b7860b', levels: world4 as Level[] },
  { name: 'Big mazes', color: '#a0522d', levels: world5 as Level[] },
  { name: 'Repeat', color: '#9b5cf6', levels: world6 as Level[] },
  { name: 'Fix-it', color: '#f28c28', levels: world7 as Level[] },
  { name: 'Turn and go', color: '#16a37f', levels: world8 as Level[] },
];

export const LEVELS_PER_WORLD = 8;

/** Worlds and Levels are numbered from 1 in the files, from 0 here. */
export function levelAt(world: number, index: number): Level {
  return WORLDS[world]!.levels[index]!;
}
