# Find It

A phone-first touch game that teaches little kids to recognise numbers and letters. The child sees some beans, a number, a picture or a letter, and finds the one of three that matches: three beans, so find the 3; a 3, so find the tray with three beans; an apple, so find the A; a B, so find the picture that starts with B.

Vocabulary lives in [CONTEXT.md](./CONTEXT.md); design decisions in [docs/adr](./docs/adr).

## Run

From the repo root:

```sh
npm run dev                          # then open /find-it/; serves on your LAN too, for testing on a phone
npx vitest run games/find-it         # what Practice asks, the choices, the saved picks
npm run build                        # whole site, into dist/
```

The page is `index.html`; its icons are in `public/`, served at `/find-it/`.

## For grown-ups

The Game opens on Practice, a screen for you, with no levels to work through. Pick Numbers or Letters at the top. Then pick which way round: in Numbers, 🫘 → 3 (count the beans and find the number) or 3 → 🫘 (read the number and find the tray of beans); in Letters, 🍎 → A (see a picture and find its first letter) or A → 🍎 (see a letter and find the picture that starts with it); or Mix, which takes turns. Then tap the numbers or letters to practise. Each tap turns one on or off, and a range like A–E or 0–10 turns them all on or off at once, so you can mix A to E with Q, or practise just M. Every pick is one tap, and they're kept for next time. Then press Play.

Each number or letter you picked comes up once, in a shuffled order, before any comes again, and it goes on until you tap Back. Every six there's a cheer. The three to choose from are the ones you picked where there are enough (B, C and D for the picture of a cat when A to E are on), else the nearest letters, and numbers 1 or 2 away. Beans sit in rows of ten, five and five, so numbers past ten can be counted as ten and some more. Trays to choose from are wide bars, one under the other.

A wrong pick is named ("That's 4", "Cat starts with C"), the beans are counted aloud, and the question is asked again. There are no scores or timers, and nothing to fail. Tapping the big picture at the top asks again.

Press and hold the gear for 3 seconds to open the Grown-up Corner, where you can turn the voice or sounds off.
