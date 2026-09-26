# My Letter

A phone-first touch game that teaches a three-year-old letter names and sounds, starting from their own name. The Voice asks for a letter ("Find the S for Sam!"), the child picks it from two big letters, and the letter says its sound.

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

The first time it opens, the Grown-up Corner opens too, so you can type the child's first name. Close it without one and it won't ask again; press and hold the gear for 3 seconds to open it any time.

There are two groups. My name has a level for each different letter of the name, in the order they come: Sam gets S, A and M. It shows once there's a name. New letters has B, D, K, P, T, V, Z and J, letters whose names start with their sound, the same eight for every child. Levels open in order, and Next goes on to the next one, from My name into New letters.

A level asks for its letter four times. There are always two letters to pick from, and the other one never looks like it (never B beside D, or M beside W), so it's often a letter met in an earlier level. In My name, the name is shown big with a box where the letter goes. The letter asked for dances when it's found, fills the boxes, and says its sound ("S says /s/"). The other one, picked by mistake, is named ("That's M."), fades away, and the question is asked again. There are no scores or timers, and no level can be failed. Tapping the name or the speaker asks again.

A new name with different letters starts My name again; New letters stays done. Reset progress keeps the name.

## Letter sounds

One clip per letter, freely licensed recordings from the web (ADR 0001), trimmed and levelled by a Game task, `npm run game my-letter sounds`. Where each one comes from, its author and its licence are in [docs/sound-credits.md](./docs/sound-credits.md).
