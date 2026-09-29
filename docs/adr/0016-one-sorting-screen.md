---
status: accepted
---

# One sorting screen

Tidy Up sorts blocks into buckets and Piggy Bank sorts coins into pigs, and Piggy Bank was built by copying Tidy Up's screen: a Pile at the top, a Spot, Bins along the bottom, the first finger on a Thing dragging it, a tap on a Bin, a Miss that glides back and lights the right Bin, a second Miss that goes in by itself, nudges after 7 seconds still, and a round end with confetti, a card for the grown-up and Next. Tidy Up's Kinds would have been a third copy. So sorting is `src/shared/sort.ts` and `sort.css`: `playStage` draws the screen and its end, `fingers` owns the drag and press rules, and `sortRounds` plays Rounds turn by turn. A Game gives its Rounds, its drawings of a Thing, a Bin and a landed Thing, and its sounds and Words as hooks (`landed`, `missed`, `helped`, `tapped`, `nudged`, `opening`, `finish`). `binsFrom`, `pileOf` and `binAt` are the shared Round rules, tested as data.

Piggy Bank's Find isn't a sort, so it keeps its own loop, on the shared stage and fingers. We rejected leaving the two copies, which had already drifted in small ways (one flips a coin on a tap, one wiggles), because the Miss rule and the finger rules are the part a child learns, and they should be the same in every Game. A Game's own motion stays its own: Tidy Up's trucks drive off and Piggy Bank's pigs jingle, in the `finish` hook. `catalog.test.ts` fails a Game that defines its own `binAt`, `bankAt`, `fingers` or `MISSES_BEFORE_HELP`; `look.test.ts` counts a Game on the sorting screen as drawing site-screens.
