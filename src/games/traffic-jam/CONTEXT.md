# Traffic Jam

A tap puzzle for 4–6-year-olds. Cars sit on Streets that cross at right angles and run off the edge of the screen. Each car has an Arrow saying where it will go. Tap a car and it drives off along its Route, or, if something is in the way, bumps it and backs up to where it was. Clear every car off the board. There is no way to lose.

## Language

### Board

**Street**:
A road running the full width or height of the board, or stopping at another Street to make a T-junction. One or two Lanes wide.
_Avoid_: Road (fine in UI talk), path, track

**Lane**:
One line of cells along a Street. On a two-lane Street each Lane has a direction and Vehicles keep right; a single-lane Street carries both directions.
_Avoid_: Track, row, column

**Intersection**:
A cell where two Streets cross. Vehicles may start inside one; that's what makes crossing traffic block.
_Avoid_: Junction (except T-junction), crossroads, node

**T-junction**:
Where a Street stops at the far side of another Street. Only one way to turn there, and no going straight.
_Avoid_: Dead end (a T-junction is not one)

### Vehicles

**Vehicle**:
Anything the child taps: a car (1 cell), truck (2 cells) or bus (3 cells). Its position is its front cell; the rest trails behind.
_Avoid_: Piece, token, block

**Arrow**:
The picture on a Vehicle's roof saying where it goes: straight, left, right, U-turn left, or U-turn right. Relative to the Vehicle, not the screen.
_Avoid_: Direction (that's which way it faces), intent, sign

**Route**:
Every cell the front of a Vehicle drives through from where it sits until it leaves the board. Straight: to the edge. Left or right: to the first Intersection where that turn is possible, turn into the correct Lane, then to the edge. U-turn: that turn twice, at two different Intersections (never back onto the Street it just left).
_Avoid_: Path, move, trajectory

### Play

**Tap**:
Touching a Vehicle to send it along its Route. One Vehicle moves at a time; taps while one is moving are ignored.
_Avoid_: Click, move, turn

**Leave**:
What a Vehicle does when its whole Route is empty: it drives off the board and is gone.
_Avoid_: Exit, escape, solve

**Bump**:
What a Vehicle does when another Vehicle is on its Route: it drives up to it, both wobble, a soft honk sounds, and it backs up to exactly where it started. Nothing is counted.
_Avoid_: Crash, collision, fail, mistake

**Free**:
A Vehicle that would Leave if tapped right now.
_Avoid_: Unblocked, available, movable

**Clear**:
Every Vehicle has left. The Level is done.
_Avoid_: Win, solve, complete

### Progress

**Level**:
One board: its Streets and the Vehicles on them.
_Avoid_: Puzzle, stage, map

**Chapter**:
Eight Levels that share one new idea (straight only, a crossing, turns, U-turns, trucks, two-lane Streets, T-junctions, buses and everything). Easiest first.
_Avoid_: World, pack, set

**Wave**:
All the Vehicles that are Free together: the first Wave is everyone Free at the start, the next is everyone freed once those have left, and so on. How many Waves a Level takes is its main difficulty measure. Used by the generator and tests, never shown.
_Avoid_: Round, step, turn

**Unlocked**:
A Level the child may open: Clearing a Level unlocks the next, and every Chapter's first Level is always open.
