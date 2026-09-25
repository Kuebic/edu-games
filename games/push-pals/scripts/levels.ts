// Prints the solver's view of every level, for tuning the difficulty curve.
import { parseLevel } from '../src/game/level';
import { analyse, needsTrick } from '../src/game/solver';
import { CHAPTERS } from '../src/levels';

let n = 0;
CHAPTERS.forEach((chapter, c) => {
  console.log(`\nChapter ${c + 1} (boxes ${chapter.boxes}, pushes ${chapter.minPushes}-${chapter.maxPushes}${chapter.trick ? ', trick' : ''})`);
  for (const text of chapter.levels) {
    const level = parseLevel(text);
    const a = analyse(level);
    n++;
    console.log(
      `  #${String(n).padStart(2)}  ${level.width}x${level.height}  pushes ${a.minPushes}  steps ${String(a.solution.length).padStart(2)}  ${a.forgiving ? 'forgiving' : 'can get stuck'}${needsTrick(level) ? '  trick' : ''}`,
    );
  }
});
