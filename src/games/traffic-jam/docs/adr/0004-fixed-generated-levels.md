---
status: accepted
---

# Fixed Levels, generated offline and checked by tests

Levels live in `levels.ts`, 8 per Chapter. A seeded generator (`npm run traffic-jam:generate -- <seed>`) proposes random boards within each Chapter's limits (`chapters.ts`), ranks them by difficulty (Waves, then Vehicle count, then how few are Free at the start) and samples 8 from easy to hard. `levels.test.ts` re-checks every Level: layout, every Arrow has a Route, the board can be Cleared, and the Chapter's limits and required feature hold. So hand edits are safe. We chose fixed Levels over generating them live so every child sees the same boards ("I'm stuck on the blue level 5"), quality is reviewed once, and nothing random can reach a child untested.
