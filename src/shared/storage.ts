// Where a Game keeps its Saved progress: localStorage in the browser, a Map in tests.
// Every Game shares one origin, so every key is written as "<slug>:<key>".

/** The two Web Storage calls we need. localStorage in the browser, memoryStorage() in tests. */
export type Backing = Pick<Storage, 'getItem' | 'setItem'>;

/** One Game's corner of the device's storage. Never throws: blocked or full storage just forgets. */
export interface GameStorage {
  /** The JSON value saved under this key, or undefined if there is none or it can't be read. */
  read(key: string): unknown;
  /** Saves a JSON-able value under this key. Silently does nothing if storage is blocked or full. */
  write(key: string, value: unknown): void;
}

export function gameStorage(slug: string, backing: Backing | undefined): GameStorage {
  const full = (key: string) => `${slug}:${key}`;
  return {
    read(key) {
      try {
        const raw = backing?.getItem(full(key));
        return raw == null ? undefined : (JSON.parse(raw) as unknown);
      } catch {
        return undefined;
      }
    },
    write(key, value) {
      try {
        backing?.setItem(full(key), JSON.stringify(value));
      } catch {
        // Private mode or full storage: keep playing without saving.
      }
    },
  };
}

/** localStorage, or undefined where even touching it throws (some private modes). */
export function deviceStorage(): Backing | undefined {
  try {
    return localStorage;
  } catch {
    return undefined;
  }
}

/** An in-memory Backing for tests. Seed it with raw strings to test old or broken saves. */
export function memoryStorage(seed: Record<string, string> = {}): Backing & { dump(): Record<string, string> } {
  const items = new Map(Object.entries(seed));
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => void items.set(key, value),
    dump: () => Object.fromEntries(items),
  };
}
