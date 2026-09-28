---
status: accepted
---

# Its own Game, on Practice

Sorting could have been a Colors Topic in Find It: a red duck at the top and three buckets to tap. We made Tidy Up a Game of its own. A Find is one question answered by one tap; a Round is a Pile of Things dragged into Bins, and the full Bins at the end are the reward, so none of Find It's Choices, Ways, Trays or Cheer fit. Find It also asks three-way questions of four to six-year-olds, where Tidy Up starts at two Bins for two-year-olds. Sharing a folder would have saved nothing: Practice, Skins, the Sound, Saved progress and the Grown-up Corner already come from `src/shared/`.

It's a Practice Game (the site's ADR 0014) with Colors and Shapes as Topics, because colors are learned by going over them and a grown-up will change which ones between sessions. The research suggested a ladder of Levels (red and blue blocks, then yellow, then three Bins, then toys); the Ways (Blocks and Things, Plain and Colorful) and the Scope give a grown-up the same ladder in one tap each, and the user's child outgrows scaffolds faster than any fixed path. The research also suggested stopping after three Rounds; Practice goes on until Back, as in every Practice Game, and a Round is short.

Sorting needs two Bins, so Practice gained `fewest` on a Topic: Play waits until the Scope has that many.
