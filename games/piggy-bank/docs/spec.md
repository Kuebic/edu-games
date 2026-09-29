# Piggy Bank

Status: built 2026-09-28, from the pitch "coin recognition (quarter, dime, $1, etc), based on best practices for teaching 2 to 4-year-olds", after the research in [toddler-coin-game.md](../../../docs/research/toddler-coin-game.md). Vocabulary is in [CONTEXT.md](../CONTEXT.md); decisions in [adr](./adr).

## The problem

Game Shelf has nothing about money. Before 4, children can't compare coin values: "more" means the bigger coin until about 6 (Edmunds & Whitehurst c. 1973), and Common Core starts money in grade 2. What a 2 to 4-year-old can learn is that coins and bills are money, that each has a name, and that coins sort by how they look. Preschool standards ask for exactly that: "Sort coins by physical attributes such as color or size" (Colorado). Under 4, children tell coins apart by size and brightness ("big nickel, little nickel"). The nickel and the quarter, both silver and 3 mm apart, stay mixed up until 6. Real coins are also the thing small children swallow most, so a screen is the one place a two-year-old can handle them alone.

## The Game

- Slug `piggy-bank`, name "Piggy Bank", Category `math`, Shelf status On. A Tile of its own: a pink pig with a coin going into its slot.
- One folder `games/piggy-bank/` (site ADR 0003), on the shared platform: the shell, `showPractice` (site ADR 0014), `@shared/progress`, `@shared/grownup` (`levels: false`), `@shared/sound`. `catalog.test.ts` and `look.test.ts` must pass.
- **No Voice**, as in Tidy Up: every word is a recorded Word clip (ADR 0002). The grown-up says the sentences.
- **Names, not values.** Nothing says cents, "worth" or "more", and the child never sees ¢ or $. The grown-up's Scope buttons use them, because a grown-up reads them fastest.

## The Money

Four coins and a bill, as a child meets them in 2026:

| Money | Word | Heads | Tails | Size on screen |
| --- | --- | --- | --- | --- |
| penny | "penny" | Lincoln | Lincoln Memorial | 19.05 mm |
| nickel | "nickel" | Jefferson (profile, 2003) | Monticello | 21.21 mm |
| dime | "dime" | Roosevelt | torch | 17.91 mm |
| quarter | "quarter" | Washington | eagle | 24.26 mm |
| dollar | "dollar" | the $1 bill's front | its back | a bill, not to scale |

**Real photos**, one photographer's set under the same light, so the coins differ only as real ones do (realistic pictures carry over to real things better than drawings, Ganea et al. 2008). The designs are the classic ones: the newer shield penny, forward-facing nickel and 2026 one-year designs are either copyrighted or break "one face, one coin" (ADR 0003). The dollar is the bill, because the dollar coin is rare in change and a child meets "a dollar" as green paper.

**True relative size.** Every coin is drawn at its real diameter times one scale, the same for all, so the quarter is the biggest and the dime the smallest, the cue a three-year-old uses. On a phone in portrait the scale is about 7 px a millimetre, so the dime is about 125 px and the quarter about 170 px, both over the 20 mm a toddler's target needs. The bill is 28 coin-millimetres wide, far under the 75% of real size the law asks (18 U.S.C. 504), and only one side ever shows at once.

**Heads up.** A coin comes out heads up. A tap on a coin in Sort flips it over, and back, and says its Word: tails is there to explore and never decides where a coin goes.

## Practice

One Topic, Money, so no tabs. The picks, each one tap, saved in the Game's slot:

- **Scope**: 1¢, 5¢, 10¢, 25¢, $1. Play waits for two, since both Ways need two kinds to tell apart (`fewest: 2`).
- **Ranges**: "1¢ 25¢" (the first pair: different color and size), "1¢ 10¢ 25¢", All.
- **Way**: 🐷 **Sort**: each coin into the bank with its picture, and 🔍 **Find**: one pig asks for a coin by name.
- **New save**: penny and quarter, Sort.

The research's order, for the grown-up's note: penny and quarter, then penny and dime (color only), then dime and quarter (size only), then all three, then the dollar, and the nickel last. Nothing waits for a score; the user's child outgrows scaffolds fast.

## Sort

Tidy Up's Round with coins, so it plays the same in the hand.

- **Banks.** As many as the Scope has kinds, up to 3, each kind once before any again. Each is a see-through pink piggy bank with its money's heads photo on a round tag on its side, the tags at true relative size too. All the pigs are the same pink, so the tag is the only cue.
- **The Purse.** 8 pieces of money with 2 Banks, 9 with 3, even per Bank, never three in a row for one Bank. They sit heaped small at the top, one fewer each time.
- **Turn by turn.** The next piece hops onto the Spot. The child drags it and lets go over a Bank's column in the lower half, or taps a Bank. **Right**: it slides into the slot, a clink, the Bank wiggles, then its Word, the name coming last, but only for the first coin into that Bank a Round; after that a clink only, so a name she has just heard isn't said again (site ADR 0016, amended 2026-09-29). The coin then lies inside the see-through belly, so the Banks fill up. **Miss**: a soft bump, it slides back to the Spot, its Word plays ("that's a nickel", by the clip), and its own Bank glows. The second Miss sends it into its own Bank by itself. Nothing is counted.
- A tap on the coin flips it and says its Word. Let go in the top half and it stays there, to grab again.
- **Nudges** as in Tidy Up: after 7 s the coin wiggles and its Bank glows; from the second, its Word too; three at most.

## Find

The second step, from matching to the name: "Find the dime!" among two or three.

- **A Round** has the pig at the bottom and, above it, one coin of each kind the Round uses (as many as the Scope has, up to 3, each once before any again), at true relative size. Six **Asks** a Round.
- **An Ask.** The pig's bubble pops up and the Word says the coin's name. The child drags that coin into the pig, or taps it. The coins change places between Asks.
- **Right**: into the slot, a clink and sparkles. No Word: she has just heard it (ADR 0004).
- **Miss**: a soft bump, the coin slides back, and the pig asks again for the same coin. The wrong coin's name is never said, so the only name she hears is the one she's looking for (ADR 0004). The second Miss on one Ask: the asked coin glows and goes in by itself.
- A tap on the pig or its bubble asks again. **Nudges**: the bubble wiggles; from the second, the Ask is said again; from the third, the asked coin glows too.
- **Without sound** (Sound off, or a clip not decoded yet) the bubble shows the asked coin's picture, so the Ask becomes a match and the Game still plays.

## The end of a Round

When the Purse is empty, or after the sixth Ask, the Banks jingle and wobble with their coins bouncing inside. Then the site's cheer, and a card for the grown-up with one of the Round's pictures: "Find a penny with a grown-up!" (real coins are a choking risk, so real-coin play is the grown-up's). The Next button starts the next Round; Back goes to Practice. No stars, points or stickers. Practice goes on until Back.

## Words and pictures

Five Word clips, made by `npm run game piggy-bank words` as Tidy Up's are (trim, level, fade, mono MP3, credits in `docs/credits.md`):

- penny, quarter, dollar: Grendelkhan on Lingua Libre, CC0, the speaker of most of Tidy Up's Words.
- nickel: Wiktionary's `En-us-nickel.ogg`, CC BY-SA 3.0.
- dime: nobody on Commons recorded a US "dime" alone, so the task joins the start of Grendelkhan's "die" to the end of his "crime", both CC0. Speech recognition hears it as "dime" in every cut tried, with two models (ADR 0002).

Ten pictures, made by `npm run game piggy-bank pictures`: the coins cut to a circle at 360 px, the bill at 480 px wide, WebP. The coins are "Matthias from Seattle" on Flickr, CC BY 2.0, via Commons; the bill scans are US Government works in the public domain. The site's service worker must precache `.webp`.

A test fails a kind of money with no Word clip or a missing side.

## On screen

Portrait, top to bottom: the play header (Back, the gear), then the Purse and Spot (Sort) or the coins on the table (Find), then the Banks along the bottom. On a phone on its side, the same, smaller.

## Grown-up Corner

The site's Sound switch, no Game rows. The note: names not values, the order above, say the name with your child as each coin goes in, and look at real coins together, never alone, since they're a choking risk.

## Tests

- Sort Rounds: Banks from the Scope, each once before any again, at most 3; the Purse's size and balance; never three in a row.
- Find Rounds: one coin per kind, the Asks spread over the kinds, six to a Round.
- Where a finger lets go: a Bank, or none in the top half.
- Progress: the slot round-trips Scope and Way; a damaged slot reads as the new save.
- Every kind has a Word clip and both sides.
- Practice: the items, Ranges, Ways, `fewest`.
- Play: a Bank pressed takes the coin, a Miss twice sends it home, the Round ends; a Find answered right and wrong.

## Out of scope

Values, cents, counting mixed coins, making change, "which is worth more", the dollar coin, the half-dollar, the 2026 and varied quarter designs, a Shop. A Shop where one coin buys one thing (any coin, no prices) is the research's next step, for about age 4.

## To decide in playtest

- Which coin she names first today, with fewer pennies around than in the 1970s study.
- Whether the flip interests her or gets in the way of dragging.
- Whether a Word on every right drop gets tiresome (as in Tidy Up).
- Whether the joined "dime" sounds right to a person.
