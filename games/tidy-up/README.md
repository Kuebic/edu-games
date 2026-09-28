# Tidy Up

A phone-first touch game that teaches two and three-year-olds colors and shapes by sorting. A Pile of blocks, toys or shapes sits at the top and two or three Bins stand along the bottom. The child drags each Thing into the Bin it belongs in, or taps the Bin, and a recorded voice says its color or shape as it lands.

It's the Shelf's first Game for two-year-olds, from the research in [docs/research/toddler-sorting-game.md](../../docs/research/toddler-sorting-game.md). Vocabulary lives in [CONTEXT.md](./CONTEXT.md); design decisions in [docs/adr](./docs/adr); the spec it was built from in [docs/spec.md](./docs/spec.md).

## Run

From the repo root:

```sh
npm run dev                          # then open /tidy-up/; serves on your LAN too, for testing on a phone
npx vitest run games/tidy-up         # the Rounds, Saved progress, the Word clips, Practice and the play screen
npm run game tidy-up words           # fetch and trim the Word clips again (needs ffmpeg)
npm run build                        # whole site, into dist/
```

The page is `index.html`; its icons are in `public/`, served at `/tidy-up/`. The Word clips are in `src/assets/words/`, credited in [docs/word-credits.md](./docs/word-credits.md). Every other noise is a note.

## For grown-ups

The first screen is yours. Pick Colors or Shapes; a Round never mixes the two, because most three-year-olds can't switch sorting rules partway.

- On **Colors**, 🧱 **Blocks** gives the same toy block in each color, the easiest. 🧸 **Things** gives everyday things, a strawberry, a frog, a banana, to sort by color alone. The pictures under them pick the Bins: buckets or dump trucks.
- On **Shapes**, ⬜ **Plain** makes every shape grey. 🌈 **Colorful** paints them, and your child has to look past the color. Shapes go into a wooden shape-sorter box.

Then tap the colors or shapes to sort. Two make two Bins; three or more make three a Round, taking turns. Start with red and blue, or circle and square.

Your child drags each Thing into its Bin, or taps the Bin. A wrong Bin sends it back with a soft bump, says its color and lights up the right Bin; after two, it goes in by itself. Nothing is counted. A tap on the Thing says its word. When the Pile is empty the buckets wobble, the trucks drive off or the boxes rattle, and a card suggests something to look for at home. It goes on until Back.

Say the color or shape with your child as each Thing goes in. In the Grown-up Corner (hold the gear for 3 seconds), **Patterns** puts stripes, dots and checks on the colors too, for a child who is color blind.
