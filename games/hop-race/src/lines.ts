// What the Voice says. Numbers are said as numerals, which every speech engine reads as the number.

import type { Spin } from './race';

export const startLine = (hopper: string, friend: string, home: number) => `${hopper} and ${friend} are racing to ${home}!`;

export const SPIN = 'Spin!';
export const HOP = 'Hop!';

export const spunLine = (spin: Spin) => (spin === 1 ? 'One hop!' : 'Two hops!');

/** A Hop lands: the Square's number, the way the study had children say it. */
export const squareLine = (square: number) => String(square);

export const friendTurnLine = (friend: string) => `${friend}'s turn.`;

export const friendHomeLine = (friend: string) => `${friend} is home! Keep hopping!`;

export const AHEAD = 'Who is ahead?';

/** The right one picked: where both are, and that its number is more. */
export const aheadRightLine = (name: string, at: number, other: number) => `Yes! ${name} is on ${at}. ${at} is more than ${other}.`;

/** The other one picked, before it fades away. */
export const aheadFadeLine = (name: string, at: number) => `${name} is on ${at}.`;

export const HOME = "You're home! Well done!";
