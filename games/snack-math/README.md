# Snack Math

A phone-first touch game that teaches a 4-year-old what adding and taking away mean. The child feeds snacks to an animal friend: drag carrots onto Bunny's plate, or tap the ones Bunny eats, then count and pick the number.

Vocabulary lives in [CONTEXT.md](./CONTEXT.md); design decisions in [docs/adr](./docs/adr).

## Run

From the repo root:

```sh
npm run dev                          # then open /snack-math/; serves on your LAN too, for testing on a phone
npx vitest run games/snack-math      # problem generation, answer choices, saved Rounds
npm run build                        # whole site, into dist/
```

The page is `index.html`; its icons are in `public/`, served at `/snack-math/`.

## For grown-ups

The Game opens on the Stage list: six Stages of four Rounds each (+ is adding, − is taking away, ± is both; one row of dots is up to 5, two rows up to 10). Every Stage is open, so pick the one your child is ready for; its Rounds open in order, and Next goes on up the ladder. The Sticker Book is under the Stages.

Press and hold the gear for 3 seconds to open the Grown-up Corner, where you can turn the voice or sounds off, open every Round, see how many Stickers have been earned, or reset progress.
