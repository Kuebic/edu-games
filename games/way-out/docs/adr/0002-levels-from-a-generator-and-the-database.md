---
status: accepted
---

# Levels picked offline from our generator and Fogleman's database

`npm run game way-out build` makes random easy Boards itself (up to 8 Vehicles, par 6 or less; Pack 1 comes only from these). It also takes a seeded sample from Michael Fogleman's database of 2.5 million Boards with known par, sampled per par and Vehicle count so the rare hard end isn't crowded out. Every candidate is measured: par, Vehicles, moved Vehicles, whether some Vehicle must move twice, whether the red car must back up, and blocking depth. Each Pack then climbs a staircase where par or the Vehicle count goes up by one from one Level to the next, never both. Each idea that is new to a Pack (deeper blocking, repeat moves, walls, backing up) is held back until its turn partway through. The Pools are random leftovers within the same limits. `src/levels.test.ts` re-checks every Board and par, so hand edits are safe, and `npm run game way-out levels` prints each Pack's table with jumps marked. We chose fixed Levels so every child sees the same Boards and nothing unchecked reaches one. We chose the database over generating hard Boards ourselves because random placement rarely makes Boards past par 15. The database's licence is unstated (see the README), and the generator is the fallback.
