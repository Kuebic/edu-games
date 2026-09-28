# Which Way?

Status: written 2026-09-27 from the pitch "An arrow shows, then a puppy, ball or car goes that way. First the child just watches, then taps go, then picks the arrow that matches where the treat is." Vocabulary is in [CONTEXT.md](../CONTEXT.md); decisions in [adr](./adr).

## The problem

In the first playtest the user's three-year-old loved Traffic Jam but didn't understand what its Arrows mean: that the Arrow says where the car will go. Robot Path assumes the same idea from its first World. Nothing on the Shelf teaches it on its own.

## The Game

- Slug `which-way`, name "Which Way?", Category `logic`, Shelf status On, added 2026-09-27. A Tile picture of its own, drawn with shapes: a puppy's Spot, an Arrow and a bone.
- One folder `games/which-way/` like the other Games (site ADR 0003).
- Built on the shared platform: the shell, `showPractice` with a Topic's Skins (site ADRs 0014, 0015), `@shared/progress`, `@shared/grownup` (`levels: false`), `@shared/voice`, `@shared/sound` (notes and the cheer). `catalog.test.ts` and `look.test.ts` must pass.
- No sound files: every noise is a note.

## Practice

One Topic, so no tabs. Its picks, each one tap and saved in the Game's slot:

- **Way** chips: Watch 👀, Go 🟢, Pick 👆.
- **Skin** chips: puppy, ball, car.
- **Ranges**: ←→, ↑↓, All. **Scope** items: ←, ↑, ↓, →, in that order.

A new save starts on Watch, ←→, puppy. An empty Scope leaves Play waiting (the site's rule).

## The field

The Mover sits in the middle of a grid five cells across and five down. The Spots are the cells two away from it: left, right, up and down. Only the Spots whose Arrows are in the Scope show; the field drops a direction nobody uses, so ←→ is one row five cells wide and ↑↓ one column. The Arrow, when it shows, fills the cell between the Mover and its Spot, tail at the Mover. The field is as big as the space between the header and the bottom row allows, keeping its cells square.

| Skin | Mover | Treat | Sets off | At the Treat |
| --- | --- | --- | --- | --- |
| Puppy | 🐶 | 🦴 | a yip | a crunch |
| Ball | ⚽ (spins as it rolls) | 🥅 | a boing | a cheer-note |
| Car | Traffic Jam's top-down car, turning to face its way first | ⛽ | a vroom | a ding |

## A Trip

Which Arrow comes up: each Arrow in the Scope once, shuffled, before any comes again (so at most two the same in a row). Pure and tested with a seeded random.

1. The Treat pops onto its Spot; the other Spots show empty.
2. By Way:
   - **Watch**: the Arrow pops in beside the Mover. After about a second the Mover goes.
   - **Go**: the Arrow pops in and the Go button appears at the bottom, breathing. A tap on it sends the Mover. It takes a tap as soon as it shows.
   - **Pick**: the Pick buttons show at the bottom, one per Arrow in the Scope. A tap on one sends the Mover that way.
3. As the Mover sets off, its Sound plays and the Voice says the Arrow's word ("Left!"). The word is a bonus: nothing needs it.
4. At the Treat: its Sound, a sparkle, the Treat is gone, one dot fills, and the Mover comes back to the middle.
5. **Wrong way** (Pick only): the Mover goes to the empty Spot, shrugs with a soft low note and comes back. The right Pick button glows. After a second Wrong way in the Trip, the Arrow also shows beside the Mover, as in Watch. She picks again. Nothing is counted.

After every fifth Trip a **Cheer**: confetti, the Mover big in a ring, the site's cheer, then the dots empty and Practice goes on. Back goes to Practice.

**Taps.** The Mover wiggles and makes its sound when tapped while it isn't moving, in every Way, so a child who wants to tap everything has something to tap. Nothing else reacts while the Mover moves. In Go and Pick, after 8 seconds without a tap, the Go button or the Pick buttons wiggle, at most three times in a row.

**The Voice.** In Pick, the first Trip asks "Which way to the bone?" (the Skin's Treat), and so does each idle nudge. Otherwise only the Arrow's word.

## On screen

Portrait, top to bottom: the play header (Back, five dots, the gear), the field, then the bottom row: the Go button, the Pick buttons, or an empty space of the same height in Watch so the field doesn't jump between Ways. On a phone on its side, the same, smaller.

## Grown-up Corner

Sound and Voice switches. No Every level open and no reset (Practice). A note in words: what the three Ways are, that a wrong pick just goes the wrong way and comes back, and that left and right as words come later (around five or six), so the Arrow matters more than the word.

## Tests

- Trips: every Arrow in the Scope once before any again; the Scope's own order doesn't matter; a one-Arrow Scope repeats it; never three the same in a row.
- Progress: new save defaults; round-trip; a damaged or foreign save falls back per field; a Scope keeps only real Arrows, in order.
- Practice: one Topic, its Ways, Ranges, items and Skins; picks save.
- Play (happy-dom, fake timers, a silent slow Voice): Watch fills a dot by itself; Go waits for the Go button; Pick's Wrong way makes the right button glow, and a second one shows the Arrow; the right pick fills a dot; five Trips make a Cheer.
- Catalog and look guards pass.

## Out of scope

Diagonals, turns relative to the Mover (Traffic Jam's left and right), Trips of more than one Spot, several Movers at once, recorded words, Levels.
