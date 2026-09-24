# Game Shelf

One phone-first site of gentle learning games for little kids, grouped on Shelves by Category: Math, Reading & Writing, Logic, Strategy. It's one Vite build deployed as one static-assets Cloudflare Worker. Install it once with "Add to Home Screen" and every game works offline.

| Game | Shelf | Path |
| --- | --- | --- |
| [Snack Math](src/games/snack-math/README.md) | Math | `/snack-math/` |
| [Push Pals](src/games/push-pals/README.md) | Logic | `/push-pals/` |
| [Traffic Jam](src/games/traffic-jam/README.md) | Logic | `/traffic-jam/` |

Site vocabulary is in [CONTEXT.md](./CONTEXT.md), site decisions in [docs/adr](./docs/adr). Each game has its own README, CONTEXT.md and ADRs next to its code.

## Run

```sh
npm install
npm run dev        # also serves on your LAN, so you can open it on a phone
npm test           # every game's tests
npm run build      # typecheck, then the whole site into dist/
```

## Deploy

```sh
npx wrangler login   # once
npm run cf:dev       # build, then serve the way Cloudflare will
npm run deploy       # build, then wrangler deploy (Worker: edu-games)
```

`public/_headers` caches the hashed bundles in `assets/` for a year; everything else revalidates so updates show up.

## Add a game

1. Code in `src/games/<slug>/`, with a `main.ts` that calls `registerOffline()` from `src/shared/pwa.ts` and shows `homeButton()` from `src/shared/home-button.ts` on its first screen.
2. Page at `<slug>/index.html`, static files in `public/<slug>/` (fetch them as `/<slug>/...`).
3. An entry in `src/hub/catalog.ts` with its Category and Tile picture. The build picks up its page from there.
4. Keep localStorage keys prefixed with the slug. Every game shares one origin.
