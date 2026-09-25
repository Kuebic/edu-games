# Push Pals

Sokoban for a five-year-old. 80 levels in 10 chapters, from two boxes and a few pushes up
to four boxes and a dozen or more. Every level can get stuck, and some chapters need a trick:
pushing a box off a goal, or back the way it came.

- Play: swipe (one swipe = one step) or arrow keys / WASD. `Z` or Backspace undoes, `R` resets, Esc goes to the level list.
- The house button at the top of the level list goes back to the game shelf.

## Develop

From the repo root:

```sh
npm run dev                         # then open /push-pals/; also on your LAN for testing on a phone
npx vitest run games/push-pals      # rules, solver, and every level against its chapter's limits
npm run push-pals:levels            # solver report: pushes, steps, trick, per level
npm run push-pals:generate -- 2 3 8 1 1 20   # candidate levels: boxes minPushes maxPushes forgiving minTurns count [seed]
npm run build                       # whole site, into dist/
```

Levels live in `src/levels.ts`. Each chapter sets its box count and push range, and says whether
every level must need a trick; `levels.test.ts` fails if a level breaks its chapter's limits.
The level scripts are in `scripts/`. Sprites and sounds are in `public/`, served at `/push-pals/`.
Vocabulary is in `CONTEXT.md`.

## Credits

Art and sounds by [Kenney](https://kenney.nl) (CC0): Sokoban pack, Interface Sounds.
