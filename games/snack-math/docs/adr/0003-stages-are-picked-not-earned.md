---
status: accepted
---

# Stages are picked, not earned

Stages are Groups of four Rounds (site ADR 0009). Any Stage can be picked from the Stage list, and a Stage's Rounds open in order. A Round is done when it's finished, so there is still no failure. Automatic promotion after 4 First Tries is gone. Next after a Stage's last Round goes to the next Stage, so the ladder still moves a child on. It no longer holds back a child who is struggling; a grown-up picks the Stage instead. We chose one level select for every Game over keeping Snack Math adaptive.

Four Rounds make 20 Problems, which covers each of the 10 Problems in a Stage up to 5 twice, takes a 4- to 6-year-old about 10 to 15 minutes, and fits one row of cards. The save keeps how many of each Stage's Rounds are done, under the same `v1` key. A save from before this counts every Stage below its Stage as done, so a child keeps the Stages they had moved past. Rounds get no Sparkles: a Sparkle for First Tries would be a score (ADR 0001). The praise "You're getting so good at this!" moves to the first time a Stage's last Round is finished.
