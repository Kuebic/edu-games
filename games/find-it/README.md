# Find It

A phone-first touch game that teaches little kids to recognise numbers and letters. The child sees some beans, a number, a picture or a letter, and finds the one of three that matches: three beans, so find the 3; a 3, so find the tray with three beans; an apple, so find the A; a B, so find the picture that starts with B.

Vocabulary lives in [CONTEXT.md](./CONTEXT.md); design decisions in [docs/adr](./docs/adr).

## Run

From the repo root:

```sh
npm run dev                          # then open /find-it/; serves on your LAN too, for testing on a phone
npx vitest run games/find-it         # what each Round asks, the choices, saved Rounds
npm run build                        # whole site, into dist/
```

The page is `index.html`; its icons are in `public/`, served at `/find-it/`.

## For grown-ups

The Game opens on the Box list. Numbers has two Rounds: 0 to 10, then 11 to 20. Letters has five: A to E, F to J, K to O, P to T and U to Z. Both Boxes are open; a Box's Rounds open in order, and Next goes on to the next one.

Each Round asks six times. In Numbers: count the beans and find the number, or read the number and find the tray of beans. In Letters: see a picture and find its first letter, or see a letter and find the picture that starts with it. A grown-up picks which way round for each Box in the Grown-up Corner, or Mix, which takes turns (the start). The three to choose from are neighbours (2, 3 and 4 for three beans; B, C and D for the picture of a cat), so every Find is about the numbers or letters that Round teaches. Beans sit in rows of ten, five and five, so numbers past ten can be counted as ten and some more. Trays to choose from are wide bars, one under the other.

A wrong pick is named ("That's 4", "Cat starts with C"), the beans are counted aloud, and the question is asked again. There are no scores or timers, and no Round can be failed. Tapping the big picture at the top asks again.

Press and hold the gear for 3 seconds to open the Grown-up Corner, where you can pick which way round Numbers and Letters go, turn the voice or sounds off, open every Round, or reset progress. A new way round starts with the next Round.
