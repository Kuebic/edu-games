---
status: accepted
---

# One drag is one Move, however far it slides

A Move is a whole slide of one Vehicle, however many cells it covers. That matches the puzzle database, so par comes straight from its move counts and our solver, and it matches how a child thinks ("I moved the green truck"). A nudge moves one cell and counts as its own Move, so nudging three times costs three. That's the price of the backup input, and the Sparkle is only a bonus. We rejected counting cells because par would stop matching the database and a long confident drag would cost more than three timid ones. A drag that ends where it started isn't a Move and doesn't go on the Undo stack.
