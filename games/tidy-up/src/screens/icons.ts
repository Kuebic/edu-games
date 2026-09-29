// Inline SVG, so the blocks, shapes and Bins look the same on every phone and carry the Game's own paints.

import { PAINT, type Colour, type Shape } from '../sorting';

/** A paint made darker by `by` (0 to 1), for edges and lips. */
export function darker(hex: string, by = 0.25): string {
  const n = parseInt(hex.slice(1), 16);
  const part = (shift: number) => Math.round(((n >> shift) & 255) * (1 - by));
  return `#${((part(16) << 16) | (part(8) << 8) | part(0)).toString(16).padStart(6, '0')}`;
}

// ---- Patterns: a second cue for each color, behind the Grown-up Corner's switch ----------------------

/** A 12-unit tile per color: stripes, dots, bars, checks, columns, crosses, rings. */
const TILES: Readonly<Record<Colour, string>> = {
  red: '<path d="M-3 3 3-3M0 12 12 0M9 15l6-6" stroke-width="2.6"/>',
  blue: '<circle cx="6" cy="6" r="2.4" stroke="none"/>',
  yellow: '<rect x="0" y="0" width="12" height="4" stroke="none"/>',
  green: '<rect x="0" y="0" width="6" height="6" stroke="none"/><rect x="6" y="6" width="6" height="6" stroke="none"/>',
  orange: '<rect x="0" y="0" width="4" height="12" stroke="none"/>',
  purple: '<path d="M6 2v8M2 6h8" stroke-width="2.2" fill="none"/>',
  pink: '<circle cx="6" cy="6" r="3.2" stroke-width="1.8" fill="none"/>',
};

/** Light paints take a dark pattern, dark ones a light one. */
const INK: Readonly<Record<Colour, string>> = {
  red: '#ffffffa0',
  blue: '#ffffffb0',
  yellow: '#00000048',
  green: '#ffffff90',
  orange: '#00000040',
  purple: '#ffffffa0',
  pink: '#00000040',
};

let patternIds = 0;

/** `body` again, filled with the color's pattern: an overlay for any drawing of that color. */
export function patterned(colour: Colour, body: string): string {
  const id = `tidy-pattern-${++patternIds}`;
  return (
    `<defs><pattern id="${id}" width="12" height="12" patternUnits="userSpaceOnUse">` +
    `<g fill="${INK[colour]}" stroke="${INK[colour]}">${TILES[colour]}</g></pattern></defs>` +
    body.replace(/fill="[^"]*"/, `fill="url(#${id})"`)
  );
}

const svg = (viewBox: string, body: string, label = '') =>
  `<svg viewBox="${viewBox}"${label ? ` role="img" aria-label="${label}"` : ' aria-hidden="true"'}>${body}</svg>`;

// ---- Things -------------------------------------------------------------------------------------------

/** A toy block of one color, with a lip under it and a raised face. */
export function blockSvg(colour: Colour, patterns = false): string {
  const paint = PAINT[colour];
  const face = `<rect x="8" y="4" width="84" height="84" rx="16" fill="${paint}"/>`;
  return svg(
    '0 0 100 100',
    `<rect x="8" y="12" width="84" height="84" rx="16" fill="${darker(paint)}"/>` +
      face +
      (patterns ? patterned(colour, face) : '') +
      `<rect x="22" y="18" width="56" height="56" rx="10" fill="#ffffff" opacity="0.22"/>`,
  );
}

function starPath(cx: number, cy: number, outer: number, inner: number): string {
  const points = Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / 5 - Math.PI / 2;
    return `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
  });
  return `M${points.join('L')}Z`;
}

/** Each shape as one path in a 100-box, a little room left for its lip. */
export const SHAPE_PATHS: Readonly<Record<Shape, string>> = {
  circle: 'M50 6a42 42 0 1 1 0 84a42 42 0 1 1 0-84Z',
  square: 'M18 8h64a10 10 0 0 1 10 10v64a10 10 0 0 1-10 10H18a10 10 0 0 1-10-10V18A10 10 0 0 1 18 8Z',
  triangle: 'M50 8 94 88H6Z',
  star: starPath(50, 52, 48, 21),
  heart: 'M50 90C22 70 6 54 6 32 6 18 17 8 30 8c9 0 16 5 20 13C54 13 61 8 70 8c13 0 24 10 24 24 0 22-16 38-44 58Z',
};

/** A shape of one paint: its lip, the shape, and a shine. */
export function shapeSvg(shape: Shape, paint: string): string {
  const round = shape === 'triangle' || shape === 'star' ? ' stroke-linejoin="round" stroke-width="7"' : '';
  const path = (fill: string, extra = '') => `<path d="${SHAPE_PATHS[shape]}" fill="${fill}"${round ? `${round} stroke="${fill}"` : ''}${extra}/>`;
  return svg(
    '-4 -4 108 112',
    `<g transform="translate(0 6)">${path(darker(paint))}</g>` + path(paint) + `<ellipse cx="36" cy="30" rx="12" ry="7" fill="#fff" opacity="0.3" transform="rotate(-30 36 30)"/>`,
  );
}

// ---- Bins ---------------------------------------------------------------------------------------------

/** A bucket painted its color, with a rim and a handle. The load shows above the rim. */
export function bucketSvg(colour: Colour, patterns = false, label = ''): string {
  const paint = PAINT[colour];
  const body = `<path d="M14 36h72l-9 58a6 6 0 0 1-6 5H29a6 6 0 0 1-6-5Z" fill="${paint}"/>`;
  return svg(
    '0 0 100 100',
    `<path d="M20 34C20 6 80 6 80 34" fill="none" stroke="#6b7280" stroke-width="5" stroke-linecap="round"/>` +
      body +
      (patterns ? patterned(colour, body) : '') +
      `<rect x="9" y="28" width="82" height="14" rx="7" fill="${darker(paint, 0.18)}"/>` +
      `<path d="M26 50l5 40" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.28"/>`,
    label,
  );
}

/** A dump truck from the side, facing right, its bed painted the color. The load shows above the bed. */
export function truckSvg(colour: Colour, patterns = false, label = ''): string {
  const paint = PAINT[colour];
  const bed = `<path d="M4 30h78l-6 30H10Z" fill="${paint}"/>`;
  return svg(
    '0 0 120 90',
    bed +
      (patterns ? patterned(colour, bed) : '') +
      `<rect x="2" y="25" width="82" height="9" rx="4.5" fill="${darker(paint, 0.18)}"/>` +
      `<path d="M84 34h16l14 16v16H84Z" fill="#f4f6fa" stroke="#9aa3b2" stroke-width="2.5" stroke-linejoin="round"/>` +
      `<path d="M90 39h9l9 11H90Z" fill="#bfe3ff"/>` +
      `<rect x="6" y="60" width="108" height="9" rx="4" fill="#4b5563"/>` +
      `<circle cx="28" cy="72" r="12" fill="#1f2937"/><circle cx="28" cy="72" r="5" fill="#d1d5db"/>` +
      `<circle cx="94" cy="72" r="12" fill="#1f2937"/><circle cx="94" cy="72" r="5" fill="#d1d5db"/>` +
      `<circle cx="112" cy="56" r="3" fill="#ffd21a"/>`,
    label,
  );
}

/** The shape-sorter Box: wood, its front cut with the Bin's shape. Things go in through the hole. */
export function boxSvg(shape: Shape, label = ''): string {
  return svg(
    '0 0 100 100',
    `<path d="M10 30 22 12h56l12 18Z" fill="#e9bb84"/>` +
      `<rect x="8" y="30" width="84" height="66" rx="8" fill="#d99a5b"/>` +
      `<rect x="8" y="30" width="84" height="8" fill="#c8864a"/>` +
      `<g transform="translate(29 44) scale(0.42)"><path d="${SHAPE_PATHS[shape]}" fill="#5b3a1e" stroke="#5b3a1e" stroke-width="8" stroke-linejoin="round"/></g>`,
    label,
  );
}

// ---- Practice's pictures ------------------------------------------------------------------------------

/** A Topic's badge, drawn white: three dots of color, a circle, a triangle and a square, or a crate's planks. */
export function topicBadge(topic: 'colors' | 'shapes' | 'kinds'): string {
  const body =
    topic === 'colors'
      ? '<circle cx="14" cy="30" r="9"/><circle cx="34" cy="30" r="9"/><circle cx="24" cy="14" r="9"/>'
      : topic === 'shapes'
        ? '<circle cx="13" cy="33" r="9"/><rect x="26" y="24" width="18" height="18" rx="3"/><path d="M24 4 34 20H14Z" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>'
        : '<rect x="6" y="10" width="36" height="8" rx="2"/><rect x="6" y="20" width="36" height="8" rx="2"/><rect x="6" y="30" width="36" height="8" rx="2"/><rect x="6" y="10" width="5" height="30" rx="2"/><rect x="37" y="10" width="5" height="30" rx="2"/>';
  return `<svg viewBox="0 0 48 48" aria-hidden="true"><g fill="currentColor">${body}</g></svg>`;
}

/** A wooden crate, the same for every group of Kinds: planks between two posts. The load shows above it. */
export const crateSvg =
  '<svg viewBox="0 0 100 100" aria-hidden="true">' +
  '<rect x="6" y="30" width="88" height="66" rx="6" fill="#a86d36"/>' +
  '<rect x="10" y="34" width="80" height="18" rx="3" fill="#dba466"/>' +
  '<rect x="10" y="55" width="80" height="18" rx="3" fill="#dba466"/>' +
  '<rect x="10" y="76" width="80" height="17" rx="3" fill="#dba466"/>' +
  '<rect x="6" y="30" width="11" height="66" rx="3" fill="#c98b4e"/>' +
  '<rect x="83" y="30" width="11" height="66" rx="3" fill="#c98b4e"/>' +
  '</svg>';

/** A Skin's chip picture: a red bucket, or a truck with a blue bed. */
export const skinPictures = {
  buckets: () => bucketSvg('red'),
  trucks: () => truckSvg('blue'),
};
