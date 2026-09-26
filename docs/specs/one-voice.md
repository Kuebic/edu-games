# One Voice for every Game

Status: landed. [ADR 0010](../adr/0010-one-voice-for-every-game.md) records the decision; this is the spec it was built from.

## The problem

Three Games speak through the browser's speech synthesis, and each has its own copy of `src/speech.ts`. The voice-picking code is identical in all three, and every fix since landed in one copy:

| Fix | Robot Path | Snack Math | Way Out |
| --- | --- | --- | --- |
| `canSpeak`, so the Voice switch and speaker button hide where the browser can't speak | yes | no | yes |
| `unlockSpeech()`: a silent line inside a touch, without which iOS never speaks | yes | yes | **no** |
| `say()` resolves when the line ends, with a guard timer for engines that never fire `end` | no | yes | no |
| Hush when the page hides (a locked phone must not keep talking) | no | main.ts | no |
| Pitch | 1.1 | 1.15 | 1.1 |
| `voiceEnabled()` | no | no | yes, unused |

Way Out never unlocks. Its speaker button works because a tap is a gesture, but its other three lines are spoken outside one: the win line after the drive-out animation, the hint line after the solver worker answers, and the first Level's goal line when the screen opens. On iOS Safari those are silent until something has been spoken from a touch, which in Way Out is only ever the speaker button.

## The decision

One module, `src/shared/voice.ts`, imported as `@shared/voice`. Every Game that speaks uses it, and no Game touches `speechSynthesis` itself. The three `speech.ts` files go. Robot Path keeps `spellOut`, which is its own wording, not the Voice.

"Voice" is the site's word for it already: it is the Grown-up Corner switch's label in all three Games. CONTEXT.md gets the term.

## Interface

Five named exports, `canSpeak`, `setVoiceEnabled`, `unlockVoice`, `say` and `hush`, plus `createVoice(synth, page?)` for tests. Each is documented where it lives, in the docblocks of [`src/shared/voice.ts`](../../src/shared/voice.ts), so this spec doesn't repeat them.

Every named export is the default instance's, made by `createVoice(window.speechSynthesis, document)` where those exist and `createVoice(undefined)` in Node.

## Behaviour

- **Voice picking.** English voices only. First match from the preferred list (Samantha, Karen, Moira, Google US English, Microsoft Aria, Microsoft Jenny), else a local en-US voice, else any en-US, else any English, else the engine's default. Picked at creation and again on each `voiceschanged`, since iOS and Chrome fill the list late.
- **The line.** Rate 0.9, pitch 1.1, the picked voice's `lang` or `en-US`. One pitch site-wide: it is one Voice. Snack Math's 1.15 is not audibly different.
- **Kept alive.** The module keeps a reference to the utterance being spoken. Chrome garbage-collects an unreferenced utterance mid-line, and its `end` never fires.
- **Unlock once.** `unlockVoice` speaks a silent (volume 0) space once, whether or not the Voice is on, so a grown-up who turns the Voice on later still gets speech. Robot Path's `spoke` flag moves in here.
- **Hidden page.** When the page hides, the Voice hushes. That listener lives in the module, not in each Game's `main.ts`.
- **No engine.** With no `speechSynthesis`, `canSpeak` is false, `say` resolves at once, and the rest are no-ops. Tests in Node hit this path without stubs.

## What each Game changes

Robot Path
- `main.ts`: `unlock() { unlockAudio(); unlockVoice(); }`, no `spoke` flag.
- `play.ts`, `parent.ts`: import from `@shared/voice`.
- `spellOut` moves to `src/spell.ts` with a test; `play.ts` imports it from there. ADR 0001 points at the new home.
- Delete `src/speech.ts`.

Snack Math
- `screens/select.ts` `start()`: `unlockVoice()`. `screens/select.test.ts` mocks `@shared/voice`.
- `screens/play.ts`, `screens/grownup.ts`, `main.ts`: import from `@shared/voice`. `main.ts` drops its `visibilitychange` listener.
- `screens/grownup.ts`: the Voice toggle hides when `!canSpeak`, as in the other two Games.
- Delete `src/speech.ts`. ADR 0002 points at the shared module.

Way Out
- `main.ts`: `startGame('way-out', { unlock() { unlockAudio(); unlockVoice(); } })`. This is the iOS fix.
- `play.ts`, `select.ts`, `parent.ts`, `main.ts`: import from `@shared/voice`. `voiceEnabled()` had no caller and goes.
- Delete `src/speech.ts`.

Push Pals and Traffic Jam do not speak and do not change.

## Guards

`src/catalog/catalog.test.ts`, per Game:
- **speaks only through the Voice**: no file under `src/` mentions `speechSynthesis` or `SpeechSynthesisUtterance`, and none is named `speech.ts`.
- **unlocks the Voice it uses**: a Game whose code imports `@shared/voice` mentions `unlockVoice` somewhere in `src/` past its import lines, called or passed as the `unlock` to `startGame`. This is the check that would have caught Way Out.

`src/shared/voice.test.ts`, with a fake engine and a stubbed `SpeechSynthesisUtterance`:
- picks Samantha over a later en-GB voice; falls back to local en-US, then any en-US, then any English; re-picks on `voiceschanged`.
- `say` cancels first, then speaks one utterance with the picked voice, rate 0.9, pitch 1.1.
- `say` resolves on `end`, on `error`, and by the guard timer when neither fires.
- `say` is a no-op that resolves at once with the Voice off; turning it off hushes.
- `unlockVoice` speaks one silent line once, even with the Voice off.
- a hidden page hushes.
- no engine: `canSpeak` false, `say` resolves, nothing throws.

## Docs

- `docs/adr/0010-one-voice-for-every-game.md`.
- `CONTEXT.md`: **Voice** under "Inside a Game".
- `README.md` "Add a Game": a Game that speaks uses `@shared/voice` and unlocks it in a touch.
- Robot Path ADR 0001 and Snack Math ADR 0002: amended to name the shared module.

## Out of scope

- Recorded clips instead of synthesis. The module is still the one place to swap.
- A site-wide "Voice off" setting. Each Game saves its own under its Slug, as now.
- The known Chrome quirk where `speak()` straight after `cancel()` sometimes drops the line. Not seen here; revisit with a repro.
