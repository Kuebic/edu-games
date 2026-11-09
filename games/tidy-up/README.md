# Tidy Up

A phone-first touch game that teaches two to five-year-olds colors, shapes and kinds of things by sorting. A Pile of blocks, toys or shapes sits at the top and two or three Bins stand along the bottom. The child drags each Thing into the Bin it belongs in, or taps the Bin, and a recorded voice says its color or shape as the first of each lands.

It's the Shelf's first Game for two-year-olds, from the research in [docs/research/toddler-sorting-game.md](../../docs/research/toddler-sorting-game.md); Kinds, for three to five, from [toddler-category-sorting.md](../../docs/research/toddler-category-sorting.md) and the spec in [docs/kinds.md](./docs/kinds.md). It plays on the site's sorting screen (`@shared/sort`, site ADR 0016). Vocabulary lives in [CONTEXT.md](./CONTEXT.md); design decisions in [docs/adr](./docs/adr); the spec it was built from in [docs/spec.md](./docs/spec.md).

## Run

From the repo root:

```sh
npm run dev                          # then open /tidy-up/; serves on your LAN too, for testing on a phone
npx vitest run games/tidy-up         # the Rounds, Kinds, Saved progress, the Word clips, Practice and the play screens
npm run game tidy-up words           # fetch and trim the Word clips again (needs ffmpeg)
npm run build                        # whole site, into dist/
```

The page is `index.html`; its icons are in `public/`, served at `/tidy-up/`. The Word clips are the site's, in `src/shared/assets/words/` (site ADR 0018), credited in [docs/word-credits.md](./docs/word-credits.md). Every other noise is a note.

## For grown-ups

The first screen is yours. Pick Colors, Shapes or Kinds; a Round never mixes them, because most three-year-olds can't switch sorting rules partway.

- On **Colors**, 🧱 **Blocks** gives the same toy block in each color, the easiest. 🧸 **Things** gives everyday things, a strawberry, a frog, a banana, to sort by color alone. The pictures under them pick the Bins: buckets or dump trucks.
- On **Shapes**, ⬜ **Plain** makes every shape grey. 🌈 **Colorful** paints them, and your child has to look past the color. Shapes go into a wooden shape-sorter box.

- On **Kinds**, everyday things go into wooden crates by group. Each Step is a set of groups, easiest first: animals and vehicles; food and clothes; toys and clothes; animals, clothes and food; animals and plants; animals, vehicles and plants; birds and fish; fruit and vegetables; mammals and birds. **Easy** turns on the first four. ✅ **Clear** uses only the easy members of each group; 🤔 **Tricky** slips in one odd one a Round, like a penguin, a whale or a tomato. Each crate says its group's name as a Round starts, and a right crate is then only a sound; a tap on a thing says its own name.

Then tap the colors or shapes to sort. Two make two Bins; three or more make three a Round, taking turns. Start with red and blue, or circle and square.

Your child drags each Thing into its Bin, or taps the Bin. A wrong Bin sends it back with a soft bump, says its color and lights up the right Bin; after two, it goes in by itself. Nothing is counted. The first Thing into each Bin says its word; after that a Thing dragged into the right Bin is only a sound, so a word she has just heard isn't said again. A tap on the Thing says its word, and a tap on a Bin says the Bin's word as the Thing goes in, every time. When the Pile is empty the buckets wobble, the trucks drive off or the boxes rattle, and a card suggests something to look for at home. It goes on until Back.

Say the color or shape with your child as each Thing goes in. In the Grown-up Corner (hold the gear for 3 seconds), **Patterns** puts stripes, dots and checks on the colors too, for a child who is color blind.
