// Every game on the site. Adding a game: add its entry here, its page at
// <slug>/index.html, and its code under games/<slug>/src/.

export type CategoryId = 'math' | 'reading' | 'logic' | 'strategy';

export interface Category {
  id: CategoryId;
  name: string;
  /** Shelf colour. */
  color: string;
  /** Emoji shown beside the shelf name, so pre-readers can tell shelves apart. */
  icon: string;
}

export interface Game {
  slug: string;
  name: string;
  category: CategoryId;
  /** Tile picture, relative to the site root. */
  icon: string;
}

/** Shelf order on the hub. Shelves without games are hidden. */
export const CATEGORIES: readonly Category[] = [
  { id: 'math', name: 'Math', color: '#ff8a3d', icon: '🔢' },
  { id: 'reading', name: 'Reading & Writing', color: '#7a6cf0', icon: '🔤' },
  { id: 'logic', name: 'Logic', color: '#2fa36b', icon: '🧩' },
  { id: 'strategy', name: 'Strategy', color: '#e0457b', icon: '♟️' },
];

export const GAMES: readonly Game[] = [
  { slug: 'snack-math', name: 'Snack Math', category: 'math', icon: 'snack-math/icon.svg' },
  { slug: 'push-pals', name: 'Push Pals', category: 'logic', icon: 'push-pals/icon.png' },
  { slug: 'traffic-jam', name: 'Traffic Jam', category: 'logic', icon: 'traffic-jam/icon.svg' },
  { slug: 'robot-path', name: 'Robot Path', category: 'logic', icon: 'robot-path/icon.svg' },
  { slug: 'way-out', name: 'Way Out', category: 'logic', icon: 'way-out/icon.svg' },
];
