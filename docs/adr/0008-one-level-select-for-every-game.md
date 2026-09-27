---
status: accepted
---

# One level select for every Game

Every Game opens on the same level select, drawn by `src/shared/level-select.ts`. The Group list shows the House button, the Skin chips and a card per Group. A Group screen shows its Levels as numbered cards with ticks, Sparkles and locks. The Game gives it Groups (a name for screen readers, a colour, a badge picture, done and Sparkle marks), header tools, two slots and a `play` callback. Each Game keeps its own colours, badges, Skins' art and play screens. Before this, Traffic Jam, Robot Path and Way Out each had a copy of the same cards, and those copies had already drifted. Two had no width cap and grew huge on big screens. Push Pals had its own. ADR 0007 rejected a shared component kit because the cards already matched. We reopen that for the level select only: it's one screen with the same behaviour and the same unlock rule everywhere, and the user asked for it to be consistent. Confetti, win overlays and play screens stay each Game's own. Tests use happy-dom in one test file. `look.test.ts` fails a Game that doesn't call `showLevelSelect()` exactly once, draws its own House button, brings back an old lock drawing or unlock rule by name, or restyles the level select's classes.

Amended: a Group with no Levels is left off the Group list but keeps its index, so its saves and the Groups after it never move (My Letter's My words before there's a Name or a Word), and Next skips it. A Group may pass `labels` to show on its Level cards in place of numbers (My Letter's letters).

Amended by 0014: a Game with no Levels opens on Practice instead.
