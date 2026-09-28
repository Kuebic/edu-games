// What the Voice says. Numbers are said as numerals, which every speech engine reads as the number.

import type { Spin } from './race';

export const startLine = (hopper: string, friend: string, home: number) => `${hopper} and ${friend} are racing to ${home}!`;

export const SPIN = 'Spin!';
export const HOP = 'Hop!';

export const spunLine = (spin: Spin) => (spin === 1 ? 'One hop!' : 'Two hops!');

/** A Hop lands: the Square's number, the way the study had children say it. */
export const squareLine = (square: number) => String(square);

/** Whose turn: the Friend's, and with Two players the Hopper's too. */
export const turnLine = (name: string) => `${name}'s turn.`;

/** One animal Home while the other hops on: the Friend, or with Two players either. */
export const homeLine = (name: string) => `${name} is home! Keep hopping!`;

export const AHEAD = 'Who is ahead?';

/** The right one picked: where both are, and that its number is more. */
export const aheadRightLine = (name: string, at: number, other: number) => `Yes! ${name} is on ${at}. ${at} is more than ${other}.`;

/** The other one picked, before it fades away. */
export const aheadFadeLine = (name: string, at: number) => `${name} is on ${at}.`;

export const HOME = "You're home! Well done!";

/** Two players, both Home. */
export const BOTH_HOME = 'Everybody is home! Well done!';
