# Game Shelf

One site of gentle learning games for little kids (ages about 4–6, pre-readers), played on a phone. Each game keeps its own vocabulary in `games/<slug>/CONTEXT.md`; this file covers the site around them.

## Language

**Game**:
One self-contained learning game with its own page at `/<slug>/`. Each one is a folder in `games/`.
_Avoid_: App, activity, module

**Slug**:
A Game's short lowercase name, used in its address and its Saved progress. It is the Game's folder name, and it never changes once the Game has been On.
_Avoid_: id, key

**Saved progress**:
What a Game remembers on the device between visits: Levels done, Stickers, settings. Each Game keeps its own under its Slug, so Games never overwrite each other.
_Avoid_: save file, storage, data

**Category**:
The subject a Game teaches: Math, Reading & Writing, Logic (solo puzzles), or Strategy (played against someone or the computer). Every Game has exactly one.
_Avoid_: Tag, genre, subject

**Shelf**:
A Category as it appears on the Hub: a coloured board holding that Category's Tiles. Shelves with no On Games are left out.
_Avoid_: Section, row, group

**Shelf status**:
Whether a Game is **On** (a Tile on its Shelf), **Hidden** (playable at its address but no Tile) or **Off** (kept, but not published). Every Game has exactly one.
_Avoid_: enabled/disabled, draft, published, shelved

**Tile**:
A Game's big picture button on a Shelf. Only On Games have one. Tiles sit in the order their Games were added, so a familiar Tile never moves. The same picture marks the Game's browser tab.
_Avoid_: Card, icon, link

**Hub**:
The page at `/` showing every Shelf. Every Game has a House button back to it.
_Avoid_: Home page, launcher, menu

**House button**:
The big house picture in every Game that goes back to the Hub.
_Avoid_: home button, back button

**Shared look**:
What every Game draws the same way: the rounded font, the header with the House button, the press-down tool buttons, the Next button, the gear, big tap sizes, notch margins and calm motion. A Game's colours, characters and boards sit inside it.
_Avoid_: theme, skin, frame, design system, house style

**Next button**:
The big round green arrow that appears when a child finishes, and goes on to the next puzzle. It looks the same in every Game.
_Avoid_: continue, play button

**Grown-up Corner**:
A Game's settings for grown-ups, opened by holding the gear for 3 seconds. Words are fine there.
_Avoid_: parent menu, grown-up menu, settings

**Catalog**:
Every Game's entry: name, Category, Tile picture, Shelf status and date added. Each Game carries its own entry in `game.json`, and the Hub and the build both read the Catalog.
_Avoid_: Registry, manifest, game list

**Game task**:
A grown-up tool that belongs to one Game and runs outside the site, such as rebuilding its Levels or printing a level report. Run one with `npm run game <slug> <task>`.
_Avoid_: script, command
