# Push Pals

Sokoban for three- to six-year-olds. 104 levels in 13 chapters. The first three are for a
three-year-old and can't get stuck: one box pushed one way, one box pushed two ways, then two
boxes. From Chapter 4, every level can get stuck, from two boxes and a few pushes up to four
boxes and a dozen or more, and some chapters need a trick: pushing a box off a goal, or back
the way it came.

- Play: swipe (one swipe = one step) or arrow keys / WASD. `Z` or Backspace undoes, `R` resets, Esc goes back to the Chapter's levels.
- The level select: a Chapter's first level is open, and solving a level opens the next. Arrow keys walk the Chapters
  and levels, Esc goes back to the Chapter list, and the House button at its top goes back to the Hub.
- Grown-ups: press and hold the gear for 3 seconds for sound, "Every level open", and reset progress.

## Develop

From the repo root:

```sh
npm run dev                         # then open /push-pals/; also on your LAN for testing on a phone
npx vitest run games/push-pals      # rules, solver, and every level against its chapter's limits
npm run game push-pals levels       # solver report: pushes, steps, trick, per level
npm run game push-pals generate 2 3 8 1 1 20   # candidate levels: boxes minPushes maxPushes forgiving minTurns count [seed]
npm run build                       # whole site, into dist/
```

Levels live in `src/levels.ts`. Each chapter sets its box count and push range, and says whether
every level must be forgiving (can't get stuck), push one way only, or need a trick; `levels.test.ts` fails if a level breaks its chapter's limits.
The level scripts are in `scripts/`. Sprites and sounds are in `src/assets/`.
Vocabulary is in `CONTEXT.md`.

## Credits

Art and sounds by [Kenney](https://kenney.nl) (CC0): Sokoban pack, Interface Sounds.
