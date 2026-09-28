# Tidy Up

Status: draft, written 2026-09-28 from the pitch "a sorting game for shapes and colors, for 2 to 3-year-olds", after the research in [toddler-sorting-game.md](../research/toddler-sorting-game.md). It moves to `games/tidy-up/docs/spec.md` when the Game's folder is made; `catalog.test.ts` fails a folder in `games/` without a `game.json`.

## The problem

Game Shelf has nothing that teaches colors or shapes, and nothing a two-year-old can play. Children sort by color before they sort by shape: under about 3.9 years they group by color, and only from about 4.5 by form (Suchman & Trabasso 1966). Two-year-olds match same-colored objects when the objects are identical, and match a red cup with a red duck only once they understand color words (Sandhofer & Smith 1999). Most 3-year-olds can't switch from one sorting rule to another partway through (the Dimensional Change Card Sort). The CDC's tip for 2-year-olds is to name each piece as the child puts it in place.

## A new Game, not a Find It Topic

Find It could take a Colors Topic: a red duck at the top, and three buckets to tap. That is matching, one question at a time. Sorting is a different Game:

- **The loop.** A Find is one question, answered by one tap, and then the next. A Round in Tidy Up is a pile of Things that fill Bins, and the full Bins at the end are the reward. None of Find It's words fit: Choices, Both ways round, Trays, Count-along, a Cheer every sixth.
- **The hand.** Find It is tapped. Sorting is dragged, the hands-on play the user's 3-year-old loved in Traffic Jam, and dragging a named object helped some 2 to 4-year-olds learn words more than tapping did (Russo-Johnson et al. 2017).
- **The age.** Find It asks three-way questions of 4 to 6-year-olds. Tidy Up starts with 2 Bins for 2 to 3-year-olds.
- **The cost.** Almost nothing is saved by sharing a folder. Practice, Skins, the Sound, Saved progress and the Grown-up Corner already come from `src/shared/`, so a new Game adds only its own play screen. Folding sorting into Find It would put two Games in one folder behind one Tile.

A Colors Topic in Find It stays possible later, for older children who already know their colors.

## The Game

- Slug `tidy-up`, name "Tidy Up", Category `math` (sorting is classifying, and shapes are early geometry), Shelf status Hidden until it's been tried on a phone. A Tile picture of its own, drawn with shapes: a red block falling into a red bucket beside a blue one.
- One folder `games/tidy-up/` like the other Games (site ADR 0003).
- Built on the shared platform: the shell, `showPractice` with a Topic's Skins (site ADRs 0014, 0015), `@shared/progress`, `@shared/grownup` (`levels: false`), `@shared/sound` (clips, notes, the cheer). `catalog.test.ts` and `look.test.ts` must pass.
- **No Voice.** Every word the child needs is a recorded Word clip (see Words). Browser speech is silent on the user's Linux machine and stalls each line there, and a 2-year-old needs the word more than the sentence. The grown-up says the sentences.

## Practice

Two Topics, Colors and Shapes, as tabs. A child never meets both rules in one Round. The picks, each one tap and saved in the Game's slot:

| | Colors | Shapes |
| --- | --- | --- |
| Scope items | 🔴 red, 🔵 blue, 🟡 yellow, 🟢 green, 🟠 orange, 🟣 purple, 🩷 pink | ⚪ circle, 🟦 square, 🔺 triangle, ⭐ star, ❤️ heart |
| Ranges | 🔴🔵🟡, All | ⚪🟦🔺, All |
| Way | **Blocks** 🧱: one toy block, only its color differs. **Things** 🧸: a duck, a banana, a fire truck, each its own color | **Plain** ⬜: every shape one soft grey. **Colorful** 🌈: each shape a random color, which the child has to ignore |
| Skin | Buckets 🪣, Trucks 🚚 | none: Shapes always use the shape-sorter Box |
| New save | red, blue; Blocks; Buckets | circle, square; Plain |

Each Way holds the other dimensions still first and then varies them, which is the order the research gives. Parents move from one to the next when the child is ready; the user's child outgrows scaffolds fast, so nothing waits for a score.

An empty Scope, or a Scope of one, leaves Play waiting, since sorting needs two Bins.

## A Round

**The Bins.** A Round has as many Bins as the Scope has items, up to 3. Which ones: each Scope item once, shuffled, before any comes again, so a Scope of all seven colors goes round them. Blue/green and red/green are never the only pair in a Round. The Bins sit side by side along the bottom, as wide as the screen allows.

- Colors, Buckets: a bucket painted its color. Trucks: a dump truck with a bed painted its color.
- Shapes: a shape-sorter Box, its lid cut with the Bin's shape.

**The Pile.** 8 Things with 2 Bins, 9 with 3, the same number for each Bin, shuffled, never more than two for the same Bin in a row. The Pile sits heaped at the top of the screen, so the child can see how much is left without a progress bar. In the Things Way no Thing shows twice in a Round. A Round's pure rules (Bins, Pile, order) live in one tested module with an injectable random, like Hop Race's.

**Turn by turn.**

1. The next Thing hops off the Pile to the **Spot**, above the middle of the screen, at least 20 mm across (about 125 CSS px).
2. The child drags it. The Thing lifts above the fingertip so the finger doesn't hide it, and a soft pick-up note plays.
3. **Right Bin.** Releasing anywhere over a Bin's column in the lower half drops it into that Bin. It snaps in, the Bin wiggles, a bright note plays, then the Word clip says its color or shape ("red"). The object is on screen first and the word comes last, the word order that taught 2-year-olds colors (Ramscar et al. 2010). The next Thing hops out as the word ends.
4. **Wrong Bin.** A soft low bump, no buzzer. The Thing slides back to the Spot, its Word clip plays ("blue") and its own Bin glows. A second wrong Bin for the same Thing: it glides into its own Bin by itself, with its word. Nothing is counted.
5. **Let go in the top half.** The Thing stays where it was dropped, and the child can grab it again.
6. **A tap on a Bin** sends the Thing there, right or wrong as above. It's for a child who can't drag yet, and needs no setting.
7. **A tap on the Thing**, without dragging, makes it wiggle and says its word. The word comes when she asks for it, and she has something to tap.

**Idle.** After 7 seconds without a touch, the Thing wiggles and its Bin glows. After 7 more, the same with its word. At most three nudges in a row. The Thing never moves on its own when idle, so a child who has walked away doesn't come back to a Round that played without her.

**Taps and fingers.** A grab starts on pointer down, anywhere within about 10 mm (60 px) of the Thing. The first finger on it owns the drag, and other fingers and a palm are ignored until it lifts. A press under 5 s that doesn't move is a tap. A Bin tap or a new grab is taken as soon as the next Thing shows, even while a Word clip is playing; it cuts the clip off.

**Tidy.** When the Pile is empty, the full Bins bounce their Things, then the Buckets wiggle, or the Trucks drive off with a vroom, or the Boxes rattle. Then the site's cheer. Under it a card for the grown-up, in words: "Find something red at home!", "Find something round!", one of the Round's Bins. The Next button starts the next Round. Back goes to Practice. There are no stars, points or stickers.

Practice goes on until Back, as in every Practice Game. The research suggested stopping after 3 Rounds; the shelf's rule is that the grown-up decides when to stop, and a Round is short.

## Things

**Blocks.** One drawn toy block, filled with the Bin's color. **Plain and Colorful shapes**, drawn: the Bin's shape with a soft edge.

**Things** are emoji of everyday objects mainly one color, in realistic art where the emoji set has it. Realistic pictures carry over to real objects better than cartoons (Ganea et al. 2008). A first list, to check on Apple and Noto emoji before it's kept:

| Color | Things |
| --- | --- |
| red | 🍎 🍓 🍅 🚒 🌹 |
| blue | 🫐 🐳 🧢 👖 🦋 |
| yellow | 🍌 🌻 🐤 🧀 🍋 |
| green | 🥦 🐸 🥒 🌲 🍏 |
| orange | 🍊 🥕 🎃 🏀 🦊 |
| purple | 🍇 🍆 ☂️ 🔮 |
| pink | 🌸 🐷 🦩 🎀 🩰 |

A test checks each Thing sits under exactly one color.

**Colors** are one palette in the Game (site ADR 0007: the Game's own colors), chosen so each has a clearly different lightness. With the research's advice, red/blue and yellow/blue are the first pairs, and the default Scope never pairs red with green.

## Words

One short Word clip per Scope item: red, blue, yellow, green, orange, purple, pink, circle, square, triangle, star, heart. They're free recordings from Wikimedia Commons. **Lingua Libre** has one speaker, Grendelkhan, in CC0, with red, blue, yellow, green, orange, pink, circle, square, star and heart; Commons' `En-us-*.ogg` Wiktionary files (CC BY-SA 3.0) fill the gaps, including purple and triangle. One voice for all 12 is better if a search at build time finds one.

A Game task `npm run game tidy-up words` fetches them and makes the clips as My Letter's `sounds` task does: trim silence, level loudness, fade the ends, mono MP3. `docs/word-credits.md` lists source, speaker and licence, and CC BY-SA clips stay CC BY-SA. A test fails a Scope item with no clip.

With sound off, or before a clip decodes, play goes on silently: the glow and the Bins still show the answer.

## On screen

Portrait, top to bottom: the play header (Back, the gear), the Pile, the Spot, then the Bins along the bottom, the lower half of the screen being their drop zones. No dots or progress bar. On a phone on its side, the same, smaller.

## Grown-up Corner

The site's switches (Sound). The Game's row: **Patterns**, off to start with. On, each color also carries a pattern on its Things and its Bin (stripes, dots, zig-zags), for a color-blind child. It's a setting, kept in the slot. A note in words: name the color or shape with your child as each Thing goes in, and look for the Round's color around the house after.

## Tests

- The Round: Bins from the Scope, each once before any again, at most 3, never blue/green or red/green alone; the Pile's size and balance; never more than two for one Bin in a row; no Thing twice in a Things Round. Deterministic with a seeded random.
- Drops: which Bin a release point falls in, the top half being none; a second miss sends the Thing home.
- Progress: the slot round-trips Topic, Scopes, Ways, Skin and Patterns; a damaged slot reads as the new-save picks.
- Every Scope item has a Word clip; every Thing is under one color.
- Practice: the Topics, Ranges, Ways and Skins; a Scope of one waits.
- Catalog/look guards pass.

## Out of scope

Size sorting, sorting by a rule the child picks, more than 3 Bins, the browser Voice, a Colors Topic in Find It.

## To decide in playtest

- Whether a 2-year-old drags or taps Bins, and whether 7 seconds before a nudge is right.
- Whether a Word clip on every right drop gets tiresome, as the repeated Letter sound did in My Letter. If so, say it on the first drop into each Bin and on taps only.
- Whether Things (emoji) read as their color on the phones she uses.
