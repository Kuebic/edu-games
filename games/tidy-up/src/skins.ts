// What the Bins are on Colors: a Skin, picked from the chips on Practice (the site's ADR 0015). It changes
// the Bins and how a Round ends, never the Round. Shapes always sort into the shape-sorter Box.

export type Skin = 'buckets' | 'trucks';

/** The Skins in chip order, the buckets first. */
export const SKINS: readonly Skin[] = ['buckets', 'trucks'];

export const SKIN_NAMES: Readonly<Record<Skin, string>> = { buckets: 'Buckets', trucks: 'Trucks' };

/** Behind the chip's picture. */
export const SKIN_COLOURS: Readonly<Record<Skin, string>> = { buckets: '#dcefff', trucks: '#fff1cc' };

export const isSkin = (raw: unknown): raw is Skin => SKINS.includes(raw as Skin);
