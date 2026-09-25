# Robot Path

A programming puzzle for a 4-5-year-old who reads a little. He builds a short Program, presses Go, and the robot runs it on a grid.

## Language

### Levels

**Level**:
One puzzle: a grid of floor and walls, the robot's start, some items, the Goals, the palette and a Slot limit.
_Avoid_: Stage, puzzle, map

**World**:
A group of 8 Levels that brings in one new idea (arrows, collecting, twisty paths, mazes, big mazes, Repeat, Fix-it, turns). A Group (site term).
_Avoid_: Chapter, pack

**Goal**:
Something the Level wants: stand on the flag, collect every gem, spell a word, collect numbers in order, make a sum, or push every crate onto a target. A Level lists one or more, and all must be met at once.
_Avoid_: Objective, task

**Fix-it Level**:
A Level that opens with Bip's broken Program already in the bar.
_Avoid_: Debug level, bug level

**Bip**:
The helper robot who "wrote" the broken Programs. The same in every Skin.

**Par**:
The shortest Program length for a Level. Worlds 1-5 take it from the solver; worlds 6-8 from the Level's own solution.
_Avoid_: Target, best score

**Sparkle**:
The bonus for winning with a Program no longer than Par. An unearned Sparkle shows nothing.
_Avoid_: Star, medal, score

### Programs

**Command**:
One instruction: an arrow (up, down, left, right), a relative move (forward, turn left, turn right), or a Repeat Block.
_Avoid_: Block (except Repeat Block), instruction, step

**Program**:
The Commands in the bar, in order.
_Avoid_: Code, script, solution (the solution is the Level's own Program)

**Slot**:
One place in the program bar. A Repeat Block takes one Slot plus one per Command in its body.

**Repeat Block**:
A Command that runs its body 2-5 times. Its body holds up to 4 Commands and never another Repeat Block.
_Avoid_: Loop (fine in speech to him), for-block

**Draft**:
The Program he left in a Level, saved so it's still there when he comes back.

### Running

**Run**:
One press of Go, from the rewind to a win, a bonk, or Unfinished.

**Step**:
One Command running. The Step button plays one per tap.
_Avoid_: Move (a Step can be a turn)

**Trace**:
Everything a Run will do, worked out by the engine before any animation.

**Bonk**:
The robot tried to walk into a wall, off the grid, or into a crate that can't move. It wobbles, says boing, and stops. The Command that did it glows orange.
_Avoid_: Crash, error, fail

**Unfinished**:
The Program ran out before the Goals were met. The robot shrugs and thinks of what's missing.
_Avoid_: Lose, fail

**Win**:
Every Goal met. The Run stops at once, even with Commands left.

**Hint**:
After 3 Runs without a win, a lightbulb. Each tap shows 2 more marks of the solution's path.

### Looks

**Skin**:
A set of art and sounds (Garden, Planet, Sea). It never changes the rules. Letters, numbers and the grid look the same in every Skin.
_Avoid_: Theme
