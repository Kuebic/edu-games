# Game Shelf

One site of gentle learning games for little kids (ages about 4–6, pre-readers), played on a phone. Each Game keeps its own vocabulary in `games/<slug>/CONTEXT.md`; this file covers the site around them.

## Language

### Games

**Game**:
One self-contained learning game with its own page at `/<slug>/`. Each one is a folder in `games/`.
_Avoid_: App, activity, module

**Slug**:
A Game's short lowercase name, used in its address and its Saved progress. It is the Game's folder name, and it never changes once the Game has been On.
_Avoid_: id, key

**Catalog**:
Every Game's entry: name, Category, Tile picture, Shelf status and date added. Each Game carries its own entry in `game.json`, and the Hub and the build both read the Catalog.
_Avoid_: Registry, manifest, game list

**Shelf status**:
Whether a Game is **On** (a Tile on its Shelf), **Hidden** (playable at its address but no Tile) or **Off** (kept, but not published). Every Game has exactly one.
_Avoid_: enabled/disabled, draft, published, shelved

**Saved progress**:
What a Game remembers on the device between visits, through one module every Game shares (`@shared/progress`): which Levels are Done and have Sparkles, the Grown-up Corner's switches, and in the Game's own slot what only it saves, such as Stickers or a Skin. Each Game keeps its own under its Slug, so Games never overwrite each other.
_Avoid_: save file, storage, data

**Game task**:
A grown-up tool that belongs to one Game and runs outside the site, such as rebuilding its Levels or printing a level report. Run one with `npm run game <slug> <task>`.
_Avoid_: script, command

### The Hub

**Hub**:
The page at `/` showing every Shelf. Every Game has a House button back to it.
_Avoid_: Home page, launcher, menu

**Category**:
The subject a Game teaches: Math, Reading & Writing, Logic (solo puzzles), or Strategy (played against someone or the computer). Every Game has exactly one.
_Avoid_: Tag, genre, subject

**Shelf**:
A Category as it appears on the Hub: a coloured board holding that Category's Tiles. Shelves with no On Games are left out.
_Avoid_: Section, row, group

**Tile**:
A Game's big picture button on a Shelf. Only On Games have one. Tiles sit in the order their Games were added, so a familiar Tile never moves. The same picture marks the Game's browser tab.
_Avoid_: Card, icon, link

### Inside a Game

**Shared look**:
What every Game draws the same way: the rounded font, the header with the House button, the press-down tool buttons, the level select, the Next button, the gear, big tap sizes, notch margins and calm motion. A Game's colours, characters and boards sit inside it.
_Avoid_: theme, skin, frame, design system, house style

**House button**:
The house picture at the top left of a Game's Group list. It always goes to the Hub, and nothing else in a Game shows a house.
_Avoid_: home button, back button

**Next button**:
The big round green arrow that appears when a child finishes a Level, and goes on to the next one, or to the next Group after a Group's last. It looks the same in every Game.
_Avoid_: continue, play button

**Grown-up Corner**:
A Game's settings for grown-ups, opened by holding the gear for 3 seconds: the same dialog in every Game (`@shared/grownup`), with the Sound, Voice and Every level open switches, the Game's own rows, and reset. Words are fine there.
_Avoid_: parent menu, grown-up menu, settings

**Level**:
One puzzle, or Round, that a child starts from a Group screen. Each Game has its own kind.
_Avoid_: stage, puzzle (in site talk)

**Group**:
A run of Levels at one difficulty, easiest first. Each Game has its own word: Pack (Way Out), Chapter (Push Pals, Traffic Jam), World (Robot Path), Stage (Snack Math). Every Group is always open.
_Avoid_: set, tier, section

**Done**:
A Level the child has finished at least once: Solved, Cleared, a Win, a finished Round.
_Avoid_: complete, passed

**Open**:
A Level the child may start. A Group's first Level is open, each next one opens when the one before it is done, and a done Level stays open.
_Avoid_: unlocked, available

**Every level open**:
A Grown-up Corner switch that opens every Level. Every Game has it.

**Level select**:
The two screens a Game opens on, drawn the same in every Game: the Group list and a Group screen.
_Avoid_: level picker, map, menu

**Group list**:
A Game's first screen: the House button, Skin chips if it has Skins, and a card per Group with its badge, done dots and Sparkles if it has them.

**Group screen**:
One Group's Levels as numbered cards: done ones filled and ticked, the next one open, later ones locked.

**Sparkle**:
A mark for doing a Level especially well: in the fewest Moves (Way Out) or with a Program no longer than Par (Robot Path). It shows on the Level's card and is counted on its Group's card. Games without Sparkles show none.
_Avoid_: star, bonus, score

**Skin**:
A picture set a child picks from the chips on the Group list. It changes looks and sounds, never the Levels. Robot Path and Way Out have Skins.
_Avoid_: theme

**Voice**:
What a Game says aloud, in the browser's own speech, through one module every Game shares (`@shared/voice`). A Grown-up Corner switch turns it off; it hides where the browser can't speak. Robot Path, Snack Math and Way Out have a Voice.
_Avoid_: speech, TTS, narration

**Sound**:
Every noise a Game makes, through one module every Game shares (`@shared/sound`): its clips, its notes, the cheer and the buzz. The shell starts it on the first touch. A Grown-up Corner switch turns it off.
_Avoid_: audio, sfx, sound effects (in site talk)
