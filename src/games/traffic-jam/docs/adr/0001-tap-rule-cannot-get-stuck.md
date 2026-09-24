---
status: accepted
---

# A tap either leaves or changes nothing, so a board can't get stuck

A tapped Vehicle follows its whole Route off the board, or, if anything is in the way, bumps and returns to exactly where it started. Vehicles never stop partway. So taking Vehicles away can only ever free others: tapping Free Vehicles in any order clears any board that can be cleared, and a wrong tap costs nothing but a honk. That gives "no lose state" by construction, with no undo, reset, or hints needed. It also makes difficulty easy to measure (count the Waves) and levels easy to check (clear the board greedily). The price is that the puzzle is about spotting which Vehicle is Free right now, not about planning moves; for 4–6-year-olds that's the right puzzle.
