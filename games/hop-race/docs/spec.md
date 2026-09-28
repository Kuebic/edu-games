# Hop Race

Status: written 2026-09-26 from the pitch "a number-path board game for a three-year-old". Vocabulary is in [CONTEXT.md](../CONTEXT.md); decisions in [adr](./adr).

## The problem

Game Shelf has nothing that teaches numbers to a three-year-old. Snack Math adds and Find It asks for numbers to 20 from three cards, both for four-year-olds and up. A three-year-old's first number sense is knowing that numbers come in order and that a bigger number is further along. Siegler & Ramani (2008, 2009) found that preschoolers who played a simple race game on a straight 1–10 track for four 15–20 minute sessions got better at counting, comparing numbers and placing them on a number line, and the gains lasted. The same game on a circular track didn't help, and saying the number of each square landed on ("four, five") helped more than counting the hops ("one, two").

## The Game

- Slug `hop-race`, name "Hop Race", Category `math`, Shelf status Hidden until it's been tried on a phone, added 2026-09-26. A Tile picture of its own: a short numbered track with a hop arc, drawn with shapes, not emoji.
- One folder `games/hop-race/` like the other Games (ADR 0003): `game.json`, `index.html`, `README.md`, `CONTEXT.md`, `docs/`, `public/` (Tile and icons only), `src/`.
- Built on the shared platform: the shell, `showLevelSelect` with its Skins seam, `@shared/progress`, `@shared/grownup`, `@shared/voice`, `@shared/sound` (notes and the cheer), the Next button. `src/catalog/catalog.test.ts` and `src/shared/look.test.ts` must pass for it.
- No sound files: every noise is a note.

## Groups and Levels

The Game's word for a Group is **Track** and for a Level is **Race** (`levelWord: 'Race'`).

| Track | Squares | Races | What's new |
| --- | --- | --- | --- |
| 0 To 5 | 1–5 | 3 | Spinning and hopping |
| 1 To 10 | 1–10 | 4 | The whole track, as in the study |
| 2 Who's ahead | 1–10 | 4 | "Who is ahead?" between turns |

Each Race has its own Friend, so Races look different. Races open in order within a Track (site ADR 0009). Every level open works.

## The Hopper

The child's own animal: Bunny, Puppy, Kitty or Bear, picked from the level select's Skin chips on the Group list. Bunny to start. It is saved in the Game's slot and a reset keeps it. It changes the picture and the name the Voice says, never the Races.

## A Race

Both animals start on **Start**, the space before 1. The child goes first; turns alternate. A Race is done when the Hopper reaches **Home**, the last Square. No scores or timers, and nobody loses (ADR 0002).

**The Hopper's turn.**
1. The Spinner glows and the Voice says "Spin!".
2. The child taps the Spinner. Its arrow whirls and stops on the 1 half (one dot) or the 2 half (two dots). The Voice says "One hop!" or "Two hops!".
3. The big Hopper button glows. Each tap is one Hop: the Hopper moves to the next Square, the Square lights up, a note plays (higher for bigger numbers) and the Voice says the Square's number ("4"). Taps beyond the spin do nothing.
4. A hop onto Home ends the turn early, so a 2 from the Square before Home is one Hop.

**The Friend's turn.** The Voice says "Frog's turn." The Spinner whirls by itself, the Voice says the hops, and the Friend hops on its own, the Voice saying each number. A Friend that is Home is skipped. When the Friend gets Home first, the Voice says "Frog is home! Keep hopping!".

**Who's ahead?** In the third Track only. After a Friend's turn, when the two animals are on different Squares and the last round didn't ask, the controls give way to two big buttons, the Hopper and the Friend, and the Voice asks "Who is ahead?".
- Right: the animal dances and the Voice says "Yes! Bunny is on 5. 5 is more than 3."
- Wrong (a Fade, as in My Letter): the animal wobbles, the Voice says "Frog is on 3.", it fades out, and the question comes again with only the right one left.

**Home.** "You're home!", then the site's cheer, confetti, and the Home number big in a ring with that many beans under it (5 or 10, in fives), then the Next button. Next goes to the next Race, then the next Track (`progress.after`).

**Nudge.** When the child hasn't tapped for 6 seconds on their turn, the glowing control wiggles and the Voice says "Spin!" or "Hop!" again.

A glowing Spinner or Hopper button, and the Who's ahead? buttons, take a tap as soon as they show, even while the Voice is still asking; the tap cuts the ask off. On a browser whose Voice is slow or silent, the child never taps a glowing button to no effect. Other taps do nothing while an animal is moving or a number is being said, so a child can't tap through the numbers.

**The Spinner.** Each spin is 1 or 2 at random, but never the same three times in a row for the same animal. The rule lives in a pure, tested module with an injectable random source, like the rest of the Race rules.

## On screen

Portrait, top to bottom: the play header (Back, the gear), the **Track** as big as the width allows, then the Spinner and the Hopper button side by side. The Track is a straight row left to right, never bent or wrapped (ADR 0001): Start, then Squares 1 to Home, each numbered and each a different colour, Home marked with a flag. The Hopper stands in a lane above the Squares, the Friend in a lane below, so who's ahead can be seen by looking straight down. On a phone on its side, the same, smaller.

## Grown-up Corner

The site's switches (Sound, Voice, Every level open) and reset. A note: say the numbers with your child as the animals hop; the study behind it; the three Tracks.

## Tests

- The Race: turns alternate, the Hopper first; hops land on the next Squares and stop at Home; a Friend at Home is skipped; the Race ends when the Hopper is Home; the Spinner is 1 or 2 and never three the same in a row; "who's ahead" is asked when apart and not twice in a row. Deterministic with a seeded random.
- The Voice's lines.
- Progress: three Tracks of 3, 4 and 4; the Hopper round-trips and outlasts a reset; a damaged slot reads as Bunny.
- The level select: Tracks, colours, `levelWord`, Skin chips choosing the Hopper.
- Catalog/look guards pass.

## Out of scope

A Track past 10, a spinner with 3, recorded number clips. (A two-player mode came later, on 2026-09-28: ADR 0003.)
