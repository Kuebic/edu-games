// Level authoring helper: random small boards, filtered by the solver. Candidates are
// printed for a human to pick from; nothing is written to src/levels.ts automatically.
// usage: npm run generate -- boxes minPushes maxPushes forgiving(0/1) minTurns count [seed]
import { parseLevel, type Level } from '../src/game/level';
import { step } from '../src/game/rules';
import { analyse } from '../src/game/solver';

const [boxes, minPushes, maxPushes, forgiving, minTurns, count, seed0] = process.argv
  .slice(2)
  .filter((a) => a !== '--')
  .map(Number) as number[];

let seed = seed0 ?? 1;
const rand = () => {
  // mulberry32
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

function render(w: number, h: number, floor: Set<number>, box: number[], goal: number[], player: number) {
  const rows: string[] = [];
  for (let y = 0; y < h; y++) {
    let row = '';
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const b = box.includes(i), g = goal.includes(i);
      row += !floor.has(i) ? '#' : i === player ? (g ? '+' : '@') : b ? (g ? '*' : '$') : g ? '.' : ' ';
    }
    rows.push(row);
  }
  return rows.join('\n');
}

function turns(level: Level, solution: readonly string[]) {
  let pos = level.start;
  const dirs: string[] = [];
  for (const d of solution) {
    const r = step(level, pos, d as never);
    if (r.kind === 'blocked') throw new Error('bad solution');
    if (r.kind === 'push' && dirs.at(-1) !== d) dirs.push(d);
    pos = r.position;
  }
  return dirs.length - 1;
}

const seen = new Set<string>();
let found = 0;
for (let tries = 0; tries < 400000 && found < count!; tries++) {
  const w = 5 + Math.floor(rand() * 4), h = 5 + Math.floor(rand() * 4);
  const floor = new Set<number>();
  // union of a few random rectangles inside the border
  const rects = 2 + Math.floor(rand() * 3);
  for (let r = 0; r < rects; r++) {
    const x0 = 1 + Math.floor(rand() * (w - 2)), y0 = 1 + Math.floor(rand() * (h - 2));
    const x1 = Math.min(w - 2, x0 + Math.floor(rand() * 3)), y1 = Math.min(h - 2, y0 + Math.floor(rand() * 3));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) floor.add(y * w + x);
  }
  const cells = [...floor];
  if (cells.length < boxes! * 2 + 3 || cells.length > 22) continue;
  const shuffled = cells.sort(() => rand() - 0.5);
  const box = shuffled.slice(0, boxes);
  const goal = shuffled.slice(boxes, boxes! * 2);
  const player = shuffled[boxes! * 2]!;
  const text = render(w, h, floor, box, goal, player);
  let level: Level;
  try { level = parseLevel(text); } catch { continue; }
  // every floor square must be reachable (no islands)
  if (level.cells.filter((c) => c === 'floor').length !== floor.size) continue;
  const a = analyse(level);
  if (!a.solvable || a.minPushes < minPushes! || a.minPushes > maxPushes!) continue;
  if (forgiving && !a.forgiving) continue;
  if (!forgiving && a.forgiving) continue;
  const t = turns(level, a.solution);
  if (t < minTurns!) continue;
  const trimmed = trim(text);
  if (trimmed.split('\n').length > 8 || trimmed.split('\n')[0]!.length > 8) continue;
  const key = trimmed;
  if (seen.has(key)) continue;
  seen.add(key);
  found++;
  console.log(`${trimmed}\n=> ${trimmed.split('\n')[0]!.length}x${trimmed.split('\n').length} pushes=${a.minPushes} steps=${a.solution.length} turns=${t} floor=${floor.size} forgiving=${a.forgiving}\n`);
}

function trim(text: string) {
  let rows = text.split('\n');
  const open = (r: string) => /[^#]/.test(r);
  while (rows.length > 2 && !open(rows[1]!)) rows.splice(0, 1);
  while (rows.length > 2 && !open(rows[rows.length - 2]!)) rows.splice(rows.length - 1, 1);
  const colOpen = (x: number) => rows.some((r) => r[x] !== '#');
  while (rows[0]!.length > 2 && !colOpen(1)) rows = rows.map((r) => r.slice(1));
  while (rows[0]!.length > 2 && !colOpen(rows[0]!.length - 2)) rows = rows.map((r) => r.slice(0, -1));
  return rows.join('\n');
}
