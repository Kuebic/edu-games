# Piggy Bank

A phone-first touch game that teaches two to four-year-olds the names of money: the penny, nickel, dime, quarter and the dollar bill. Real photos of each lie at their true sizes. The child drags each one into the piggy bank wearing its picture, or finds the one a pig asks for by name, and a recorded voice says its name as the first of each kind clinks in.

It teaches names, never values: most children can compare what coins are worth only at about six. From the research in [docs/research/toddler-coin-game.md](../../docs/research/toddler-coin-game.md). Vocabulary lives in [CONTEXT.md](./CONTEXT.md); design decisions in [docs/adr](./docs/adr); the spec it was built from in [docs/spec.md](./docs/spec.md).

## Run

From the repo root:

```sh
npm run dev                            # then open /piggy-bank/; serves on your LAN too, for testing on a phone
npx vitest run games/piggy-bank        # the Rounds, Saved progress, the clips and pictures, Practice and play
npm run game piggy-bank words          # fetch and trim the Word clips again (needs ffmpeg)
npm run game piggy-bank pictures       # fetch and cut the photos again (needs ImageMagick 7)
npm run build                          # whole site, into dist/
```

The page is `index.html`; its icons are in `public/`, served at `/piggy-bank/`. The Word clips are in `src/assets/words/` and the photos in `src/assets/pictures/`, credited in [docs/credits.md](./docs/credits.md). Every other noise is a note.

## For grown-ups

The first screen is yours. Tap the money to practise, 1¢ to $1, and a Way:

- 🐷 **Sort** puts out a see-through piggy bank for each kind, with its picture on a tag. The easiest.
- 🔍 **Find** has one pig ask for a coin by name, with two or three to pick from.

Start with the penny and the quarter (**1¢ 25¢**), which differ in color and size. Then the penny and the dime, then the dime and the quarter, then all three (**1¢ 10¢ 25¢**). Add the dollar, and the nickel last: children mix up the nickel and the quarter for years.

Your child drags each coin into its pig, or taps the pig (in Find, taps the coin). In Sort, a wrong pig sends the coin back with a soft bump, says its name and lights up the right pig. In Find, a wrong coin goes back and the pig asks for the same one again. After two misses the right one goes in by itself. Nothing is counted. In Sort, a tap on a coin turns it over to its tails side. When the Round is done the pigs jingle and a card suggests finding that coin together. Keep real coins with a grown-up: they're a choking risk.
