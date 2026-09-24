// Drawing: the board (grass, houses, trees, Streets) and the Vehicles, as SVG in cell units.

import { isIntersection, isRoad, streetEnd, streetStart, type Arrow, type Level, type Vehicle } from './game/level';
import { LENGTH } from './game/level';

const SVG = 'http://www.w3.org/2000/svg';

export function svg<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number> = {},
  children: SVGElement[] = [],
): SVGElementTagNameMap[K] {
  const node = document.createElementNS(SVG, tag);
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, String(value));
  node.append(...children);
  return node;
}

export const VEHICLE_COLORS = ['#ef4444', '#2f7cf6', '#f5b400', '#16a34a', '#9b5cf6', '#f97316', '#ec4899', '#0fa3a3'];

const ROOF_COLORS = ['#e76f51', '#c0504d', '#f4a261', '#8d6cab', '#4f86c6'];

/** Same scenery every time a Level is opened. */
function scenery(seed: number) {
  let a = seed * 7919 + 17;
  return () => {
    a = (a * 1103515245 + 12345) % 2147483648;
    return a / 2147483648;
  };
}

export function drawBoard(level: Level, seed: number): { board: SVGSVGElement; vehicles: SVGGElement } {
  const random = scenery(seed);
  const board = svg('svg', { viewBox: `0 0 ${level.w} ${level.h}`, class: 'tj-board-svg' });
  board.append(svg('rect', { width: level.w, height: level.h, fill: '#8fd16a' }));

  const scene = svg('g');
  for (let y = 0; y < level.h; y++) {
    for (let x = 0; x < level.w; x++) {
      if (isRoad(level, { x, y })) continue;
      const roll = random();
      if (roll < 0.14) scene.append(house(x, y, ROOF_COLORS[Math.floor(random() * ROOF_COLORS.length)]!));
      else if (roll < 0.42) scene.append(tree(x + 0.3 + random() * 0.4, y + 0.3 + random() * 0.4, 0.22 + random() * 0.1));
      else if (roll < 0.52) scene.append(flowers(x + 0.2 + random() * 0.6, y + 0.2 + random() * 0.6));
    }
  }
  board.append(scene);

  const kerbs = svg('g', { fill: '#e9e2d0' });
  const roads = svg('g', { fill: '#5d6472' });
  for (const street of level.streets) {
    const start = streetStart(street);
    const length = streetEnd(street, level) - start + 1;
    const [x, y, w, h] =
      street.axis === 'v' ? [street.at, start, street.lanes, length] : [start, street.at, length, street.lanes];
    kerbs.append(svg('rect', { x: x - 0.1, y: y - 0.1, width: w + 0.2, height: h + 0.2, rx: 0.12 }));
    roads.append(svg('rect', { x, y, width: w, height: h }));
  }
  board.append(kerbs, roads);

  // Dashed centre line between the two Lanes of a two-lane Street, broken at Intersections.
  const lines = svg('g', { stroke: '#ffd23f', 'stroke-width': 0.07, 'stroke-linecap': 'round' });
  for (const street of level.streets) {
    if (street.lanes !== 2) continue;
    for (let along = streetStart(street); along <= streetEnd(street, level); along++) {
      const cell = street.axis === 'v' ? { x: street.at, y: along } : { x: along, y: street.at };
      if (isIntersection(level, cell)) continue;
      const mid = street.at + 1;
      lines.append(
        street.axis === 'v'
          ? svg('line', { x1: mid, x2: mid, y1: along + 0.25, y2: along + 0.75 })
          : svg('line', { y1: mid, y2: mid, x1: along + 0.25, x2: along + 0.75 }),
      );
    }
  }
  board.append(lines);

  const vehicles = svg('g');
  board.append(vehicles);
  return { board, vehicles };
}

function tree(cx: number, cy: number, r: number): SVGGElement {
  return svg('g', {}, [
    svg('circle', { cx: cx + 0.05, cy: cy + 0.06, r, fill: '#00000022' }),
    svg('circle', { cx, cy, r, fill: '#3f9b3a' }),
    svg('circle', { cx: cx - r * 0.3, cy: cy - r * 0.3, r: r * 0.45, fill: '#5cb84f' }),
  ]);
}

function house(x: number, y: number, roof: string): SVGGElement {
  return svg('g', {}, [
    svg('rect', { x: x + 0.2, y: y + 0.22, width: 0.64, height: 0.62, rx: 0.06, fill: '#00000022' }),
    svg('rect', { x: x + 0.16, y: y + 0.16, width: 0.64, height: 0.62, rx: 0.06, fill: roof }),
    svg('path', { d: `M${x + 0.16} ${y + 0.47}H${x + 0.8}`, stroke: '#00000030', 'stroke-width': 0.04 }),
    svg('rect', { x: x + 0.56, y: y + 0.24, width: 0.1, height: 0.14, fill: '#8a5a44' }),
  ]);
}

function flowers(cx: number, cy: number): SVGGElement {
  return svg('g', {}, [
    svg('circle', { cx, cy, r: 0.05, fill: '#fff6a8' }),
    svg('circle', { cx: cx + 0.12, cy: cy + 0.06, r: 0.05, fill: '#ffb3c7' }),
    svg('circle', { cx: cx + 0.03, cy: cy + 0.13, r: 0.05, fill: '#ffffff' }),
  ]);
}

/**
 * Arrow shapes in a unit box centred on 0,0, pointing forward (up).
 * `line` is stroked, `head` is filled; right-hand Arrows are the left ones mirrored.
 */
const ARROW_SHAPES: Record<'straight' | 'left' | 'uturn-left', { line: string; head: string }> = {
  straight: { line: 'M0 0.38V-0.1', head: '-0.26,-0.06 0,-0.42 0.26,-0.06' },
  left: { line: 'M0.2 0.38V0.04Q0.2 -0.14 0.02 -0.14H-0.1', head: '-0.1,-0.4 -0.44,-0.14 -0.1,0.12' },
  'uturn-left': { line: 'M0.22 0.38V-0.04A0.22 0.22 0 0 0 -0.22 -0.04V0.04', head: '-0.48,0.02 -0.22,0.38 0.04,0.02' },
};

export function arrowIcon(arrow: Arrow, scale = 1): SVGGElement {
  const mirrored = arrow === 'right' || arrow === 'uturn-right';
  const shape = ARROW_SHAPES[arrow === 'right' ? 'left' : arrow === 'uturn-right' ? 'uturn-left' : arrow];
  const g = svg('g', { transform: `scale(${mirrored ? -scale : scale} ${scale})`, 'stroke-linejoin': 'round' });
  g.append(
    svg('path', { d: shape.line, fill: 'none', stroke: '#1f2937', 'stroke-width': 0.28, 'stroke-linecap': 'round' }),
    svg('polygon', { points: shape.head, fill: '#1f2937', stroke: '#1f2937', 'stroke-width': 0.14 }),
    svg('path', { d: shape.line, fill: 'none', stroke: '#fff', 'stroke-width': 0.15, 'stroke-linecap': 'round' }),
    svg('polygon', { points: shape.head, fill: '#fff' }),
  );
  return g;
}

/**
 * A Vehicle drawn around its own centre, facing up. The outer group is moved and turned
 * by the caller; the inner one wobbles on a bump.
 */
export function drawVehicle(vehicle: Vehicle, color: string, index: number): SVGGElement {
  const length = LENGTH[vehicle.kind];
  const half = length / 2 - 0.07;
  const outer = svg('g', { class: 'tj-vehicle', 'data-vehicle': index });
  const body = svg('g', { class: 'tj-vehicle-body' });
  // A generous invisible hit area: the whole cell(s), not just the paint.
  body.append(svg('rect', { x: -0.5, y: -length / 2, width: 1, height: length, fill: 'transparent' }));
  body.append(svg('rect', { x: -0.33, y: -half + 0.06, width: 0.72, height: half * 2, rx: 0.16, fill: '#00000030' }));

  if (vehicle.kind === 'car') {
    body.append(
      svg('rect', { x: -0.37, y: -half, width: 0.74, height: half * 2, rx: 0.17, fill: color }),
      svg('rect', { x: -0.28, y: -0.24, width: 0.56, height: 0.13, rx: 0.05, fill: '#d6ecff' }),
      svg('rect', { x: -0.26, y: 0.26, width: 0.52, height: 0.09, rx: 0.04, fill: '#d6ecff' }),
      svg('circle', { cx: -0.22, cy: -half + 0.04, r: 0.055, fill: '#fff7b0' }),
      svg('circle', { cx: 0.22, cy: -half + 0.04, r: 0.055, fill: '#fff7b0' }),
    );
    body.append(arrowIcon(vehicle.arrow, 0.66));
  } else if (vehicle.kind === 'truck') {
    body.append(
      svg('rect', { x: -0.37, y: -half, width: 0.74, height: 0.5, rx: 0.14, fill: color }),
      svg('rect', { x: -0.29, y: -half + 0.14, width: 0.58, height: 0.12, rx: 0.04, fill: '#d6ecff' }),
      svg('rect', { x: -0.39, y: -half + 0.56, width: 0.78, height: half * 2 - 0.56, rx: 0.08, fill: '#f4f1ea' }),
      svg('rect', { x: -0.39, y: -half + 0.56, width: 0.78, height: 0.1, fill: color }),
      svg('circle', { cx: -0.22, cy: -half + 0.04, r: 0.055, fill: '#fff7b0' }),
      svg('circle', { cx: 0.22, cy: -half + 0.04, r: 0.055, fill: '#fff7b0' }),
    );
    const arrow = arrowIcon(vehicle.arrow, 0.7);
    arrow.setAttribute('transform', `translate(0 0.28) ${arrow.getAttribute('transform')}`);
    body.append(arrow);
  } else {
    body.append(
      svg('rect', { x: -0.38, y: -half, width: 0.76, height: half * 2, rx: 0.16, fill: color }),
      svg('rect', { x: -0.3, y: -half + 0.1, width: 0.6, height: 0.16, rx: 0.05, fill: '#d6ecff' }),
      svg('circle', { cx: -0.22, cy: -half + 0.04, r: 0.055, fill: '#fff7b0' }),
      svg('circle', { cx: 0.22, cy: -half + 0.04, r: 0.055, fill: '#fff7b0' }),
    );
    for (let k = 0; k < 5; k++) {
      const y = -half + 0.45 + k * 0.42;
      body.append(
        svg('rect', { x: -0.36, y, width: 0.08, height: 0.26, rx: 0.03, fill: '#d6ecff' }),
        svg('rect', { x: 0.28, y, width: 0.08, height: 0.26, rx: 0.03, fill: '#d6ecff' }),
      );
    }
    body.append(arrowIcon(vehicle.arrow, 0.78));
  }
  outer.append(body);
  return outer;
}

export function place(node: SVGGElement, x: number, y: number, angle: number): void {
  node.setAttribute('transform', `translate(${x.toFixed(3)} ${y.toFixed(3)}) rotate(${angle.toFixed(2)})`);
}

/** Small pictures for the Chapters, so pre-readers can tell them apart. */
export function chapterIcon(chapter: number): SVGSVGElement {
  const icon = svg('svg', { viewBox: '-0.5 -0.5 1 1', class: 'tj-chapter-icon', 'aria-hidden': 'true' });
  const road = (d: string, width = 0.3) =>
    svg('path', { d, stroke: '#5d6472', 'stroke-width': width, fill: 'none', 'stroke-linecap': 'butt' });
  const mini = (kind: Vehicle['kind'], arrow: Arrow, scale: number) => {
    const g = drawVehicle({ kind, x: 0, y: 0, dir: 'N', arrow }, '#ffffff', -1);
    g.setAttribute('transform', `scale(${scale})`);
    return g;
  };
  switch (chapter) {
    case 0: icon.append(arrowIcon('straight', 0.9)); break;
    case 1: icon.append(road('M0 -0.5V0.5M-0.5 0H0.5')); break;
    case 2: icon.append(arrowIcon('left', 0.9)); break;
    case 3: icon.append(arrowIcon('uturn-left', 0.9)); break;
    case 4: icon.append(mini('truck', 'straight', 0.42)); break;
    case 5:
      icon.append(road('M0 -0.5V0.5', 0.56), svg('path', { d: 'M0 -0.42V0.42', stroke: '#ffd23f', 'stroke-width': 0.06, 'stroke-dasharray': '0.14 0.1' }));
      break;
    case 6: icon.append(road('M-0.5 -0.15H0.5M0 -0.15V0.5')); break;
    default: icon.append(mini('bus', 'straight', 0.3)); break;
  }
  return icon;
}
