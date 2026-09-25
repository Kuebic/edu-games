// Which Levels a child may open, and where Next goes: the same rule in every Game.
// A Game's Saved progress only says which Levels are done; openness is worked out from that.

/**
 * Every Group is open. Inside one, Level 0 is open, a done Level stays open, and every other
 * Level opens once the one before it is done. `everyOpen` is the Grown-up Corner's "Every level open".
 */
export function isLevelOpen(done: readonly boolean[], level: number, everyOpen = false): boolean {
  return everyOpen || level === 0 || done[level] === true || done[level - 1] === true;
}

/** The Level to offer next in a Group: the first open one not done yet, or undefined when every open one is done. */
export function currentLevel(done: readonly boolean[], everyOpen = false): number | undefined {
  const at = done.findIndex((d, level) => !d && isLevelOpen(done, level, everyOpen));
  return at === -1 ? undefined : at;
}

/**
 * Where Next goes from a Level: the next one in its Group, else the next Group's Level 0 (always open),
 * else undefined after the very last Level. `sizes` is each Group's Level count.
 */
export function nextLevel(sizes: readonly number[], group: number, level: number): { group: number; level: number } | undefined {
  if (level + 1 < (sizes[group] ?? 0)) return { group, level: level + 1 };
  return group + 1 < sizes.length ? { group: group + 1, level: 0 } : undefined;
}
