// Prints each Traffic Jam Level's size and difficulty.
// Usage: npm run traffic-jam:levels

import { CHAPTERS, report } from '../../src/games/traffic-jam/chapters';
import { LEVELS } from '../../src/games/traffic-jam/levels';

LEVELS.forEach((levels, c) => {
  console.log(`\nChapter ${c + 1}: ${CHAPTERS[c]!.name}`);
  levels.forEach((level, i) => {
    const r = report(level);
    const kinds = level.vehicles.map((v) => v.kind[0]).join('');
    console.log(
      `  ${String(i + 1).padStart(2)}  vehicles ${String(r.vehicles).padStart(2)}  waves ${r.waves}  free at start ${r.freeAtStart}  difficulty ${r.difficulty.toFixed(1).padStart(5)}  [${kinds}]  ${[...r.features].join(' ')}`,
    );
  });
});
