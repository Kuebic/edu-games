---
status: accepted
---

# Browser speech synthesis for all spoken prompts

Every prompt, count, and praise line is spoken with the browser's built-in speech synthesis (Web Speech API) instead of recorded audio files. The player can't read, so voice is required, and synthesis lets any Friend, Snack, or number combination be spoken with no recording work or audio downloads. The cost is that voice quality and available voices differ between phones. All speech goes through one module, so recorded clips can replace it later without touching game logic.

Amended by site ADR 0010: that module is the site's Voice (`@shared/voice`), not this Game's own `src/speech.ts`.
