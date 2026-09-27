# My Letter

Status: agreed 2026-09-25 in a design interview. Vocabulary is in [CONTEXT.md](../CONTEXT.md); decisions in [adr](./adr). Changed on 2026-09-27 after the first play with a child (ADR 0003): My name is one Level that spells the Name, every Find has three Choices, New letters Levels mix in Met letters, and only a tap on the prompt plays the Letter sound with the ask. Changed again on 2026-09-27 (ADR 0004): the Group is My words, a Spell of the Name and then of each Word a grown-up adds. Where this spec says otherwise, CONTEXT.md and the ADRs win.

## The problem

Game Shelf has nothing for a three-year-old who doesn't know letters yet. Find It's Letters Box asks for all 26 letters, three at a time, some of which look alike, and never says a letter's sound. A three-year-old's first letters are the ones in their own name, and they learn best from two choices that look nothing alike and a reward that is the letter itself.

## The Game

- Slug `my-letter`, name "My Letter", Category `reading` (Reading & Writing), Shelf status On, added 2026-09-25. A Tile picture of its own (a big capital on a name tag, in the Game's colours).
- One folder `games/my-letter/` like the other Games (ADR 0003): `game.json`, `index.html`, `README.md`, `CONTEXT.md`, `docs/`, `public/` (Tile and icons only), `src/`, `src/assets/sounds/` (Letter sound clips, imported per ADR 0005).
- Built on the shared platform like every Game: the shell, `showLevelSelect`, `@shared/progress`, `@shared/grownup`, `@shared/voice`, `@shared/sound` (clips, cheer), the Next button. `src/catalog/catalog.test.ts` and `src/shared/look.test.ts` must pass for it.

## Groups and Levels

- Group 0 **My name**: a Level per Name letter (the Name's different letters in first-appearance order). With no Name its size is 0 and the level select leaves it out; it is still Group 0, so New letters is always Group 1 and its saves never move.
- Group 1 **New letters**: B D K P T V Z J in that order, always all eight.
- A Level's card shows its letter, if the shared level select allows a label; otherwise its number.
- Levels open in order within a Group (ADR 0009 of the site). Every level open works.

## The Name

- The Grown-up Corner gets a Name row: a text box, labelled "Child's first name". This is a new shared helper, `textRow(label, get, set)`, in `src/shared/grownup.ts` beside `switchRow` and `choiceRow`, tested in `grownup.test.ts`. It saves on change/blur, not on every key.
- Kept as typed (trimmed) for the Voice. Letters for play: strip accents (NFD, drop marks), keep A–Z, uppercase, first 10. A Name with no letters counts as no Name.
- Saved in the Game's slot of Saved progress. A reset leaves it (it's a setting, like Find It's Way).
- When the Name changes to one with different letters, My name's Done marks are cleared; New letters' stay (ADR 0002). The Group list redraws when the Corner closes.
- First open with no Name and no Name ever skipped: the Corner opens by itself so a grown-up can type one. Closing it without a Name records the skip in the slot, so it doesn't pop up again.

## A Level

A Level is four Finds of its letter, then the site's cheer and Next button. No scores, timers or failing.

**The ask.** The Voice says:
- My name, first letter of the Name: "Find the S for Sam!"
- My name, other letters: "Find the A in Sam!"
- New letters: "Find the B!"

Every ask then plays the letter's Letter sound clip, when it will be heard (its `ready()`). With no speech engine the child still hears the letter.

Say letter names so speech engines read them as the letter, not a word or a sound (Find It already speaks letters; reuse whatever it does).

**On screen**, above the Choices:
- My name: the **Name line**, the Name's capitals big, with an empty box wherever the asked-for letter goes (SAM asking S shows `_AM`; ANNA asking A shows `_NN_`). Letters of later Levels show normally.
- New letters: a big speaker picture.
- Tapping the Name line or speaker says the ask again, Letter sound and all. The ask after a Fade is the same.

**Choices.** Two big letter buttons, side by side in portrait, capitals in the site's rounded font. One is the Level's letter. The other:
1. never Looks alike the target (families: B P R D, C G O Q, E F, M N W, U V Y, I L T J, K X), and is never the target;
2. is a Met letter (a letter of an earlier Level in play order: My name's Levels, then New letters) when any qualifies, picked at random among them, not the same as the previous Find's other Choice when there's a choice;
3. else any other capital that qualifies.
The target's side is random, but never the same side more than twice in a row. All of this lives in a pure, tested module with an injectable random source.

**Right pick.** The letter dances (a bounce/wiggle in calm motion), the Name line's blanks fill with it, the Voice says "S says", then the Letter sound clip plays. The next Find starts after the clip ends (or a short pause if there's no clip or sound is off). After the fourth, cheer + Next.

**Wrong pick (Fade).** The wrong letter wobbles, the Voice says "That's M.", it fades out and can't be tapped again, then the Voice repeats the ask. The next tap can only be right.

Input is ignored while a line or clip is playing, so a child can't tap through.

## Letter board

Free play, opened by an ABC tool button beside the gear on the Group list. A header with Back to the Group list and the gear, then every capital A to Z in order as big letter buttons in the Choices' look: 4 across in portrait, 9 across on its side, the last row centred, no scrolling on a phone. The Name letters have their own colour.

A tap makes the letter dance, and the Voice says "The letter B says" and the Letter sound clip plays, or only "That's the letter B!" when the clip won't be heard (ADR 0001). A new tap never waits: it cuts off the last line and starts its own. No lock, Done, Saved progress, Next or cheer.

Under the letters, a wide song button (quavers and "ABC") sings the ABC song (added 2026-09-27, ADR 0005): a recording of a girl singing, `src/assets/abc-song.mp3`, made by `npm run game my-letter song`. Each letter lights up in sun and shakes as it's sung, following the times in `src/song.ts` and the clip's own clock; at "Now I know my ABCs" every letter dances. While it sings the button turns coral with a stop square, and a tap stops it. A tap on a letter stops it too and plays that letter as usual; leaving the board stops it. With sound off the letters still go along on the clock, silently.

## Letter sounds

- One clip per letter A–Z: `src/assets/sounds/<letter>.<ext>` (lowercase letter, ogg/opus or mp3; whatever the Sound's decoder handles on iOS too — check what Push Pals / Way Out ship). One sound each: short vowels (a as in apple, e egg, i igloo, o octopus, u up), hard C /k/, hard G /g/, X /ks/, Q /kw/, Y /j/ as in yes. As clean as possible: no added vowel after a stop if avoidable.
- Freely licensed recordings from the web (ADR 0001), credited in the README with source, author and licence.
- A Game task `npm run game my-letter sounds` takes raw downloads from a folder and trims silence, levels loudness and encodes with ffmpeg. The raw folder isn't shipped.
- A letter with no clip: after "S says" nothing plays — instead the Voice says "That's S!" as the found line. Code decides this from which clips exist, not a hand list.

## Tests

- Name → Name letters (dedupe, order, accents, non-letters, cap of 10, empty).
- Choices: never a Look-alike, never the target, prefers Met letters, falls back, sides rule, deterministic with a seeded random.
- Asks: the three wordings.
- Letter board: A to Z in order, the Name letters marked; its button on the Group list only.
- ABC song: a time for each of the 26 letters, in order, before "Now I know" and the song's end; the letters sung by a moment. Shared `Clip.stop()` and `time()`: in `sound.test.ts`.
- Progress: New letters is Group 1 whatever the Name; a changed Name clears Group 0's Done only; reset keeps the Name.
- Shared `textRow`: in `grownup.test.ts`.
- Catalog/look guards pass.

## Out of scope

Lowercase letters, writing/tracing, pictures for New letters, sharing the clips with Find It (move them to `src/shared` when a second Game needs them), recording a grown-up's voice.
