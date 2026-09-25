// The Categories, in Shelf order on the Hub. A site list: no Game owns a Shelf.

export type CategoryId = 'math' | 'reading' | 'logic' | 'strategy';

export interface Category {
  id: CategoryId;
  name: string;
  /** Shelf colour. */
  color: string;
  /** Emoji shown beside the shelf name, so pre-readers can tell shelves apart. */
  icon: string;
}

/** Shelf order on the hub. Shelves with no On Games are left out. */
export const CATEGORIES: readonly Category[] = [
  { id: 'math', name: 'Math', color: '#ff8a3d', icon: '🔢' },
  { id: 'reading', name: 'Reading & Writing', color: '#7a6cf0', icon: '🔤' },
  { id: 'logic', name: 'Logic', color: '#2fa36b', icon: '🧩' },
  { id: 'strategy', name: 'Strategy', color: '#e0457b', icon: '♟️' },
];
