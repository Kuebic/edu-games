# Way Out

A sliding-block puzzle for 4–6-year-olds, in the style of the classic parking-lot puzzle. Vehicles fill a 6 × 6 lot; each slides only along its own line. Slide them until the red one can drive out the Exit. There is no way to lose. (Never call it "Rush Hour" in the app: that's a trademark.)

## Language

### Board

**Board**:
The lot as a 36-character string, read row by row: `o` empty, `x` a Wall, `A` the red Vehicle, `B`–`Z` the others. The same format as the puzzle database.
_Avoid_: Grid, map, state (fine inside the solver)

**Vehicle**:
Anything that slides: 2 cells (a car) or 3 cells (a truck), lying across or up and down. Its line never changes.
_Avoid_: Piece (fine in code), block, car (for all of them)

**Red car**:
The Vehicle labelled `A`, always across the third row. Getting it out wins. The Skin names it: red car, red tractor, red rocket.
_Avoid_: Hero (fine in code), player, target car

**Wall**:
A cell nothing can enter: a cone, a hay bale, an asteroid.
_Avoid_: Block, obstacle, rock

**Exit**:
The gap in the right-hand side of the frame, on the red car's row.
_Avoid_: Goal, door, finish

**Colour** and **Mark**:
Every Vehicle has a speakable Colour ("the green truck") and a Mark (star, heart, moon...) on its roof, so colour is never the only way to tell two apart. No two Vehicles on a Board share either.
_Avoid_: Icon, symbol, badge (fine in code)

### Play

**Move**:
One drag or one nudge that changes where a Vehicle is. A long slide is still one Move, as in the database. A drag that ends where it started is not a Move.
_Avoid_: Step, turn, slide (fine in UI talk)

**Nudge**:
Tap a Vehicle to lift it, then tap an arrow to slide it one cell. Each nudge is its own Move.
_Avoid_: Step, tap-move

**Bump**:
What a Vehicle does when it meets another Vehicle, a Wall or the edge: it stops flush with a soft thump. Never a buzzer, never counted.
_Avoid_: Crash, collision, blocked

**Solved**:
The red car is at the Exit (the two right-hand cells of its row). The drive off the screen is only animation.
_Avoid_: Won, cleared, complete

**Hint**:
The lightbulb: the next Move of a shortest solution from the Board as it is now, shown as a pulsing Vehicle and a ghost where it goes, and spoken.
_Avoid_: Help, clue, solution

### Progress

**Par**:
The fewest Moves that solve a Board, counting the red car's last slide to the Exit.
_Avoid_: Target, best, optimum

**Sparkle**:
The bonus for solving in par or fewer. Missing it shows nothing.
_Avoid_: Star (the stars are Push Pals'), medal, perfect

**Level**:
One Board with its par, in a Pack. Saved under its id (`p2-04`).
_Avoid_: Puzzle (that includes Pool puzzles), stage, card

**Pack**:
Twelve Levels at one difficulty, easiest first: First drive, Busy street, Traffic, Jam, Gridlock, and the bonus Grown-up Pack, which shows only when a grown-up turns it on. A Group (site term).
_Avoid_: Chapter (that's Traffic Jam's and Push Pals'), world, set

**Pool**:
About 200 extra Boards per Pack, within the same limits, served at random by "more like this". They earn Sparkles but open nothing.
_Avoid_: Bonus levels, random levels

**Skin**:
An art, sound and name set (city, farm, space). Never changes the rules or the Boards.
_Avoid_: Theme, world, mode

**Blocking depth**:
The longest chain of "this blocks that, which blocks the red car" on the starting Board. A car in the way that can slide straight aside is depth 1. One of the difficulty measures; never shown.
_Avoid_: Level (overloaded), nesting
