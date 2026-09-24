# Traffic Jam

Tap the cars in the right order to clear the streets. 64 levels in 8 chapters for 4–6-year-olds: straight arrows on one or two streets (5–7 cars), then crossings, turns, U-turns, trucks, two-lane streets (keep right), T-junctions, and finally buses with everything mixed (14–15 vehicles on a grid of up to 3 × 4 streets). A car either drives off or bumps and backs up, so there's no way to lose. See `CONTEXT.md` for the vocabulary and `docs/adr/` for why it works this way.

## Develop

From the repo root:

```sh
npm run dev                                # then open /traffic-jam/
npx vitest run src/games/traffic-jam       # rules, routes, the motion track, and every level
npm run traffic-jam:levels                 # vehicles, waves, free-at-start and features per level
npm run traffic-jam:generate -- 1          # rebuild levels.ts from seed 1 (about 1.5 minutes)
```

- `game/level.ts`: streets, lanes, where vehicles may sit
- `game/rules.ts`: routes, what a tap does, and the wave solver
- `game/track.ts`: the rounded line a vehicle drives along, for animation
- `chapters.ts`: each chapter's limits, and the level checker
- `scripts/traffic-jam/`: the level generator and report

## Credits

The engine and horn sounds are synthesized with Web Audio. The level-clear cheer is from Kenney's Interface Sounds (CC0), the same as Push Pals.
