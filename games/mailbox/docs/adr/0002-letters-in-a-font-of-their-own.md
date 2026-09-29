---
status: accepted
---

# Letters in a font of their own

The site's font is whatever rounded font a device has (`--site-font`), so an a or a g could change shape from a phone to a laptop, and most have the double-story a that children don't write. A Game about what letters look like has to ship its letters. Mailbox draws every letter in Andika Bold, SIL's font for beginning readers: a single-story a and g, a capital I, l and 1 that don't look alike, and a tailed l (its cv39), which we put in the plain l's place so no browser has to turn a feature on.

`npm run game mailbox font` cuts Andika down to its 52 letters, 9 KB. The Open Font License calls that a Modified Version, which may not use the Reserved Font Names, so it's renamed "Mailbox Letters" and the licence ships in docs/. It's loaded through the FontFace API rather than an `@font-face` rule, so the Shared look's check that no Game keeps a font stack of its own still holds, and the page can wait for it.

Every letter is SVG text on a baseline, the capital and the lowercase at one size, so p and q hang below the line and b and d rise above it, a cue besides the mirror. We rejected ABeeZee (one weight), Sassoon (sold, not free) and Playpen Sans (its I and l are the same stroke).
