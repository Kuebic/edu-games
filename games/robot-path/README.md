# Robot Path

A programming puzzle for 4-5-year-olds. He taps arrows into a Program, presses Go, and watches the robot run it on a grid. 64 levels in 8 Worlds: arrows, collecting gems, letters and numbers, three Worlds of twisty paths and mazes (stairs, snakes, going the long way round, two ways to the flag, dead ends, side pockets, spirals), the Repeat Block, fixing Bip's broken Programs (plus crates and sums), and robot-relative turns. A bonk is a silly boing and the Program stays put, so there's no way to lose. See `CONTEXT.md` for the vocabulary and `docs/adr/` for why it works this way.

## Develop

From the repo root:

```sh
npm run dev                             # then open /robot-path/
npx vitest run games/robot-path         # engine, editor, progress, and every level through the validator
npm run game robot-path levels          # the validator: checks every level, prints each World's difficulty knobs
```

- `src/game/engine.ts`: the rules. `run(level, program)` returns a Trace of Steps; no DOM
- `src/game/solver.ts`: breadth-first search for the shortest plain Program (Par in worlds 1-5)
- `src/game/check.ts`: the level validator
- `src/game/editor.ts`: tap-only Program editing (add, replace, delete, Repeat Block bodies)
- `src/levels/world-N.json`: the hand-made levels, one file per World
- `src/board.ts`: draws the grid as SVG and plays a Trace back as animation
- `src/play.ts`, `src/home.ts`, `src/parent.ts`: the screens
- `src/skins.ts`: the three Skins' art, drawn in code

A new level goes in its World's JSON file. `npm run game robot-path levels` shows what's wrong with it, and for worlds 1-5 the solver tells you the Par.

## Credits

All art is SVG drawn in `src/skins.ts` and `src/icons.ts`. All sounds are synthesized with Web Audio. Speech is the browser's own voice.
