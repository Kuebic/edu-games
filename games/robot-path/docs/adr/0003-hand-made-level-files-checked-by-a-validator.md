---
status: accepted
---

# Hand-made level files, checked by a validator

Levels are written by hand in `levels/world-N.json`. Each Level changes one difficulty knob from the one before (path length, turns, items off the route, slot slack, dead ends, wrong letters on the obvious route), because big jumps were what made Push Pals' early levels swing between trivial and impossible. `game/check.ts` checks every Level: the schema, that the solution wins and fits, that Par matches it, that worlds 1-5 have no route shorter than Par (breadth-first search through the same engine the game runs), that a Fix-it starter Program really is broken, and that only palette Commands are used. `levels.test.ts` runs it in the test suite, and `npm run robot-path:levels` prints each World's knobs with changes marked so jumps stand out. We chose hand-made over generated Levels because the ideas here (a decoy letter, a staircase that suits a Repeat Block, a Fix-it with one wrong arrow) are about teaching, and a generator can't aim at those.
