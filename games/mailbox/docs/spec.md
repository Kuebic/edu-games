# Mailbox

Status: built 2026-09-29, Hidden until tried, from the pitch "a game where we match uppercase and lowercase letters", after the research in [letter-case-matching.md](../../../docs/research/letter-case-matching.md). Vocabulary is in [CONTEXT.md](../CONTEXT.md); decisions in [adr](./adr).

## The problem

The shelf teaches capitals (Find It, My Letter), and the user's three-year-old names hers well. Lowercase letters come later and ride on the capitals: a preschooler who knows a capital is more than 16 times as likely to know its lowercase (Turnbull et al. 2010), and a lowercase letter shaped like its capital (c, o, s) is named about three times as often as one that isn't (a, g, r) (Vinter et al. 2023). Common Core asks for all 26 of each by the end of kindergarten, so there's no rush at three. It's a good next step for a child who knows her capitals.

## The Game

- Slug `mailbox`, name "Mailbox", Category `reading`, Shelf status Hidden until the user has tried it. A Tile of its own: a blue mailbox with its flag up and a letter going in.
- One folder `games/mailbox/` (site ADR 0003), on the shared platform: the shell, `showPractice` (site ADR 0014), `sortRounds` and `askRounds` (site ADRs 0016, 0017), `@shared/progress`, `@shared/grownup` (`levels: false`), `@shared/sound`.
- **No Voice.** The only words are the 26 letter Names, recorded (ADR 0003). Never "capital", "lowercase", "big" or "little".
- **Letters in their own font**, Andika Bold renamed Mailbox Letters, on one baseline at one size (ADR 0002).

## Practice

One Topic, Letters, so no tabs. The picks, each one tap, saved in the Game's slot:

- **Scope**: Aa to Zz. Play waits for two.
- **Ranges**, by how much the lowercase looks like its capital, from the research: Same (c o s v w x z), Close (i j k p u y), Unlike (a e f h m n r t), Tricky (b d g l q), and All. Preschoolers' lowercase naming gets harder in that order (Bowles et al. 2014).
- **Way**: 📬 **Sort** and 🔍 **Find**.
- **New save**: O and S, Sort, every Hint showing.

## Sort

The site's sorting screen with letters.

- **Mailboxes.** As many as the Scope has Letters, up to 3, each Letter once before any again, never two Look-alikes when the Scope has another way (ADR 0004). Each is a blue mailbox side on, all the same blue, a white plate wearing its capital.
- **The Bag.** 8 Cards with 2 Mailboxes, 9 with 3, even per Mailbox, never three in a row for one. Each Card is a lowercase letter.
- **Turn by turn.** The child drags the Card on the Spot into a Mailbox's column in the lower half, or taps a Mailbox. **Right**: it goes in small, a thump and a ding, the Flag stands up, and the first Card into each Mailbox a Round says its Name. **Miss**: a soft bump, back to the Spot, its Name, its own Mailbox glows; the second Miss posts it by itself. A tap on the Card says its Name. **Nudges** at 7 s: the Card wiggles and its Mailbox glows, with its Name from the second.

## Find

- One big Mailbox at the bottom; two or three Cards on the table, one per Letter of the Round, never Look-alikes when the Scope has another way.
- **An Ask.** The plate turns to a capital and the Name is said. The child drags the lowercase Card that goes with it into the Mailbox, or taps it. The Cards change places between Asks. Six Asks a Round.
- **Right**: in it goes, the Flag up, no Name. **Miss**: a bump, the Card goes back, the Mailbox asks again. The second Miss lights the right Card and posts it. A tap on the Mailbox asks again. Nudges: the Mailbox wobbles; from the second the Ask again; from the third the right Card glows.
- With no sound the capital on the plate is the Ask, so Find still plays.

## Hints

An Unlike or Tricky Letter's plate shows its lowercase letter faintly beside the capital (opacity 0.45). After a Round with no Miss on that Letter it fades (0.2); after two it's gone. A Miss brings it back. Saved per Letter. In Find the Hint is on the asking plate, which makes the first Asks the same shape (ADR 0004).

## The end of a Round

Every Flag stands up, the Mailboxes wobble, a little tune, the site's cheer, and a card for the grown-up with the capital and lowercase of one of the Round's Letters: "Find an r in a book together!". Next deals again; Back goes to Practice.

## Grown-up Corner

The site's Sound switch, no Game rows. The note: what the Game teaches, the Ways, the Ranges in order, how Look-alikes and Hints work, and that it only ever says the letter's name.

## Tests

- Rounds: Mailboxes from the Scope, each once before any again, never Look-alikes when avoidable, b and d together when they're the whole Scope; the Bag's size and balance; Find's Asks spread evenly.
- Hints: which Letters have one, how they fade and come back.
- Progress: the slot round-trips Scope, Way and Hints; a damaged slot reads as the new save.
- Every Letter has a Name clip; the font is there.
- Practice: the items, Ranges, Ways, `fewest`.
- Play: a Mailbox pressed takes the Card and raises its Flag, a Miss twice posts it, a Round ends and saves the Hints; Find answered right and wrong.

## Out of scope

Letter sounds (My Letter has them), writing, double-story a and g, capitals into lowercase Mailboxes, and a Range from the child's own name, since that lives in My Letter's Saved progress. The research lists the double-story letters and the reverse direction as the next variations.

## To decide in playtest

- Whether the Hint helps or she just matches the faint letter; whether it fades too fast.
- Whether the mailbox story makes sense to her, and whether she likes the Flag.
- Whether the Names sound right to a person (only speech recognition has heard them).
- Whether Tricky letters should meet their Look-alikes on purpose once she knows them apart.
