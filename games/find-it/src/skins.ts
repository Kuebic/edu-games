// What the beans on a Tray are: a Skin, picked from the chips on Practice's Numbers (ADR 0006). It changes
// how the beans look and what the Voice calls them, never the Finds.

export type Skin = 'bean' | 'jellybean' | 'ladybug' | 'star' | 'strawberry';

/** The Skins in chip order, beans first. */
export const SKINS: readonly Skin[] = ['bean', 'jellybean', 'ladybug', 'star', 'strawberry'];

export interface SkinLook {
  /** What the Voice calls one of them ("ladybug"). */
  one: string;
  /** And more than one ("ladybugs"). */
  many: string;
  /** The emoji each is drawn as. Beans and jellybeans are drawn in CSS. */
  emoji?: string;
  /** The chip's colour, behind its picture. */
  colour: string;
}

export const SKIN_LOOKS: Readonly<Record<Skin, SkinLook>> = {
  bean: { one: 'bean', many: 'beans', colour: '#f6dfbd' },
  jellybean: { one: 'jellybean', many: 'jellybeans', colour: '#ffd3e6' },
  ladybug: { one: 'ladybug', many: 'ladybugs', emoji: '🐞', colour: '#c8ecb6' },
  star: { one: 'star', many: 'stars', emoji: '⭐', colour: '#4a5aa8' },
  strawberry: { one: 'strawberry', many: 'strawberries', emoji: '🍓', colour: '#fff0c4' },
};

/** Jellybean colours, light then dark: cherry, orange, lemon, lime, grape, bubblegum. */
export const JELLY: readonly (readonly [string, string])[] = [
  ['#ff7a7a', '#d62f3c'],
  ['#ffb35c', '#e8741c'],
  ['#fff08a', '#e3bd1b'],
  ['#9be26a', '#4fa82e'],
  ['#c49bff', '#7a4fd6'],
  ['#ffa6d2', '#e2549b'],
];

/** How many, as the Voice says it: "1 ladybug", "7 strawberries". */
export const counted = (skin: Skin, n: number): string => `${n} ${n === 1 ? SKIN_LOOKS[skin].one : SKIN_LOOKS[skin].many}`;

export const isSkin = (raw: unknown): raw is Skin => SKINS.includes(raw as Skin);
