# Which Way?

A phone-first touch game that teaches a three-year-old what an arrow means: it says where something will go. An Arrow points, and a puppy, ball or car goes that way to its treat. First the child watches, then taps Go to send it, then picks the Arrow that points at the treat.

It fills the gap the first playtest found: Traffic Jam was loved, but its Arrows weren't understood. It also leads into Robot Path's arrow buttons. Vocabulary lives in [CONTEXT.md](./CONTEXT.md); design decisions in [docs/adr](./docs/adr); the spec it was built from in [docs/spec.md](./docs/spec.md).

## Run

From the repo root:

```sh
npm run dev                          # then open /which-way/; serves on your LAN too, for testing on a phone
npx vitest run games/which-way       # the Trips, Saved progress, Practice and the play screen
npm run build                        # whole site, into dist/
```

The page is `index.html`; its icons are in `public/`, served at `/which-way/`. Every noise is a note, so there are no sound files.

## For grown-ups

The first screen is yours. Pick a Way:

- 👀 **Watch**: the Arrow shows and the puppy goes by itself. Point along the Arrow with your finger as it goes.
- 🟢 **Go**: the Arrow shows and your child taps the green Go button to send it.
- 👆 **Pick**: only the treat shows, and your child taps the Arrow at the bottom that points to it. A wrong Arrow sends it the wrong way and back, and the right Arrow glows; after two, the Arrow shows beside it too.

Then pick the Arrows: ←→ first, then ↑↓, then All. The pictures pick what goes: puppy, ball or car (drawn like Traffic Jam's cars). It goes on until Back, with a cheer every five. Left and right as words come later, around five or six, so the Arrow matters more than the word.
