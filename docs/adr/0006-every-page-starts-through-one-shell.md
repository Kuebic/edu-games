---
status: accepted
---

# Every page starts through one shell, and Games save only through it

Each Game's `main.ts` starts with `startGame('<slug>')` from `src/shared/shell.ts`, imported before its own CSS, and the Hub starts with `startPage()`. The shell registers offline, blocks the long-press menu and pinch zoom, calls the Game's audio unlock on every touch, and returns `#app` and the Game's storage. Games never touch `localStorage`. They read and write keys like `v1`, which the shell stores as `<slug>:v1`, so saves made before the shell keep loading, and blocked or full storage never stops play. We did this because the README checklist had already drifted: Push Pals skipped the touch guards, and Push Pals, Traffic Jam and Snack Math could crash or show a blank page when storage was blocked or full. The Slug is passed as a literal, not read from the URL, which could silently switch keys (a page opened as `/games/<slug>/index.html` in dev), nor injected by the build, which would hide the one string that must never change. We rejected a helper that only adds the prefix, because it leaves the parsing and error handling copied in every Game. The Catalog contract test (`src/catalog/catalog.test.ts`) checks that each Game calls `startGame` with its folder name, imports the shell before its CSS, doesn't use `localStorage` or `@shared/pwa` itself, and has a House button.
