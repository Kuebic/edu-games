# Game Shelf

One site of gentle learning games for little kids (ages about 4–6, pre-readers), played on a phone. Each game keeps its own vocabulary in `src/games/<slug>/CONTEXT.md`; this file covers the site around them.

## Language

**Game**:
One self-contained learning game with its own page at `/<slug>/` (Snack Math, Push Pals, Traffic Jam).
_Avoid_: App, activity, module

**Category**:
The subject a Game teaches: Math, Reading & Writing, Logic (solo puzzles), or Strategy (played against someone or the computer). Every Game has exactly one.
_Avoid_: Tag, genre, subject

**Shelf**:
A Category as it appears on the Hub: a coloured board holding that Category's Tiles. Shelves with no Games are hidden.
_Avoid_: Section, row, group

**Tile**:
A Game's big picture button on a Shelf.
_Avoid_: Card, icon, link

**Hub**:
The page at `/` showing every Shelf. Every Game has a house button back to it.
_Avoid_: Home page, launcher, menu

**Catalog**:
The list of Games and Categories in `src/hub/catalog.ts`; the Hub and the build both read it.
_Avoid_: Registry, manifest
