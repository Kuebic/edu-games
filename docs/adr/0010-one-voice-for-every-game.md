---
status: accepted
---

# One Voice for every Game

Every Game that speaks does so through `src/shared/voice.ts`: it picks an English voice, says a line at one rate and pitch, resolves when the line ends, hushes when the page hides, and unlocks speech once from inside a touch, which iOS needs before it will speak at all. A Game saves its own Voice switch under its Slug and hides it where the browser can't speak. Before this, Robot Path, Snack Math and Way Out each had a copy of the same `speech.ts`, and every fix since had landed in one copy: only two hid the switch where speech was missing, only one resolved when a line ended and guarded against engines that never say so, only one hushed a locked phone, and Way Out never unlocked speech, so its win, hint and first-goal lines were silent on iOS. We rejected unlocking speech in the shell for every Game, because Push Pals and Traffic Jam don't speak and ADR 0006 already gives a Game an `unlock` seam for exactly this. Recorded clips would replace this one module. `src/catalog/catalog.test.ts` fails a Game that touches `speechSynthesis` itself, keeps a `speech.ts`, or imports the Voice and never unlocks it.
