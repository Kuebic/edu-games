---
status: accepted
---

# Every Group is open, and its Levels open in order

Every Group is open from the start. Inside a Group, the first Level is open and each next one opens when the one before it is done. `src/shared/unlock.ts` holds that rule for every Game, and each Game's saves only say what is done. A grown-up can start a child at the level they're ready for without unlocking everything, and a child still meets each Group's Levels in order. This replaces Way Out's 9-of-12 and Robot Path's 6-of-8 gates, Push Pals' single line of 80, and Snack Math moving a child up a Stage by itself (its ADR 0003). Saves need no conversion, because openness is worked out from what's done. Snack Math is the one exception: it saved only a Stage, so its old saves count the Stages below that one as done. We rejected keeping the gates, because the user wanted to skip easy Groups. We also rejected opening everything, because a pre-reader needs a path. "Every level open" stays a Grown-up Corner switch in the Games that have it.
