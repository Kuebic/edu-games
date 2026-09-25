# Push Pals

A Sokoban game for a five-year-old. Levels are real puzzles from the start: two to four boxes, and every level can get stuck. Later chapters need tricks.

## Language

### Puzzles

**Level**:
One puzzle: a board of walls and floor, some boxes, the same number of goals, and a starting spot for the player.
_Avoid_: Stage, puzzle, map

**Chapter**:
Eight levels sharing one difficulty band (box count, push range, whether each level needs a trick), each Chapter in its own colour with its boxes on its badge. Easiest first. A Group (site term).
_Avoid_: World, pack, set

**Box**:
The thing the player pushes.
_Avoid_: Crate, block, stone

**Goal**:
A floor square a box must end on.
_Avoid_: Target, storage, dot, spot

### Play

**Step**:
Any single move of the player by one square.
_Avoid_: Move (ambiguous with push)

**Push**:
A step that also moves a box one square.

**Solved**:
Every box is on a goal.
_Avoid_: Won, complete, cleared

**Stuck**:
The level can no longer be solved without undo or reset.
_Avoid_: Deadlock (fine inside the solver, not as a player-facing idea), lost, failed

**Forgiving**:
A level in which no sequence of steps can make it stuck.

**Trick**:
A push that looks like undoing progress but is needed to solve the level: pushing a box off a goal, or pushing a box back the way it came.
