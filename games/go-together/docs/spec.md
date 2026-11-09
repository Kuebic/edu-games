# Go Together

Status: built 2026-11-08, from the pitch "the New York Times game Connections, but with pictures, for kids", grilled the same day with every question settled on the recommended answer at the user's ask. Vocabulary is in [CONTEXT.md](../CONTEXT.md); decisions in [adr](./adr) and the site's ADR 0018.

## The problem

Connections deals 16 words in 4 hidden groups of 4; you pick 4, submit, and get "one away" or a solved row, with 4 mistakes allowed. Almost none of that survives a two to four-year-old: no reading, no submit step, no counting mistakes, no red herrings. What does survive is the one idea that makes the game: nobody tells you the groups. Tidy Up names the Bins first and the child sorts into them; here the child has to see for herself that the dog, the cat and the cow belong together. That is the step from sorting into given categories to forming them, and basic-level groups like animals, vehicles and food are the ones two to three-year-olds form first (Rosch et al. 1976; Mandler & Bauer 1988). Identical-picture matching comes even earlier, so the youngest tier is simply "find the two that are the same".

## The Game

- Slug `go-together`, name "Go Together", Category `logic` (a solo puzzle, where the groups are the thing to work out; Tidy Up stays on Math as sorting). Shelf status Hidden until the user has looked, then On.
- One folder `games/go-together/` (site ADR 0003), on the shared platform: the shell, `showPractice` (site ADR 0014, a Practice Game, as every 3yo skill Game is), `@shared/progress`, `@shared/grownup` (`levels: false`), `@shared/sound`.
- **No Voice.** The only words are recorded Words: a group's plural ("animals"), a color ("red") or a Thing's own name ("dog"). Tidy Up already has these ~120 clips, so the pictures and their Words move to a shared module (below).
- **Tap only.** Nothing is dragged. Research for the shelf's 3yo tier said tap-first.

## Practice

Three Topics, tabs with a picture badge:

- **Same** (two-year-olds): groups are identical pictures, 🐕🐕. Scope: which pools the pictures come from: animals, vehicles, food, clothes, toys, plants. Range: All.
- **Colors**: a group is Things of one color, 🍎🍓🚒 red, from Tidy Up's everyday Things. Scope: the seven colors. Ranges 🔴🔵🟡 and All.
- **Kinds**: a group is a kind of thing, from Tidy Up's Kinds pools: animals, vehicles, plants, toys, clothes, food, birds, fish, fruit, vegetables. Scope: those groups. Ranges Easy (animals, vehicles, food, clothes) and All. Groups that overlap (animals with birds, fish or mammals; food with fruit or vegetables) never share a Board when the Scope has another way: `binsFrom`'s `apart` rule from `@shared/sort`, reused to deal a Board.

**Way** on every Topic is the **Board**, four chips drawn as little grids: **4** (2 groups of 2), **6** (2 of 3), **9** (3 of 3), **16** (4 of 4, the real Connections). On Colors and Kinds, Play waits for as many Scope items as the Board has groups (`fewest`: 2, 2, 3, 4). On Same the groups are pictures, drawn from the Scope's pools in turn, so one pool is enough (`fewest` 1).

**New save**: Kinds, Board 6, the Easy Range; Same holds animals and vehicles, Colors red and blue, for when a grown-up switches tab. The user's child is three and a half and knows her categories; a two-year-old's grown-up taps Same once.

## The Board

A grid of Cards in the middle of a portrait phone (2×2, 2×3, 3×3, 4×4), each a big rounded white Card with one emoji. Above it a row of empty **Frames**, one per group, in Connections' four colors (yellow, green, blue, purple) with no meaning but to tell them apart. Cards are dealt shuffled; a group's Cards never all sit in one row, so a row is never the answer.

### Picking

- A tap **lifts** a Card: it grows, gets a yellow ring, a soft pop. The first lifted Card is the **Lead**; its group is what she's collecting. A tap on a lifted Card puts it down; if the Lead goes down, the earliest still-lifted Card leads.
- A tap on a Card of the Lead's group lifts it too. When every Card of the group is up, they **gather**: slide together, a chime, then hop into the next empty Frame, and the group's Word is said once ("animals", "red", or on Same the Thing's name, "dog").
- **Miss**: a tap on a Card not in the Lead's group. A soft bump, the Card shakes and drops back; the Lead stays up. Nothing is counted, no submit, no "one away". On the first Miss the rest of the Lead's group glows. On the second Miss in one gather, the rest lift and gather by themselves, as a Thing goes into its Bin by itself on the sorting screen (site rule: two Misses, then help).
- **Nudge** after 7 s without a touch: with nothing lifted, one Card wiggles; with a Lead up, the rest of its group glows; from the second Nudge the Lead's Word plays; three at most. Nothing gathers by itself while she's idle.
- The last group left gathers as soon as its first Card is tapped, since there is nothing to pick it from.

### The end

When every Frame is full, the Frames wobble and shine, the site's cheer, and a card for the grown-up: "Which things at home go together? Find three." Next deals a new Board; Back goes to Practice.

### Sound

Pop on lift, a lower pop on put-down, bump on a Miss, chime on a gather, the group's Word once (a lift cuts a Word still playing short, so Words never pile up), a shimmer as the Frames shine, the site's cheer. With Sound off the Frame still shows the gathered pictures, so the game plays silent (the user tests on Linux without speech).

## Shared: pictures and their Words

Tidy Up's Kinds pools, its colored Things and the ~120 Word clips were wanted by two Games, so they are `src/shared/kinds.ts` and `src/shared/assets/words/` (site ADR 0018), with Tidy Up importing from there and no behaviour change. `src/shared/kinds.test.ts` checks the data and that every picture has a clip. `catalog.test.ts` fails a Game that defines its own `GROUP_WORDS` or `COLOUR_THINGS`, or globs a words folder of its own.

The Board screen itself stays Go Together's own until a second Game taps groups out of a grid (ADR 0007: share when two).

## Grown-up Corner

The site's Sound switch, no Game rows. The note: what the Game teaches, the three Topics in the order to try them, the Boards, that a tap puts a Card back, and that it only ever says the group's name.

## Tests

- Dealing: groups from the Scope, each once before any again, never overlapping groups on one Board, a Board of n groups × n Cards, no group all on one row.
- Picking as data: Lead, lift, put down, Miss, the first Miss's glow, the second Miss's self-gather, the last group's free gather.
- Practice: three Topics, their items, Ranges, Boards, `fewest` per Board.
- Progress: the slot round-trips Topic, Scope and Board; a damaged slot reads as the new save.
- Every group and every Thing has a Word clip (from the shared module).
- Play in happy-dom: a tap lifts, a right tap gathers into a Frame, two Misses gather by themselves, a full Board ends and the cheer plays.

## Out of scope

Red herrings and overlapping groups, a mistake count, a submit button, Skins, a shuffle button, words on Cards, a two-player turn, Hints that fade (there is nothing to fade; the Frames are the answer key). A later Topic could mix dimensions on one Board (red things beside animals), which is Connections proper, for five-year-olds.

## To decide in playtest

- Does she understand that nothing is asked of her, or does she wait for an Ask as in Mailbox?
- Is 6 right for her, or does she go straight to 9?
- Does a Miss on a tap feel fair, or does she want to pick freely and be judged at the end?
- Do the Frames read as "done", or should gathered Cards stay on the grid, greyed?
- Is Same too easy to bother with, or does a younger sibling or friend use it?

## Terms

As built, in [CONTEXT.md](../CONTEXT.md). The draft's list, kept for the record:

**Card**: one picture on the Board, a big white rounded square with an emoji. _Avoid_: Tile (a Hub word), Thing (Tidy Up's).
**Board**: one deal of Cards in a grid, 4, 6, 9 or 16, in 2, 2, 3 or 4 groups; also the Way chip that picks the size. _Avoid_: Round (in this Game, a Board is the Round), level, puzzle.
**Group**: the Cards that go together: the same picture (Same), one color (Colors), or one kind (Kinds). Nobody names it until it's gathered. _Avoid_: Category (a Shelf word), set, connection.
**Frame**: one of the colored empty frames above the grid that a gathered Group hops into. As many as the Board has Groups. _Avoid_: Bin (Tidy Up's), row, slot.
**Lift**: what a tap does to a Card: it rises, rings and waits. A second tap puts it down. _Avoid_: select, pick.
**Lead**: the first Card lifted; its Group is the one being collected. _Avoid_: anchor, first pick.
**Gather**: a whole Group lifted: the Cards slide together, chime, hop into a Frame and the Word is said once. _Avoid_: solve, match, win.
**Miss**: a tap on a Card outside the Lead's Group: a bump and it drops back. The first glows the rest of the Group; the second gathers it by itself. Nothing is counted. _Avoid_: mistake, wrong answer, one away.
**Word**: a recorded name, said once per Gather: the Group's plural, its color, or on Same the picture's name. The Game has no Voice. _Avoid_: label, Voice.
**Nudge**: after 7 s idle, a wiggle, then the Group glows, then the Word; three at most. _Avoid_: hint, timeout.
**Same / Colors / Kinds**: the three Topics (the site's word).
