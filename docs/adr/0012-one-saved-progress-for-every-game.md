---
status: accepted
---

# One Saved progress for every Game

Every Game's Saved progress is `src/shared/progress.ts`: which Levels are done and which have a Sparkle, by Group and Level, the three site switches (Sound, Voice, Every level open), and saving under the Game's key through the shell's storage. A Game keeps a typed slot for what only it saves (a Skin, Drafts, Stickers, a Pool), with its own reader that keeps what still makes sense from a damaged save, and a `legacy` reader that turns a save from before this into the site's parts, so every save that has ever shipped still loads under its key (ADR 0006). The module applies the Sound and Voice switches as it opens and as they change, so no `main.ts` does. Before this, five `progress.ts` files each had a loader, a validator, a done-marker, a marks-builder for the level select and a `levelAfter`, and the Corner's switches had five spellings. ADR 0009 had already made "what is done" the site's rule; now the site keeps it. "Every level open" comes with it, in every Game. We rejected keeping each Game's shape on disk behind accessors, because that leaves five shapes to read and only moves the copies. `src/catalog/catalog.test.ts` fails a Game that opens progress more or less than once, or reads or writes its storage itself.
