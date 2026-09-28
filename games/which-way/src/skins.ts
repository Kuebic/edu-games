// What the Mover is: a Skin, picked from the chips on Practice (the site's ADR 0015). It changes the Mover,
// its Treat and their sounds, never the Trips.

export type Skin = 'puppy' | 'ball' | 'car';

/** The Skins in chip order, the puppy first. */
export const SKINS: readonly Skin[] = ['puppy', 'ball', 'car'];

export interface SkinLook {
  /** For screen readers, and the chip. */
  name: string;
  /** The Mover as an emoji. The car is drawn instead, so it can turn. */
  emoji?: string;
  /** The Treat's emoji. */
  treat: string;
  /** What the Voice calls the Treat ("Which way to the bone?"). */
  treatWord: string;
  /** The chip's colour, behind its picture, and the field's. */
  colour: string;
}

export const SKIN_LOOKS: Readonly<Record<Skin, SkinLook>> = {
  puppy: { name: 'Puppy', emoji: '🐶', treat: '🦴', treatWord: 'the bone', colour: '#c8ecb6' },
  ball: { name: 'Ball', emoji: '⚽', treat: '🥅', treatWord: 'the goal', colour: '#bfe6f7' },
  car: { name: 'Car', treat: '⛽', treatWord: 'the fuel pump', colour: '#e3e6ec' },
};

export const isSkin = (raw: unknown): raw is Skin => SKINS.includes(raw as Skin);
