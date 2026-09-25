# Way Out

A sliding-block parking-lot puzzle for 4–6-year-olds. Cars and trucks fill a 6 × 6 lot, and each one slides only forward and back along its own line. Move them out of the way until the red car can drive out the Exit. 60 Levels in 5 Packs, from one car in the way (2 Moves) up to walls and gridlock (25 Moves). There's also a bonus Grown-up Pack (26–60 Moves) and a "more like this" button that serves about 200 extra puzzles per Pack. No timer, no move limit, and no way to lose. See `CONTEXT.md` for the vocabulary and `docs/adr/` for why it works this way.

- Play: drag a Vehicle along its line, or tap it and tap an arrow to nudge it one cell. Undo goes back one Move at a time, Reset needs a 1-second hold (and can be undone), and the lightbulb shows and says the next best Move.
- Three Skins: city (cars and trucks), farm (tractors and hay wagons) and space (shuttles and cargo ships). They change the art, the engine sound and the spoken names only.
- Grown-ups: press and hold the gear for 3 seconds for sound, voice, "every level open", the Grown-up Pack, and reset progress.

## Develop

From the repo root:

```sh
npm run dev                            # then open /way-out/
npx vitest run games/way-out           # rules, solver, measures, progress, and every Level and Pool board
npm run game way-out levels            # per-Pack table of difficulty measures; "!" marks a jump
npm run game way-out build 1           # rebuild levels.ts and pools.ts from seed 1 (about 5 minutes)
```

The `build` task needs Michael Fogleman's Rush Hour database, which stays out of the repo (23 MB):

```sh
curl -o games/way-out/scripts/rush.txt.gz https://www.michaelfogleman.com/static/rush/rush.txt.gz
```

- `src/game/board.ts`: the board string, Moves, and the breadth-first solver. No DOM.
- `src/game/measure.ts`: difficulty measures (par, Vehicles, moved, repeats, backing up, blocking depth)
- `src/packs.ts`: each Pack's limits, and the checker the tests and report use
- `src/solver.worker.ts`, `src/hint.ts`: hints solved off the main thread
- `src/board-view.ts`: drawing, drag, nudge, and the drive out
- `src/skins.ts`: Skins, Vehicle colours and their Marks
- `scripts/`: the generator, the database reader, the picker, and the report

## Credits

The easy boards come from our own generator. The rest come from [Michael Fogleman's Rush Hour database](https://www.michaelfogleman.com/rush/). His code ([fogleman/rush](https://github.com/fogleman/rush)) is MIT-licensed, but the database page doesn't state terms. That's fine for family use. Before sharing this more widely, ask him, or switch the build to the generator only. The cheer is from Kenney's Interface Sounds (CC0), as in Traffic Jam. Every other sound is synthesized with Web Audio.
