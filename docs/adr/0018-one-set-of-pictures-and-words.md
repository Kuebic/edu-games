---
status: accepted
---

# One set of pictures and Words for every Game

Tidy Up's Kinds sorts everyday things, as emoji, into groups (animals, vehicles, food…), its Colors sorts things of one color, and a recorded clip says each group, each color and each thing's own name: about 120 clips picked from Wikimedia Commons and checked by speech recognition. Go Together wants the same things, the same groups and the same clips, to find which pictures go together. Copying them would have meant 120 files twice and two lists drifting apart, as the sorting screens had (ADR 0016). So the groups, their members, the colors' things and the Word clips are `src/shared/kinds.ts` and `src/shared/assets/words/`, and a Game adds only what is its own: Tidy Up its Steps and shapes, Go Together its Boards. Tidy Up's `words` task still makes the clips, writing to the shared folder, and its `docs/word-credits.md` still credits them, since that is where the sources are known. This is the one place a Game's files live outside its folder (ADR 0005), and `catalog.test.ts` fails a Game that defines its own `GROUP_WORDS` or `COLOUR_THINGS`, or globs a words folder of its own.
