# Snack Math

A phone-first touch game that teaches a 4-year-old what adding and taking away mean. The child feeds snacks to an animal friend: drag carrots onto Bunny's plate, or tap the ones Bunny eats, then count and pick the number.

Vocabulary lives in [CONTEXT.md](./CONTEXT.md); design decisions in [docs/adr](./docs/adr).

## Run

From the repo root:

```sh
npm run dev                          # then open /snack-math/; serves on your LAN too, for testing on a phone
npx vitest run src/games/snack-math  # problem generation, answer choices, stage progress
npm run build                        # whole site, into dist/
```

The page is `snack-math/index.html`; its icons are in `public/snack-math/`.

## For grown-ups

Press and hold the gear on the home screen for 3 seconds to open the Grown-Up Corner, where you can pick the stage, turn the voice or sounds off, or reset progress.
