---
status: accepted
---

# Letter names from the browser's speech

Every spoken line goes through the site's Voice (`@shared/voice`, site ADR 0010), which uses the browser's speech synthesis: the level's goal line, each letter and number as he picks it up, the running total in sum Levels, and "C, A, T. Cat!" on a spell win. Letters are spoken by name ("see, ay, tee"), not as phonics sounds. Speech synthesis says names well and mangles single phonemes, and phonics would mean recording and shipping a clip per sound. If phonics turns out to matter, recorded clips can replace the Voice without touching the game. The wording of a spell win is the Game's own, in `src/spell.ts`. The speaker button hides in browsers with no speech.

Amended by site ADR 0010: the speech module this Game had (`src/speech.ts`) is now the shared Voice.
