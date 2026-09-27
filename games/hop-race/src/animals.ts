// The animals: the Hopper a child picks, and a Friend for each Race. Faces only, so none of them looks
// the wrong way down the Track on any phone.

export interface Animal {
  /** What the Voice calls it. */
  name: string;
  /** Its picture. */
  face: string;
  /** The colour behind it on its chip and its button. */
  colour: string;
}

/** The Hoppers, in chip order. Their ids are saved, so they never change. */
export const HOPPERS = {
  bunny: { name: 'Bunny', face: '🐰', colour: '#ffd6e2' },
  puppy: { name: 'Puppy', face: '🐶', colour: '#ffe2b8' },
  kitty: { name: 'Kitty', face: '🐱', colour: '#fff0a8' },
  bear: { name: 'Bear', face: '🐻', colour: '#e8d5c4' },
} as const satisfies Record<string, Animal>;

export type HopperId = keyof typeof HOPPERS;

export const HOPPER_IDS = Object.keys(HOPPERS) as HopperId[];

export const isHopper = (id: unknown): id is HopperId => typeof id === 'string' && Object.hasOwn(HOPPERS, id);

/** The Friends, one per Race in turn (race.ts's friendFor). */
export const FRIENDS: readonly Animal[] = [
  { name: 'Frog', face: '🐸', colour: '#c9f0b8' },
  { name: 'Mouse', face: '🐭', colour: '#e3e3ef' },
  { name: 'Pig', face: '🐷', colour: '#ffd3d8' },
  { name: 'Monkey', face: '🐵', colour: '#ecd9c0' },
  { name: 'Panda', face: '🐼', colour: '#e4ecf2' },
  { name: 'Lion', face: '🦁', colour: '#ffe1a0' },
];
