# Game Shelf

One phone-first site of gentle learning games for little kids, grouped on Shelves by Category: Math, Reading & Writing, Logic, Strategy. It's one Vite build deployed as one static-assets Cloudflare Worker. Install it once with "Add to Home Screen" and every game works offline.

Each Game is one folder in [`games/`](./games), with its own README, CONTEXT.md and ADRs. Site vocabulary is in [CONTEXT.md](./CONTEXT.md), site decisions in [docs/adr](./docs/adr).

## Run

```sh
npm install
npm run dev        # also serves on your LAN, so you can open it on a phone
npm test           # every game's tests
npm run build      # typecheck, then the whole site into dist/
npm run game       # list each Game's tasks; run one with npm run game <slug> <task> [args]
```

## Deploy

```sh
npx wrangler login   # once
npm run cf:dev       # build, then serve the way Cloudflare will
npm run deploy       # build, then wrangler deploy (Worker: edu-games)
```

`public/_headers` caches the hashed bundles in `assets/` for a year; everything else revalidates so updates show up.

## Add a game

Each Game is one folder in `games/`, and the build finds it there.

1. Copy the Game folder closest to yours and rename it. The folder name is the slug. It's in the Game's address, `/<slug>/`, and in its saved progress, so it never changes once the Game has been On.
2. Edit `game.json`: the name, the Category (one of `src/catalog/categories.ts`), the Tile picture (a file in the folder's `public/`), today's date as `added`, and `"shelf": "hidden"` until it's ready for a Tile. Tiles sit in the order their Games were added.
3. Fix `index.html`: the title, description, theme colour and icons, and the script, which is `/games/<slug>/src/main.ts`.
4. Replace the rest with your Game. Its `src/main.ts` calls `registerOffline()` from `@shared/pwa` and shows `homeButton()` from `@shared/home-button` on its first screen. A Game task goes in `scripts/<task>.ts`, with its helpers in `scripts/lib/`. Prefix localStorage keys with the slug, since every Game shares one origin.
5. Put sprites and sounds in `src/assets/`, and import them in TS (`import cheerUrl from './assets/sounds/cheer.ogg'`) or use a relative `url()` in CSS. The build hashes them into `assets/`. `public/` is only for the Tile picture and the icons `index.html` links, served at `/<slug>/<file>` (ADR 0005). A new file type, say mp3 or webp, also goes in the precache `globPatterns` in `vite.config.ts`, or it won't work offline.
6. Run `npm test`. The Catalog and page tests name anything the copy still gets wrong.

## Turn a Game on or off

Each Game's `game.json` has a `"shelf"` status:

- `"on"`: a Tile on its Shelf.
- `"hidden"`: built, precached and playable at `/<slug>/`, but no Tile. Use it to try a new Game on a real phone, offline too, before children find it.
- `"off"`: not built or shipped. Its code is still type-checked and tested. To drop a Game for good, delete its folder; git keeps it.

Change the status and deploy. `npm run dev` serves every Game whatever its status, and its Hub shows Hidden Tiles dimmed and Off Tiles dashed. `npm run preview` and `npm run cf:dev` show what ships. A Game that goes Off keeps children's saved progress on their phones, so turning it back On restores it.
