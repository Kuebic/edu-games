---
status: accepted
---

# Its own Game, on Practice

Coins could have been a Topic in Tidy Up (sort them into Bins) and a Topic in Find It ("find the dime"). We made Piggy Bank a Game of its own, with both as its Ways. A child learning money meets the same five pictures and names in both, and the research puts them in order: matching a coin to the bank wearing its picture first, then finding it by its name. Split across two Games, the grown-up would have to go between them, and neither fits: Tidy Up's Topics are sorting rules the child already has words for, and Find It asks three-way questions of four to six-year-olds, with a Voice. Coins also need things neither has: true relative size, two sides, and a pig that fills.

It's a Practice Game (the site's ADR 0014) with one Topic, because the names are learned by going over them and a grown-up will change which coins come up between sessions. The research's order (penny and quarter, then the dime, the dollar, and the nickel last) is the Ranges and the grown-up's note, not a path of Levels, since the user's child outgrows scaffolds faster than any fixed path.

Its play screen draws on Tidy Up's (drag with a tap fallback, a Miss that slides back, the second going in by itself, Nudges at 7 seconds) but is its own code: Find has several Pieces to grab at once where Tidy Up has one Thing. If a third Game drags things into places, that's the time to move the fingers into `src/shared/`.
