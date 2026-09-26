// What every screen can reach: the Saved progress, the Skin, and the way to other screens.

import { GROWN_UP_PACK, type Level } from './packs';
import type { Progress } from './progress';
import type { Skin } from './skins';

export interface App {
  root: HTMLElement;
  progress: Progress;
  skin(): Skin;
  home(): void;
  pack(pack: number): void;
  level(level: Level): void;
  /** "More like this": a random Pool puzzle from the Pack. */
  pool(pack: number): void;
  /** The grown-up menu, over whatever screen is showing. */
  parent(): void;
}

const PACK_COLORS = ['#2fa36b', '#2f9be0', '#ff8a3d', '#9b5cf6', '#e0457b', '#475569'];

export function packColor(pack: number): string {
  return PACK_COLORS[(pack - 1) % PACK_COLORS.length]!;
}

/** A Pack's picture: one little car for Pack 1, up to five for Pack 5, a star for the bonus Pack. */
export function packIcon(pack: number): string {
  if (pack === GROWN_UP_PACK) {
    return '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 5l5.6 11.8 12.9 1.6-9.5 8.9 2.5 12.8L24 33.8l-11.5 6.3 2.5-12.8-9.5-8.9 12.9-1.6Z" fill="#fff"/></svg>';
  }
  const cars = Array.from({ length: pack }, (_, i) => {
    const x = 24 - (pack * 9) / 2 + i * 9;
    return `<rect x="${x + 1}" y="14" width="7" height="20" rx="2.5" fill="#fff"/>`;
  }).join('');
  return `<svg viewBox="0 0 48 48" aria-hidden="true">${cars}</svg>`;
}
