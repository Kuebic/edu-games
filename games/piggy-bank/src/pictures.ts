// The Money's photos, heads and tails, found by file name in assets/pictures/ (made by the pictures task,
// credited in docs/credits.md).

import type { Money, Side } from './money';

/** Each picture's URL by its name: dime-tails.webp is "dime-tails". */
export function picturesByName(files: Readonly<Record<string, string>>): Map<string, string> {
  return new Map(Object.entries(files).map(([path, url]) => [/([a-z]+-[a-z]+)\.webp$/.exec(path)![1]!, url]));
}

// Imported like any file (ADR 0005), so the build hashes each one and ships only what's there.
const files = import.meta.glob<string>('./assets/pictures/*.webp', { eager: true, query: '?url', import: 'default' });
const pictures = picturesByName(files);

/** A side's photo URL, or '' when it's missing (a test fails that). */
export const picture = (money: Money, side: Side = 'heads'): string => pictures.get(`${money}-${side}`) ?? '';
