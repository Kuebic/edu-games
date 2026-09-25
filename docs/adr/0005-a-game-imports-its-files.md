---
status: accepted
---

# A Game imports its files; only fixed-address files are public

A Game's sprites and sounds live in `games/<slug>/src/assets/`. CSS reaches them with relative `url()` and TS with ES `import`, so Vite hashes them into `/assets/`, a year-long cache, and a built Game ships only what it uses. `public/` keeps only the Tile picture and the icons the page links, because the Hub and browsers ask for those by a fixed URL. Importing Tiles through `import.meta.glob` was rejected because it bundles Off Games' pictures into the Hub. `new URL(…, import.meta.url)` was rejected for plain files because a missing file only warns. Inlining is off (`assetsInlineLimit: 0`), so every file is one cached, precached file.
