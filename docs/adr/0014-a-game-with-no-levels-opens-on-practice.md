---
status: accepted
---

# A Game with no Levels opens on Practice

Amends 0008. Some learning isn't a path. Knowing which letter an apple starts with, or which tray has seven beans, comes from going over the same few things again and again, and a grown-up wants to say which few: A to E this week, or just the letters she keeps mixing up. Find It's Rounds made that a path of six-Find Levels in fixed fives, and its Way (pictures to letters, or letters to pictures) sat in the Grown-up Corner behind a 3-second hold, which the user found tedious to change as often as they wanted to. So a Game with no Levels opens on Practice, `src/shared/practice.ts`: the House button, a tab per Topic, the Way chips, the Range chips (A–E, 0–10, All), every item as a button that turns it on or off, and Play. Each is one tap and open to anyone, since the user wanted it quick more than child-proof; the Scope is on screen for a grown-up to see if a child changes it. The Game saves the picks in its slot of Saved progress and plays for as long as the child likes. A Practice Game's Grown-up Corner passes `levels: false`, so it has no "Every level open" and no reset, as there's nothing done. We rejected Practice as one more Group on the level select, which keeps Levels a Game hasn't got, and a Scope in the Corner, which is the tedium we were asked to remove. `look.test.ts` and `catalog.test.ts` now take `showPractice()` in place of `showLevelSelect()`, once; `practice.test.ts` covers the screen in happy-dom.

Amended by 0015: a Topic may have Skin chips, drawn by `src/shared/skins.ts` as on the Group list.
