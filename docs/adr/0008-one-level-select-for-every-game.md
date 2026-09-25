---
status: accepted
---

# One level select for every Game

Every Game opens on the same level select, drawn by `src/shared/level-select.ts`. The Group list shows the House button, the Skin chips and a card per Group. A Group screen shows its Levels as numbered cards with ticks, Sparkles and locks. The Game gives it Groups (a name for screen readers, a colour, a badge picture, done and Sparkle marks), header tools, two slots and a `play` callback. Each Game keeps its own colours, badges, Skins' art and play screens. Before this, Traffic Jam, Robot Path and Way Out each had a copy of the same cards, and those copies had already drifted. Two had no width cap and grew huge on big screens. Push Pals had its own. ADR 0007 rejected a shared component kit because the cards already matched. We reopen that for the level select only: it's one screen with the same behaviour and the same unlock rule everywhere, and the user asked for it to be consistent. Confetti, win overlays and play screens stay each Game's own. Tests use happy-dom in one test file. `look.test.ts` fails a Game that draws its own lock, House button or unlock rule; while the Games move over one by one, it lists the ones that still draw their own, and that list only shrinks.
