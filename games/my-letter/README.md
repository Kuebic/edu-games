# My Letter

A phone-first touch game that teaches a three-year-old letter names and sounds, starting from spelling their own name and the words a grown-up adds (Mama, Dada, a brother's name). The Voice asks for a letter ("Find the S for Sam!"), the child picks it from three big letters, and the letter says its sound.

Vocabulary lives in [CONTEXT.md](./CONTEXT.md); design decisions in [docs/adr](./docs/adr); the spec it was built from in [docs/spec.md](./docs/spec.md).

## Run

From the repo root:

```sh
npm run dev                          # then open /my-letter/; serves on your LAN too, for testing on a phone
npx vitest run games/my-letter       # Name letters, Choices, the asks, Saved progress
npm run build                        # whole site, into dist/
```

The page is `index.html`; its icons are in `public/`, served at `/my-letter/`. The Letter sound clips are `src/assets/sounds/<letter>.<ext>`, found by file name: a letter with no clip says its name instead.

## For grown-ups

The first time it opens, the Grown-up Corner opens too, so you can type the child's first name, and under it more words for them to spell, between commas: `Mama, Dada, Leo`. Spell them the way your family says them; the voice reads them as you typed them. Close it without one and it won't ask again; press and hold the gear for 3 seconds to open it any time.

There are two groups. My words has a level for each word, the name first: each spells its word a letter at a time from left to right, so Sam is S, then A, then M, and Mama is M, A, M, A. It shows once there's a name or a word. Up to ten more words count, each with at most ten letters. New letters has B, D, K, P, T, V, Z and J, letters whose names start with their sound, the same eight for every child. Levels open in order, and Next goes on to the next one, from My words into New letters.

There are always three letters to pick from, and the other two never look like the one asked for (never B beside D, or M beside W). In My words they're the word's own letters, and the word is shown big with a box for each letter, the letter faint inside so it can be matched even without the voice. A New letters level asks for its letter, then a letter met before (from My words, or an earlier New letter), then its letter again and another met letter, in either order; the letters to pick from are met ones too, so old letters come back. The letter asked for dances when it's found, fills its box, and says its sound ("S says /s/"). One picked by mistake is named ("That's M.") and fades away. There are no scores or timers, and no level can be failed. Tapping the name or the speaker asks again and adds the letter's sound; the question on its own doesn't, so the sound isn't played on every turn. On a device that can't speak, that tap is how to hear it.

The ABC button beside the gear opens the Letter board: every letter A to Z, the name's letters in their own colour. Tap any letter to see it dance and hear its sound. It's free play, so nothing there is saved or finished.

A word added at the end of the more words keeps what's done. Changing the name or a word, or taking one away, starts My words again; New letters stays done. Reset progress keeps the name and the words.

## Letter sounds

One clip per letter, from Curious Learning's [Feed The Monster](https://github.com/curiouslearning/ftm-languagepacks) US English letter sounds (CC BY 4.0 and BSD 2-Clause, Copyright (c) 2020, Curious Learning), trimmed and levelled by a Game task, `npm run game my-letter sounds` (ADR 0001). The source files, licences, copyright notice and what was cut are in [docs/sound-credits.md](./docs/sound-credits.md).
