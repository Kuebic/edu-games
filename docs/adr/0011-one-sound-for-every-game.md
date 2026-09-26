---
status: accepted
---

# One Sound for every Game

Every Game makes its noises through `src/shared/sound.ts`: one Web Audio context, made on the first touch and resumed while suspended, a switch, clip decoding, a note helper, the site's cheer jingle and a buzz. A Game keeps its clips and its own recipes (an engine, a honk, a crunch), which ask the Sound for the context and get it only while sound is on and the context is running. The shell unlocks the Sound on every touch and key press for every Game, since every Game has sound; `unlock` on `startGame` is for the Voice (amends ADR 0006). Before this, five Games each kept a context, an unlock and a mute flag, and they disagreed: two made the context without a try/catch, three played into a suspended context, Push Pals unlocked in four places, and the same cheer clip shipped three times under three names. We rejected leaving recipes out of the Games (one shared jingle set) because each Game's sounds are part of its world, like its art (ADR 0007). Sound off also stops the buzz, as Snack Math already had it. `src/catalog/catalog.test.ts` fails a Game that touches `AudioContext`, `decodeAudioData` or `vibrate` itself.
