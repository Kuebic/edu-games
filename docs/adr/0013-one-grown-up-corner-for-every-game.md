---
status: accepted
---

# One Grown-up Corner for every Game

Every Game's Grown-up Corner is `src/shared/grownup.ts`: the gear that opens it after a 3-second hold, one dialog over whatever screen is up, the site's rows from Saved progress (Sound, Voice where the Game speaks and the browser can, Every level open), a reset that arms on one tap and erases on the next, Done, Escape and focus back to the gear. A Game adds rows of its own, `switchRow` or `choiceRow` (Robot Path's Speed, Way Out's Grown-up pack, Snack Math's Sticker count), and a note in words. Before this, three Games each built a Corner with a toggle pattern of its own and no tests, and Push Pals and Traffic Jam had none: their sound switch was a mute button in the header, so the gear meant nothing there. Now every Game has the same gear in the same places, the level select's tools and the play header, and "hold the gear" is true everywhere. We rejected passing rows as data (a schema of switches and choices) over DOM, because two helpers cover every row a Game has, and a Game with an odd row can still make its own element. `src/shared/grownup.test.ts` covers the dialog in happy-dom; `src/catalog/catalog.test.ts` fails a Game that makes more or fewer than one Corner, a dialog of its own, or a 3-second hold of its own.

Amended: My Letter needed a text box for the child's Name, so `textRow` joined `switchRow` and `choiceRow`. It saves when the box changes or loses focus, not on every key, and the Corner takes focus off it before it closes so a Name typed and then closed with Escape is saved.
