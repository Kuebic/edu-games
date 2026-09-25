---
status: accepted
---

# One Vite build and one Worker for every game

All games live in one repo and build together with Vite's multi-page mode: the Hub at `/` and each Game at `/<slug>/`, found in `games/` (see 0003). The output deploys as a single static-assets Worker (`edu-games`). One `npm run deploy` ships everything, tests run together, and Games share the shell, the House button and the Shared look without publishing packages. Each Game still keeps its own code, CSS, docs and Saved progress, so games don't change each other's behaviour. We rejected npm workspaces (a package and Vite config per game, plus a merge step) as more setup than a few static games need. We rejected separate Workers per game because that means several deploys and several home-screen installs.
