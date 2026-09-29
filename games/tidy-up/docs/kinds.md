# Tidy Up: Kinds, and one sorting screen for the shelf

Status: built 2026-09-29 (the shared screen first, site ADR 0016; Mammals last; group words plus each Thing's name, ADR 0003). Written 2026-09-29 from the pitch "separate items into categories: animals, home items, plants, slowly harder like mammals vs birds, food vs non-food", after the research in [toddler-category-sorting.md](../../../docs/research/toddler-category-sorting.md). Two parts: first the sorting screen Tidy Up and Piggy Bank each copied becomes one shared module; then Tidy Up gets a third Topic, **Kinds**.

## The problem

Nothing on the shelf teaches what kind of thing something is. Children tell animals from vehicles and plants as small toys from about 9 to 11 months (Mandler & McDonough), but sorting *pictures* by kind is still shaky at 3: in Rosch 1976, 3-year-olds were 99% right matching dog with dog, and only 55% right matching animal with animal (chance 33%); 4-year-olds were 96% right. Hearing a word for the group helps children sort by kind rather than by looks or "goes with" (Waxman). Naming an odd member's group lifted 2-year-olds from 42% to 69% on it (Gelman & Coley 1990). Finer groups come later: 3-year-olds were only 60% right on food groups and 43% on vegetables, where chance was 50% (Nguyen & Murphy 2003). So Kinds is for 3 to 5, and it has to climb from very different groups to close ones.

## Part 1: one sorting screen

Tidy Up's play screen and Piggy Bank's Sort are the same screen twice: a Pile or Purse at the top, a Spot, Bins or Banks along the bottom, one finger dragging (reach, lift, tap slop, first finger owns it), a tap on a Bin, a Miss that glides back and lights the right Bin, a second Miss that goes in by itself, nudges after 7 seconds, a round end with confetti, a card and Next. `binAt` and `bankAt`, `PER_BIN` and `PER_BANK`, `MISSES_BEFORE_HELP` twice. Kinds would make a third. Following the shelf's pattern (Sound, Saved progress, the Grown-up Corner), it becomes one deep module, `src/shared/sort.ts`, with a per-Game adapter.

**What the module owns:** the stage layout, the Pile, the Spot, the Bins row, fingers (grab, drag, drop, tap a Bin, tap the Thing, a keyboard press on a Bin), which Bin a finger let go over, gliding, the Miss rule, nudges, and the round end's confetti, card and Next.

**What a Game gives it:** the next Round (its Bins and Pile), how to draw a Thing, a Bin and a landed Thing, what each Bin is called, and hooks for its sounds and Words (pick up, land, Miss, a tap on the Thing, the round end's own motion) and the card's text and picture.

Tidy Up and Piggy Bank change to adapters with no change in how they play; their play tests keep passing, with only the shared containers' class names changed (`site-sort-*`). A site ADR records it, `catalog.test.ts` fails a Game that keeps its own copy of the finger rules (`binAt`/`bankAt`-style functions or its own `setPointerCapture` sorting loop), and the site CONTEXT.md gets the words Pile, Spot, Bin and Miss.

Piggy Bank's Find Way is not a sort, and stays its own.

## Part 2: the Kinds Topic

A third tab on Tidy Up's Practice, after Colors and Shapes.

### Steps

A Kinds Scope item is a **Step**: a set of groups sorted together. Grown-ups turn Steps on as usual; each Round takes the next Step in turn, each once before any comes again. The Bins are the Step's groups, 2 or 3.

| # | Step | Chip | Bins |
| --- | --- | --- | --- |
| 1 | Animals and vehicles | 🐕🚗 | 2 |
| 2 | Food and clothes | 🍞👕 | 2 |
| 3 | Toys and clothes | 🪀👕 | 2 |
| 4 | Animals, clothes and food | 🐕👕🍞 | 3 |
| 5 | Animals and plants | 🐕🌳 | 2 |
| 6 | Animals, vehicles and plants | 🐕🚗🌳 | 3 |
| 7 | Birds and fish | 🐦🐟 | 2 |
| 8 | Fruit and vegetables | 🍎🥕 | 2 |
| 9 | Mammals and birds | 🐕🐦 | 2 |

Ranges: **Easy** (1 to 4), **All**. A new save starts on Step 1.

The order follows the data where there is some. Step 4 is Waxman & Gelman's 1986 task: 3-year-olds sorted animals, clothing and food into a puppet's three bins at 11.4 of 12 right when told the groups' plural names. The words come in about this order too: "toy", "food" and "animal" are said by most children by 30 months, "clothes" around 3, "plant" and "fruit" nearer 4 and "vegetable" after (Wordbank; Kuperman et al. 2012). So plants come after the first four Steps, and fruit and vegetables near the end.

Changes from the pitch, from the research:

- **No "home things".** It's a place, not a kind, and it invites "goes with" sorting: a pet dog belongs at home. Toys and Clothes take its place.
- **Food vs non-food** is Food and clothes, and Food with animals and clothes, so the other Bin is always a kind too.
- **Birds never sort against "Animals"**, since a bird is an animal; Step 9 says Mammals. "Mammals" is the hardest group word there is: 3 to 5-year-olds sorted by it only 48% right, against 84% for "animal" and 68% for "bird" (Allen 2015). So it's the last Step, for a child who has the rest, and the Bin's pictures carry it.
- **Plants** are a group that looks alike: trees, flowers, cactus. Nothing says "alive"; 4-year-olds leave plants out of "alive".

### Ways

- **Clear** ✅: only textbook members, the easiest.
- **Tricky** 🤔: each Round swaps in one atypical member that still belongs to one of its Bins, such as a penguin or a peacock for Birds, a bat or a whale for Mammals, a shark for Fish, a cactus for Plants, a tomato for Food. It gets the same Miss help as any Thing. Two-year-olds sorted odd members by looks unless their group was named, so a tap on the odd Thing says its group's word, and the note asks the grown-up to say "a penguin is a bird".

A new save starts on Clear.

### Bins

A wooden crate, the same for every group, so the only clue is the kind. On its front a white card shows three small members of the group, drawn from outside this Round's Pile and different each Round; 3-year-olds took a new group word only from two examples or more (Liu et al. 2001).

**The crates say their names first.** In Waxman & Gelman's study, 3-year-olds told the group's name sorted near perfectly (11.4 of 12), and those shown only examples did worse (9.0). So as a Round starts, each crate in turn wiggles and says its Word ("Animals!" … "Clothes!"), before the first Thing hops out. A tap on a crate during that doesn't send anything; after it, a tap sends the Thing as in Colors. There's no place picture (a barn, a kitchen), since those invite "goes with" sorting, and no single picture, which invites matching by looks alone. Kinds has no Skins: painted buckets or trucks would be a second clue.

### Things

Emoji, 8 or 9 a Round as in Colors, drawn from a pool of about 10 to 14 per group so Rounds differ. Full-body animals (🐕 🐄 🐖), not faces (🐶 🐮), because full bodies show legs, feathers and fins. The youngest sort by parts: when animals had wheels and vehicles had legs, 14 to 18-month-olds grouped by the part (Rakison & Butterworth 1998). So in Step 1 animals all have legs and vehicles all have wheels; ✈️ 🚁 ⛵ join in Step 6. Foods are whole, never sliced, which doubled false alarms in a food study (Foinant et al. 2022). The pools as built, checked on Noto; still to check on Apple. A Thing whose name has no clean recording is left out (see Words), which took out 🧩 🪇 🧣 🧁 🕊️ 🧄 🪴 (never recorded), and 🎲 🪁 🫛 (every recording heard as another word). The shark is a Clear fish, as only four fish emoji exist; 🍕 and the sliced fruit (🍉 🥝) are out because slices confuse (Foinant et al. 2022):

| Group | Clear | Tricky (Tricky Way only) |
| --- | --- | --- |
| Animals / Mammals | 🐕 🐈 🐄 🐖 🐑 🐐 🐎 🐇 🐒 🐘 🦒 🐅 🦓 🐁 | 🦇 🐋 🦘 |
| Vehicles | 🚗 🚕 🚌 🚒 🚑 🚓 🚚 🚜 🚲 🚂, and from Step 6 ✈️ 🚁 ⛵ | 🚀 |
| Plants | 🌳 🌲 🌴 🌻 🌷 🌸 🌿 🍀 🌹 | 🌵 |
| Toys | 🪀 🎈 🥁 ⚽ 🏀 🪆 | |
| Clothes | 👕 👖 👗 🧦 🧢 👒 🧤 🩳 👟 🧥 | 🥽 |
| Food | 🍞 🧀 🍌 🍎 🍪 🥛 🥨 🍝 🥞 🥐 🍓 🍇 | 🍅 |
| Birds | 🐦 🐓 🦆 🦉 🦅 🦜 🦢 🦃 🐤 | 🐧 🦩 🦚 |
| Fish | 🐟 🐠 🐡 🦈 | |
| Fruit | 🍎 🍐 🍊 🍋 🍌 🍇 🍓 🫐 🍒 🍑 🥭 🍍 | |
| Vegetables | 🥕 🥦 🥬 🥒 🧅 🥔 | 🍆 |

Left out everywhere: people, dinosaurs, dragons and unicorns, insects, 🧸 (an animal and a toy), 🍄, 🥑, 🌽, peppers, eggs, meat and fish dishes, and toy-like vehicles (🏎️ 🛝). No Step pairs Toys with Vehicles, where a car could be a toy car. Fish has only four emoji, so Birds and fish shows every fish each Round.

A test checks that within each Step no Thing sits under two of its groups (🍎 is Food in Step 2 and Fruit in Step 8, never both in one Step), and that each group's pool fills its Bins.

### Words

The group's plural or mass word: "Animals", "Vehicles", "Plants", "Toys", "Clothes", "Food", "Birds", "Fish", "Fruit", "Vegetables", "Mammals". Plural, as in the study, where even plural words the children didn't know helped. Each crate says it as the Round starts. A Thing landing in its crate is only a sound: the user found the crate saying its name again on every right drop annoying (ADR 0004).

**Each Thing's own name** is a clip too ("dog", "penguin"). Parents teach group words by tying them to the everyday name ("a dog is an animal"; Callanan 1985), and naming an odd member's group is what lifted 2-year-olds on it (Gelman & Coley 1990). So:

- **A tap on a Thing** says its name ("Penguin").
- **After a Miss**, its name, then its own group's word ("Penguin" … "Birds"), and its own crate glows. Never the wrong crate's word.
- **Landing** says nothing: the crate said its name as the Round opened.

A Thing with no clean recording of its name is left out of the pools: `sounds.test.ts` fails a Thing with no name clip. The name clips are one speaker where possible, and each is checked by speech recognition like the rest.

Grendelkhan, who says Colors' words, recorded animals, plants, toys, clothes, food, birds, fish and fruit (CC0). "Vehicles" and "vegetables" have other Lingua Libre or Wiktionary speakers, and "mammals" may need Wiktionary's "mammal" or another speaker. `npm run game tidy-up words` gains them, each is checked by speech recognition, and `docs/word-credits.md` credits them.

### The end of a Round

The crates bounce their Things and the site's cheer plays. The card for the grown-up: "Find something that's a plant at home!", "Name another bird!", with one of the Round's groups.

### Grown-up Corner

No new rows. Patterns stay Colors-only. The note gains a paragraph on Kinds, with the one feature that decides each finer group: birds have feathers, fish have fins, mammals have fur. It also asks the grown-up to join the names, the way parents teach these words: "a dog is an animal", "all of these are animals". "Vehicles" is a word children almost never hear (21 times in 1.3 million utterances to children; Choe & Papafragou 2025), but unknown plural words still helped 3-year-olds sort, so it stays. Four and 5-year-olds learned a group defined by one feature only when they were told it (Kloos & Sloutsky 2008), and single-word clips can't tell it, so the grown-up does.

## Tests

- Part 1: the shared module's finger rules and Miss rule, tested once in `src/shared/sort.test.ts` in happy-dom (moved from the two Games). Tidy Up's and Piggy Bank's play tests pass unchanged. The catalog guard.
- Kinds: Steps come round from the Scope; a Round has the Step's Bins and 8 or 9 Things; no Thing is under two groups in one Step; Tricky swaps in exactly one atypical member; Bin cards never show a Thing from the Pile.
- Saved progress: the Kinds Scope and Way round-trip; an old save reads with Step 1 and Clear.
- Every group has a Word clip.

## Out of scope

A spoken reason ("it has feathers"), sorting by where things live, Furniture, insects, and a Kinds Game of its own.

## To decide in playtest

- Whether a 3-year-old sorts animals and vehicles from emoji, given Rosch's 55%, and whether the Word lifts it.
- Whether the three pictures on a crate get looked at, or the child needs the Word to know the crate.
- Whether Tricky's one odd Thing is fun or discouraging.
- Whether a feature Word ("feathers", "fins", "fur") after a Miss in Steps 7 and 9 would help. It's untested, and left out for now.
