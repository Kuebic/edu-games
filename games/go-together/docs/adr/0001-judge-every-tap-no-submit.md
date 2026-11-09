---
status: accepted
---

# Judge every tap; there is no submit

Connections lets you pick four words, submit, and learn "one away" or that you were wrong, four mistakes allowed. A two or three-year-old can't hold four picks in mind, can't read a count, and has no idea what a submit button is. So Go Together judges every tap as it lands: the first Card lifted leads, a Card of the lead's group lifts beside it, and a Card from another group is a Miss at once, a bump and a shake, with the lead still up. The first Miss glows the rest of the lead's group; the second gathers it by itself, the same two-Misses-then-help shape as the sorting screen's (site ADR 0016), so a child who knows Tidy Up knows this. The last group left gathers on its first tap, because there is nothing to pick it from. Nothing is counted and nothing is lost.

We rejected a submit step with "one away", which is the newspaper's game and a five-year-old's at best; a free pick judged only when the right number was up, which leaves a child who lifted two wrong Cards with no idea which; and treating the first Card tapped as always right, which is what this does, but without the Lead being told by anything on screen but its ring. If the playtest shows she picks freely and wants to be judged at the end, that is the change to make: the picking rule is one pure function (`tap` in `boards.ts`), and the screen only draws its outcomes.
