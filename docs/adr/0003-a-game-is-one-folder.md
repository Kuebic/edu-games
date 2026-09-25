---
status: accepted
---

# A Game is one folder, found by the build

Each Game's code, page, public files, tasks, docs and Catalog entry live in `games/<slug>/`, and the build finds Games by scanning that folder. Adding or removing a Game means adding or deleting one folder, where before it took edits in nine places. The entry is JSON (`game.json`) rather than TypeScript, so the Node-side build can read it without importing browser code or loading TypeScript at runtime. A Vite plugin (`src/catalog/plugin.ts`) serves each page at `/<slug>/` and copies its public files there, so URLs, installed icons and Saved progress didn't change. We rejected changing Vite's `root`, because the Hub can't share it, and npm workspaces (see 0001).
