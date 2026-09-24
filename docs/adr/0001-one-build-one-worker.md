---
status: accepted
---

# One Vite build and one Worker for every game

All games live in one repo and build together with Vite's multi-page mode: the Hub at `/` and each Game at `/<slug>/`, listed in `src/hub/catalog.ts`. The output deploys as a single static-assets Worker (`edu-games`). One `npm run deploy` ships everything, tests run together, and games can share small helpers (the house button, offline registration) without publishing packages. Each game still keeps its own code, CSS, docs and localStorage key, so games don't change each other's behaviour. We rejected npm workspaces (a package and Vite config per game, plus a merge step) as more setup than a few static games need. We rejected separate Workers per game because that means several deploys and several home-screen installs.
