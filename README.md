# Game Shelf

One phone-first site of gentle learning games for little kids, grouped on Shelves by Category: Math, Reading & Writing, Logic, Strategy. It's one Vite build deployed as one static-assets Cloudflare Worker. Install it once with "Add to Home Screen" and every Game works offline.

Each Game is one folder in [`games/`](./games), which the build finds on its own, with its own README, CONTEXT.md and, where it has them, ADRs. Site vocabulary is in [CONTEXT.md](./CONTEXT.md), site decisions in [docs/adr](./docs/adr).

## Run

```sh
npm install
npm run dev        # also serves on your LAN, so you can open it on a phone
npm test           # every Game's tests and the site's
npm run build      # typecheck, then the whole site into dist/
npm run game       # list each Game's tasks; run one with npm run game <slug> <task> [args]
```

## Add a Game

1. Copy the Game folder closest to yours and rename it. The folder name is the Slug. It's in the Game's address, `/<slug>/`, and names its Saved progress, so it never changes once the Game has been On.
2. Edit `game.json`: the name, the Category (one of `src/catalog/categories.ts`), the Tile picture (a file in the folder's `public/`), today's date as `added`, and `"shelf": "hidden"` until it's ready for a Tile. Tiles sit in the order their Games were added.
3. Fix `index.html`: the name in `<title>` and `apple-mobile-web-app-title`, a description of its own, the theme colour, the icons (the favicon is the Tile picture), and the script, which is `/games/<slug>/src/main.ts`.
4. Replace the rest with your Game, including the README (headed `# <name>`), CONTEXT.md and any ADRs. Its `src/main.ts` imports `startGame` from `@shared/shell` before anything else and starts with `startGame('<slug>')`. That loads the Shared look ahead of the Game's own CSS, registers offline, blocks pinch zoom and the long-press menu, and returns `#app` and the Game's `storage`. Pass `startGame('<slug>', { unlock })` if its sound needs a touch to start. Save only through that `storage`, with keys like `v1`; the shell stores them as `<slug>:v1` and never throws (ADR 0006). A Game task goes in `scripts/<task>.ts`, with its helpers in `scripts/lib/`.
5. Open it on the level select and draw the rest in the Shared look (ADRs 0007–0009):
   - Its first screen is `showLevelSelect(root, game)` from `@shared/level-select`. Split your Levels into Groups (your word for them: Pack, Chapter, World, Stage) and give it the title, each Group's name for screen readers, colour, badge picture and which of its Levels are done, and a `play(group, level)` callback. It draws the House button, the Group cards, the Level cards with their locks, and the one unlock rule in `@shared/unlock` (every Group open, its Levels in order), so your Game draws none of these.
   - Header buttons go in its `tools`, and your own buttons under the cards in `underList` or `underGroup`. A Game with Sparkles marks them on its Levels, and one with an "Every level open" switch passes `everyLevelOpen`. A Game that says Round, not Level, passes its word as `levelWord` for screen readers.
   - Skins go through its `skins` seam: chips on the Group list, with `paintPage()` for the page colours. A Game without Skins leaves it out.
   - Back and "all levels" in play go to that Group's screen, `showLevelSelect(root, game, group)`, and Next goes where `nextLevel()` says: the next Level, then the next Group.
   - Use `site-screen` for screens, `site-bar` for headers, `site-tool` for header buttons and `site-next` for the Next button, and set colours with `--site-*` tokens in your CSS. Never restyle the level select's own classes. The house picture means only the Hub, so going back inside your Game is a back chevron, and a button to all levels shows a levels grid.
   - A Grown-up Corner opens from a gear held for 3 seconds (`holdToActivate()` from `@shared/hold`) and uses `site-grownup`. Give it `role="dialog"`, so the level select's keys and cards leave it alone, and `aria-modal="true"`, and move focus into it when it opens.
6. Put sprites and sounds in `src/assets/`, and import them in TS (`import cheerUrl from './assets/sounds/cheer.ogg'`) or use a relative `url()` in CSS. The build hashes them into `assets/`. `public/` is only for the Tile picture and the icons `index.html` links, served at `/<slug>/<file>` (ADR 0005). A new file type, say mp3 or webp, also goes in the precache `globPatterns` in `vite.config.ts`, or it won't work offline.
7. Run `npm test` and `npm run build`. The Catalog, page and Shared look tests name anything the copy still gets wrong. When the Game is ready, turn it On.

## Turn a Game on or off

Each Game's `game.json` has a `"shelf"` status:

- `"on"`: a Tile on its Shelf.
- `"hidden"`: built, precached and playable at `/<slug>/`, but no Tile. Use it to try a new Game on a real phone, offline too, before children find it.
- `"off"`: not built or shipped. Its code is still type-checked and tested. To drop a Game for good, delete its folder; git keeps it.

Change the status and deploy. `npm run dev` serves every Game whatever its status, and its Hub shows Hidden and Off Games too, dimmed, with Off ones outlined. `npm run preview` and `npm run cf:dev` show what ships. A Game that goes Off keeps children's Saved progress on their phones, so turning it back On restores it.

## Deploy

```sh
npx wrangler login   # once
npm run cf:dev       # build, then serve the way Cloudflare will
npm run deploy       # build, then wrangler deploy (Worker: edu-games)
```

`public/_headers` caches the hashed bundles in `assets/` for a year; everything else revalidates so updates show up.
