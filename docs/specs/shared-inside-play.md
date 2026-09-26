# What every Game shares inside play: Sound, Saved progress, the Grown-up Corner

Status: landed. ADRs [0011](../adr/0011-one-sound-for-every-game.md), [0012](../adr/0012-one-saved-progress-for-every-game.md) and [0013](../adr/0013-one-grown-up-corner-for-every-game.md) record the decisions; this is the spec they were built from.

## The problem

Around play, the site is a platform: the shell, storage, the unlock rule, the level select, the hold and the Voice are each one deep module, and a Game is a thin adapter to them. Inside play, each of the five Games is its own platform. The same three modules are written five, five and three times, and the copies have drifted the way the three `speech.ts` files had before ADR 0010.

**Sound.** Five engines, each with its own `AudioContext`, unlock and mute flag.

| | Push Pals | Robot Path | Snack Math | Traffic Jam | Way Out |
| --- | --- | --- | --- | --- | --- |
| `new AudioContext()` in a try/catch | no | yes | typeof guard | no | yes |
| plays only while the context is `running` | no | no | yes | no | yes |
| where it unlocks | 4 places | shell | select | shell | shell |
| tone helper | none | `note` | `tone` + `noise` | inline | `tone` |
| the cheer clip | `win.ogg` | synth | synth | `clear.ogg` | `cheer.ogg` |

The three clips are one file (same md5), shipped and precached three times.

**Saved progress.** Five `progress.ts`, each with `loadProgress`/`saveProgress` and a hand-written validator, a `withSolved`/`withCleared`/`withWin`/`recordSolve`, a `solvedIn`/`clearedIn` that builds the level select's marks, a `levelAfter` wrapper around `nextLevel`, and an `isObject` guard. ADR 0009 made "what is done" the site's rule, but every Game still owns the whole shape, so the Grown-up Corner's switches have five spellings (`muted`, `settings.sound`, `save.sound`) and "Every level open" exists in two Games.

**Grown-up Corner.** Three builds (Robot Path and Way Out as dialogs, Snack Math as a screen) with three toggle patterns (`role=switch`, `aria-pressed`, `aria-pressed` + a class), three copies of "tap again to erase", three CSS blocks and no tests. Push Pals and Traffic Jam have no Corner: their sound switch is a mute button in the header. "Hold the gear for 3 seconds" is true in three fifths of the site.

## The decision

Three modules under `src/shared/`, each a deep module a Game adapts to, in the shape ADR 0010 set:

- `@shared/sound`: the engine. A Game keeps its clips and its jingle recipes.
- `@shared/progress`: done Levels, Sparkles, the three site switches, and saving. A Game keeps a typed slot for what only it saves, and a reader for its old saves.
- `@shared/grownup`: the Corner, its gear, and the site's rows. A Game adds rows.

Every Game gets a Corner, with Sound, Voice (where it speaks and the browser can), "Every level open" and reset. Push Pals and Traffic Jam lose their mute buttons to it.

## Interfaces

Documented in the docblocks where they live, so this spec doesn't repeat them:

- [`src/shared/sound.ts`](../../src/shared/sound.ts): `setSoundEnabled`, `unlockAudio`, `audio`, `note`, `clip`, `cheer`, `buzz`, and `createSound(env)` for tests.
- [`src/shared/progress.ts`](../../src/shared/progress.ts): `openProgress(storage, spec)` and the `Progress<G>` it returns: `settings`, `game`, `mark`, `marks`, `finish`, `after`, `set`, `reset`, `save`.
- [`src/shared/grownup.ts`](../../src/shared/grownup.ts): `grownUpCorner(root, progress, spec)`, which gives `gear()` and `open()`, plus `switchRow` and `choiceRow` for a Game's own rows.

## Behaviour

### Sound

- **One context.** Made once, on the first touch, inside a try/catch; resumed on every touch after that while suspended. Nothing plays unless sound is on and the context is `running`: the union of the five checks.
- **The shell unlocks it.** Every Game has sound, so `startGame` calls `unlockAudio` on every `pointerdown` and `keydown`, before the page sees them. A Game passes `unlock` to `startGame` only for the Voice. Push Pals' four unlock calls and Snack Math's `start()` go.
- **Clips.** `clip(url)` returns a play function. The clip is fetched and decoded once the context exists; a play before then is silent. A failed fetch is silent.
- **Notes.** `note({ from, to, at, length, volume, wave })` is Robot Path's helper, the most general of the four: a glide with a quick fade in and out.
- **A Game's own recipes** (Traffic Jam's honk and vroom, Way Out's engine and bump, Snack Math's crunch) call `audio()` for the context and build what they like, as they do now through their `ready()`.
- **The cheer.** `cheer()` plays the site's jingle, `src/shared/assets/cheer.ogg`. The three copies go.
- **Buzz.** `buzz(ms)` vibrates when sound is on. Snack Math already tied the two; Robot Path and Way Out now do too.

### Saved progress

- **One shape on disk.** `{ format: 1, done, sparkle, settings, game }`, where `done` and `sparkle` are each Group's Level indices, `settings` is `{ sound, voice, everyLevelOpen }`, and `game` is the Game's slot. Saved under the Game's existing key, so nothing about ADR 0006 changes.
- **Old saves.** A save without `format: 1` goes through the Game's `legacy(saved)`, which returns the parts it can read; the rest starts fresh. Each Game's old-save tests move to this reader, and every one of them still passes.
- **The Game's slot.** `game.read(raw)` returns a full slot from anything, so a damaged save keeps what still makes sense (Robot Path's rule). `game.reset(slot)` wipes the slot's play data on a reset; Skins and settings-like fields stay.
- **Marks.** `marks(group)` is what the level select draws. A Game with Sparkles says so, and its marks carry them; a Game without gives marks with no `sparkle` key.
- **Finishing.** `finish(group, level, sparkle)` marks the Level done, keeps a Sparkle once earned, saves, and says what was new, for Snack Math's "first time this Stage is finished" praise and Way Out's fresh-Sparkle burst.
- **Next.** `after(group, level)` is `nextLevel` over the spec's `sizes`, which is a function where it can change (Way Out's bonus Pack).
- **The switches apply themselves.** Opening progress sets the Sound and the Voice from the save; `set()` saves and applies. No `main.ts` does this any more.
- **Storage never throws** (ADR 0006), so neither does this.

### Grown-up Corner

- **One dialog** over whatever screen is up: `role="dialog"`, `aria-modal`, labelled "Grown-ups", focus into it on open and back to the gear on close, Escape closes, in `site-grownup` words. The level select already ignores keys and taps under a dialog.
- **The gear.** `gear()` is a `site-tool` that opens the Corner after a 3-second hold, the same picture everywhere. Games put it in the level select's `tools` and their play header.
- **Rows.** Sound; Voice, when the Game says it speaks and `canSpeak`; Every level open; then the Game's rows; then a note in words if the Game has one; then reset.
- **Switches** are `role="switch"` with `aria-checked`, Robot Path's pattern, the one with a knob. `choiceRow` is Robot Path's Speed: buttons with `aria-pressed`.
- **Reset** arms on the first tap ("Tap again to erase everything"), erases on the second, then says "Progress erased" and disables. It calls `progress.reset()`, which keeps settings and the Game's Skin.
- **Closing** calls the Game's `closed()`, for redrawing the level select.

## What each Game changes

Push Pals
- `sound.ts`: five `clip()`s; `play(name)`. The mute flag, context and unlock go; `win.ogg` goes, `cheer()` plays instead.
- `progress.ts`: a spec with `sizes` from `CHAPTERS`, and `legacy` reading `solved` (flat across `FIRST`) and `muted`. `chapterOf` and the flat index helpers stay.
- `select.ts`, `play.ts`: the gear in tools and in the play header; the mute button and `toggleMute` go; `button()` no longer unlocks.
- `main.ts`: `openProgress`, the Corner, no `setMuted`.

Robot Path
- `sound.ts`: `note` and `audio` from the shared module; keeps the Skin flavours.
- `progress.ts`: the slot `{ skin, speed, drafts }`, `legacy` with the version-1 World shift, `reset` wiping drafts. `withDraft`/`withWin`/`levelAfter` become `saveDraft` and `progress.finish`/`progress.after`.
- `parent.ts` goes. The Speed choice is a `choiceRow`.
- `main.ts`, `select.ts`, `play.ts`: the `hooks.progress()/update()` pair becomes the one handle.

Snack Math
- `sfx.ts`: `note` and `audio`; `buzz` from the shared module.
- `progress.ts`: the slot `{ stickers, nextFriend }`, `legacy` reading `rounds` or, before that, `stage`. `finishRound` is `progress.finish(...).done` on the last Round.
- `screens/grownup.ts` goes; the Corner shows "Stickers earned" as a row. `app.grownup` goes.
- `main.ts`: `startGame('snack-math', { unlock: unlockVoice })`; `start()` goes.

Traffic Jam
- `sound.ts`: `celebrate()` plays the shared `cheer()`; `clear.ogg` goes.
- `progress.ts`: a spec with 8 per Chapter; `legacy` reads `cleared` and `muted`.
- `select.ts`, `play.ts`: gear instead of mute.

Way Out
- `sound.ts`: `note` and `audio`; `cheer` shared; `cheer.ogg` goes.
- `progress.ts`: the slot `{ skin, levels: { bestMoves, inProgress }, poolSeen, poolSparkles, grownUp }`; `sizes` counts the shown Packs; `reset` wipes levels and the Pool. `recordSolve`, `recordPoolSolve`, `takePoolPuzzle`, `packSparkles`, `shownPacks` stay over the slot.
- `parent.ts` goes; the Grown-up pack switch is a `switchRow`.

## Guards

`src/catalog/catalog.test.ts`, per Game:
- **plays sound only through the Sound**: no file under `src/` mentions `AudioContext`, `navigator.vibrate` or `decodeAudioData`.
- **saves only through Saved progress**: `src/` calls `openProgress` exactly once, and no file reads or writes `storage` itself.
- **has one Grown-up Corner**: `src/` calls `grownUpCorner` exactly once, and no file mentions `role', 'dialog'` of its own.

`src/shared/look.test.ts`: a Game restyles none of the Corner's classes, as with the level select's.

`src/shared/sound.test.ts`, `progress.test.ts`, `grownup.test.ts` (happy-dom): the behaviour above.

`src/shared/shell.test.ts`: the Sound is unlocked on every touch and key.

## Docs

- ADRs 0011, 0012, 0013. ADR 0006 amended: the shell unlocks the Sound; `unlock` is for the Voice.
- `CONTEXT.md`: **Sound**, **Every level open** (every Game), **Grown-up Corner** (every Game, the same one).
- `README.md` "Add a Game": the three modules.
- Each Game's README and CONTEXT.md where they name `parent.ts`, `grownup.ts` or a mute button.

## Out of scope

- The Done moment (cheer, confetti, Next): still each Game's own. The shared `cheer()` is a clip, not the celebration.
- The play header and its tool buttons.
- A site-wide Sound or Voice setting across Games. Each Game still saves its own under its Slug.
