// Skins: the art, engine sound and spoken names for the same boards. Level data never
// mentions a Skin. Every Vehicle has a Color with a speakable name and a Mark, so colour
// is never the only way to tell two apart.

import { HERO, type Piece } from './game/board';

export type SkinId = 'city' | 'farm' | 'space';

export type MarkId =
  | 'star' | 'circle' | 'heart' | 'triangle' | 'diamond' | 'flower' | 'square' | 'moon'
  | 'bolt' | 'plus' | 'drop' | 'leaf' | 'hexagon' | 'ring' | 'cloud';

export interface VehicleColor {
  /** Said aloud: "Slide the green truck down." */
  name: string;
  fill: string;
  /** A darker shade for roofs and trim. */
  dark: string;
  mark: MarkId;
}

export const RED: VehicleColor = { name: 'red', fill: '#e53935', dark: '#a61f1c', mark: 'star' };

/** Other Vehicles take these in letter order (B, C, D...), so no two on a board match. */
export const COLORS: readonly VehicleColor[] = [
  { name: 'green', fill: '#2fa84f', dark: '#1e7337', mark: 'star' },
  { name: 'yellow', fill: '#f6c915', dark: '#bf9600', mark: 'circle' },
  { name: 'blue', fill: '#2f6fe4', dark: '#1d47a0', mark: 'heart' },
  { name: 'orange', fill: '#f7851e', dark: '#bb5a05', mark: 'triangle' },
  { name: 'purple', fill: '#8d5ae0', dark: '#5f35a8', mark: 'diamond' },
  { name: 'pink', fill: '#f27fc0', dark: '#bf4a8c', mark: 'flower' },
  { name: 'brown', fill: '#8b5a36', dark: '#5e3a20', mark: 'square' },
  { name: 'white', fill: '#f3f1ea', dark: '#c4c0b3', mark: 'moon' },
  { name: 'black', fill: '#3a3a44', dark: '#1d1d24', mark: 'bolt' },
  { name: 'gray', fill: '#9ba4ae', dark: '#6b737c', mark: 'plus' },
  { name: 'light blue', fill: '#7fd0f7', dark: '#3f9ccb', mark: 'drop' },
  { name: 'dark green', fill: '#1f6a43', dark: '#11442a', mark: 'leaf' },
  { name: 'light green', fill: '#a7d948', dark: '#76a61d', mark: 'hexagon' },
  { name: 'dark blue', fill: '#26398f', dark: '#16215a', mark: 'ring' },
  { name: 'teal', fill: '#17a3a0', dark: '#0d6e6c', mark: 'cloud' },
];

export function colorOf(id: string): VehicleColor {
  return id === HERO ? RED : COLORS[(id.charCodeAt(0) - 'B'.charCodeAt(0)) % COLORS.length]!;
}

export interface Skin {
  id: SkinId;
  /** For the picker's label; the child sees the picture. */
  label: string;
  /** Spoken names: the red one, a 2-cell Vehicle, a 3-cell Vehicle. */
  hero: string;
  car: string;
  truck: string;
  /** Page colours: background, its shadow, and text on it. */
  sky: string;
  skyDark: string;
  ink: string;
  engine: 'car' | 'tractor' | 'rocket';
  /** Inner SVG for a Vehicle lying left to right, facing right, in a 100-unit-per-cell box. */
  vehicle(length: number, color: VehicleColor, hero: boolean): string;
  /** Inner SVG for a Wall, in a 100 x 100 box. */
  wall: string;
  /** The ground and the frame around the lot, in a 600 x 600 box. */
  ground: string;
  frame: string;
  /** The Exit marker just outside the gap, 62 x 200: a flag in the row above, an arrow at y 150. */
  exit: string;
}

export function kindName(skin: Skin, piece: Piece): string {
  return piece.id === HERO ? skin.hero : piece.length === 3 ? skin.truck : skin.car;
}

// --- Marks ------------------------------------------------------------------
// Small shapes in a 40 x 40 box centred on 0,0.

const MARKS: Record<MarkId, string> = {
  star: '<path d="M0-15 4.4-5.5 14.6-4.6 6.9 2.2 9.1 12.3 0 7 -9.1 12.3 -6.9 2.2 -14.6-4.6 -4.4-5.5Z"/>',
  circle: '<circle r="11"/>',
  heart: '<path d="M0 13C-6 8-14 3-14-4c0-5 4-8 8-8 3 0 5 2 6 4 1-2 3-4 6-4 4 0 8 3 8 8 0 7-8 12-14 17Z"/>',
  triangle: '<path d="M0-13 13 10H-13Z"/>',
  diamond: '<path d="M0-14 11 0 0 14-11 0Z"/>',
  flower:
    '<circle cy="-7" r="6"/><circle cx="7" cy="-2" r="6"/><circle cx="4" cy="7" r="6"/><circle cx="-4" cy="7" r="6"/><circle cx="-7" cy="-2" r="6"/>',
  square: '<rect x="-10" y="-10" width="20" height="20" rx="3"/>',
  moon: '<path d="M4-13A13 13 0 1 0 12 7 10 10 0 1 1 4-13Z"/>',
  bolt: '<path d="M3-15-9 2h7l-3 13L10-3H3Z"/>',
  plus: '<path d="M-4-12h8v8h8v8h-8v8h-8v-8h-8v-8h8Z"/>',
  drop: '<path d="M0-14C5-6 10-1 10 4a10 10 0 0 1-20 0c0-5 5-10 10-18Z"/>',
  leaf: '<path d="M-11 11C-13-6-2-13 12-12 13 2 6 13-11 11Z"/>',
  hexagon: '<path d="M0-13 11-6.5V6.5L0 13-11 6.5V-6.5Z"/>',
  ring: '<circle r="10" fill="none" stroke="currentColor" stroke-width="5"/>',
  cloud: '<path d="M-10 8a6 6 0 0 1 0-12 8 8 0 0 1 15-2 6 6 0 0 1 5 14Z"/>',
};

/** A white badge with the Vehicle's Mark, so colour is never the only difference. */
export function badge(color: VehicleColor, x: number, y: number): string {
  return `<g transform="translate(${x} ${y})" color="#1f2937">
    <circle r="21" fill="#fff" fill-opacity="0.92" stroke="#00000030" stroke-width="2"/>
    <g fill="currentColor">${MARKS[color.mark]}</g>
  </g>`;
}

/** The red one's smiling face, where the others have a Mark. */
export function face(x: number, y: number): string {
  return `<g transform="translate(${x} ${y})">
    <circle r="22" fill="#fff" fill-opacity="0.92"/>
    <circle cx="-7" cy="-5" r="3.6" fill="#1f2937"/><circle cx="7" cy="-5" r="3.6" fill="#1f2937"/>
    <path d="M-9 4q9 9 18 0" fill="none" stroke="#1f2937" stroke-width="3.6" stroke-linecap="round"/>
  </g>`;
}

/**
 * A whole Vehicle as an SVG sized to its cells. Vertical ones are the same art turned to face down;
 * the badge stays upright so its Mark reads the same way on every Vehicle.
 */
export function vehicleSvg(skin: Skin, piece: Piece): string {
  const hero = piece.id === HERO;
  const color = colorOf(piece.id);
  const long = piece.length * 100;
  const art = skin.vehicle(piece.length, color, hero);
  const [x, y] = piece.horizontal ? [long / 2, 50] : [50, long / 2];
  const mark = hero ? face(x, y) : badge(color, x, y);
  return piece.horizontal
    ? `<svg viewBox="0 0 ${long} 100" aria-hidden="true">${art}${mark}</svg>`
    : `<svg viewBox="0 0 100 ${long}" aria-hidden="true"><g transform="translate(100 0) rotate(90)">${art}</g>${mark}</svg>`;
}

// --- City: cars and trucks in a parking lot ---------------------------------------

function cityVehicle(length: number, c: VehicleColor): string {
  const long = length * 100;
  const shadow = `<rect x="9" y="13" width="${long - 14}" height="82" rx="22" fill="#00000030"/>`;
  if (length === 2) {
    return `${shadow}
      <rect x="6" y="9" width="188" height="82" rx="24" fill="${c.fill}"/>
      <rect x="6" y="9" width="188" height="82" rx="24" fill="none" stroke="${c.dark}" stroke-width="4"/>
      <rect x="54" y="19" width="84" height="62" rx="14" fill="${c.dark}"/>
      <rect x="140" y="20" width="24" height="60" rx="9" fill="#bfe3ff"/>
      <rect x="32" y="24" width="18" height="52" rx="7" fill="#bfe3ff"/>
      <rect x="180" y="16" width="10" height="16" rx="4" fill="#fff6b0"/>
      <rect x="180" y="68" width="10" height="16" rx="4" fill="#fff6b0"/>
      <rect x="9" y="17" width="7" height="14" rx="3" fill="#ff6b6b"/>
      <rect x="9" y="69" width="7" height="14" rx="3" fill="#ff6b6b"/>`;
  }
  return `${shadow}
    <rect x="6" y="6" width="200" height="88" rx="10" fill="#f4f1ea" stroke="#c9c3b3" stroke-width="4"/>
    <rect x="6" y="38" width="200" height="24" fill="${c.fill}"/>
    <rect x="212" y="10" width="82" height="80" rx="20" fill="${c.fill}" stroke="${c.dark}" stroke-width="4"/>
    <rect x="258" y="20" width="22" height="60" rx="8" fill="#bfe3ff"/>
    <rect x="222" y="22" width="30" height="56" rx="8" fill="${c.dark}"/>
    <rect x="282" y="16" width="9" height="15" rx="4" fill="#fff6b0"/>
    <rect x="282" y="69" width="9" height="15" rx="4" fill="#fff6b0"/>`;
}

const CITY: Skin = {
  id: 'city',
  label: 'City',
  hero: 'car',
  car: 'car',
  truck: 'truck',
  sky: '#c4e8fb',
  skyDark: '#8fbcd6',
  ink: '#2b3445',
  engine: 'car',
  vehicle: (length, color) => cityVehicle(length, color),
  // A traffic cone, from above.
  wall: `<rect x="12" y="12" width="76" height="76" rx="14" fill="#2b2f38"/>
    <circle cx="50" cy="50" r="32" fill="#ff7a1a"/><circle cx="50" cy="50" r="22" fill="#fff"/>
    <circle cx="50" cy="50" r="14" fill="#ff7a1a"/><circle cx="50" cy="50" r="5" fill="#ffd0a8"/>`,
  ground: `<rect width="600" height="600" fill="#5d6472"/>
    <g stroke="#ffffff55" stroke-width="3" stroke-dasharray="26 14">
      ${[100, 200, 300, 400, 500].map((v) => `<path d="M${v} 0V600M0 ${v}H600"/>`).join('')}
    </g>
    <rect y="200" width="600" height="100" fill="#ffffff10"/>`,
  frame: '#e3dccb',
  // An arrow out, and a chequered flag.
  exit: `<path d="M4 150h28" stroke="#fff" stroke-width="12" stroke-linecap="round"/><path d="M28 132 54 150 28 168Z" fill="#fff"/>
    <path d="M14 124V24" stroke="#3a3a44" stroke-width="5" stroke-linecap="round"/>
    <rect x="14" y="24" width="40" height="28" fill="#fff" stroke="#3a3a44" stroke-width="3"/>
    <path d="M14 24h10v7H14zM34 24h10v7H34zM24 31h10v7H24zM44 31h10v7H44zM14 38h10v7H14zM34 38h10v7H34zM24 45h10v7H24zM44 45h10v7H44z" fill="#3a3a44"/>`,
};

// --- Farm: tractors and hay wagons in a barnyard ---------------------------------

function farmVehicle(length: number, c: VehicleColor): string {
  const long = length * 100;
  const shadow = `<rect x="14" y="12" width="${long - 22}" height="80" rx="18" fill="#00000026"/>`;
  if (length === 2) {
    return `${shadow}
      <rect x="22" y="2" width="62" height="22" rx="8" fill="#2f2a26"/>
      <rect x="22" y="76" width="62" height="22" rx="8" fill="#2f2a26"/>
      <rect x="140" y="10" width="38" height="16" rx="6" fill="#2f2a26"/>
      <rect x="140" y="74" width="38" height="16" rx="6" fill="#2f2a26"/>
      <rect x="104" y="24" width="88" height="52" rx="14" fill="${c.fill}" stroke="${c.dark}" stroke-width="4"/>
      <path d="M118 36h60M118 50h60M118 64h60" stroke="${c.dark}" stroke-width="4" stroke-linecap="round"/>
      <rect x="18" y="18" width="94" height="64" rx="14" fill="${c.fill}" stroke="${c.dark}" stroke-width="4"/>
      <circle cx="124" cy="30" r="6" fill="#555"/>`;
  }
  return `${shadow}
    <path d="M258 50h34" stroke="#6b4a2d" stroke-width="8" stroke-linecap="round"/>
    <circle cx="290" cy="50" r="7" fill="none" stroke="#6b4a2d" stroke-width="5"/>
    ${[40, 220].map((x) => `<rect x="${x}" y="2" width="36" height="14" rx="5" fill="#2f2a26"/><rect x="${x}" y="84" width="36" height="14" rx="5" fill="#2f2a26"/>`).join('')}
    <rect x="8" y="10" width="252" height="80" rx="10" fill="${c.fill}" stroke="${c.dark}" stroke-width="4"/>
    <rect x="22" y="20" width="224" height="60" rx="22" fill="#f2d16b"/>
    <path d="M40 34l20 6M80 60l24-4M120 32l18 8M170 58l22-6M205 36l18 6M60 66l16-6" stroke="#c9a23f" stroke-width="4" stroke-linecap="round"/>`;
}

const FARM: Skin = {
  id: 'farm',
  label: 'Farm',
  hero: 'tractor',
  car: 'tractor',
  truck: 'hay wagon',
  sky: '#d7f0b8',
  skyDark: '#9dc47a',
  ink: '#2b3445',
  engine: 'tractor',
  vehicle: (length, color) => farmVehicle(length, color),
  // A round hay bale.
  wall: `<circle cx="53" cy="55" r="38" fill="#00000026"/><circle cx="50" cy="50" r="38" fill="#e9c46a" stroke="#b8923a" stroke-width="4"/>
    <path d="M50 50m-6 0a6 6 0 1 1 12 0a12 12 0 1 1-24 0a18 18 0 1 1 36 0a24 24 0 1 1-48 0" fill="none" stroke="#b8923a" stroke-width="3.5"/>`,
  ground: `<rect width="600" height="600" fill="#c9a36b"/>
    <g fill="#b89058">${[
      [70, 80], [260, 40], [480, 130], [150, 330], [390, 420], [530, 520], [90, 520], [300, 560],
    ].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="34" ry="16"/>`).join('')}</g>
    <g stroke="#00000018" stroke-width="3">${[100, 200, 300, 400, 500].map((v) => `<path d="M${v} 0V600M0 ${v}H600"/>`).join('')}</g>`,
  frame: '#8b5a36',
  // An arrow out, and a pennant on a fence post.
  exit: `<path d="M4 150h28" stroke="#fff" stroke-width="12" stroke-linecap="round"/><path d="M28 132 54 150 28 168Z" fill="#fff"/>
    <path d="M14 124V24" stroke="#6b4a2d" stroke-width="6" stroke-linecap="round"/>
    <path d="M16 25 56 38 16 52Z" fill="#e53935"/>`,
};

// --- Space: rockets, shuttles and cargo ships at a dock ---------------------------

function spaceVehicle(length: number, c: VehicleColor, hero: boolean): string {
  const long = length * 100;
  const nose = long - 6;
  const flame = hero
    ? `<path d="M14 36 -4 50 14 64Z" fill="#ffb02e"/><path d="M14 42 4 50 14 58Z" fill="#fff2a8"/>`
    : `<rect x="8" y="38" width="10" height="24" rx="4" fill="#ffb02e"/>`;
  const hull =
    length === 2
      ? `<path d="M18 22Q18 12 30 12H132Q180 16 ${nose} 50Q180 84 132 88H30Q18 88 18 78Z" fill="${c.fill}" stroke="${c.dark}" stroke-width="4"/>
         <ellipse cx="150" cy="50" rx="18" ry="15" fill="#bfe3ff" stroke="${c.dark}" stroke-width="3"/>`
      : `<path d="M18 20Q18 10 30 10H232Q280 16 ${nose} 50Q280 84 232 90H30Q18 90 18 80Z" fill="${c.fill}" stroke="${c.dark}" stroke-width="4"/>
         ${[46, 104].map((x) => `<rect x="${x}" y="26" width="46" height="48" rx="8" fill="${c.dark}"/>`).join('')}
         <ellipse cx="250" cy="50" rx="18" ry="15" fill="#bfe3ff" stroke="${c.dark}" stroke-width="3"/>`;
  return `<rect x="16" y="14" width="${long - 24}" height="80" rx="30" fill="#00000040"/>
    <path d="M30 12 16 0H52L66 12ZM30 88 16 100H52L66 88Z" fill="${c.dark}"/>
    ${flame}${hull}`;
}

const SPACE: Skin = {
  id: 'space',
  label: 'Space',
  hero: 'rocket',
  car: 'shuttle',
  truck: 'cargo ship',
  sky: '#2b2f5c',
  skyDark: '#161936',
  ink: '#f4f6ff',
  engine: 'rocket',
  vehicle: spaceVehicle,
  // A lumpy asteroid.
  wall: `<path d="M22 38 38 16 66 14 86 34 84 64 64 86 34 84 16 62Z" fill="#8a8494" stroke="#5d5868" stroke-width="4"/>
    <circle cx="40" cy="42" r="9" fill="#6f6979"/><circle cx="64" cy="62" r="7" fill="#6f6979"/><circle cx="62" cy="34" r="4" fill="#6f6979"/>`,
  ground: `<rect width="600" height="600" fill="#1d2448"/>
    <g stroke="#7f8cff33" stroke-width="3">${[100, 200, 300, 400, 500].map((v) => `<path d="M${v} 0V600M0 ${v}H600"/>`).join('')}</g>
    <g fill="#fff">${[
      [40, 60, 2], [170, 30, 3], [320, 90, 2], [450, 40, 3], [560, 150, 2], [80, 240, 3], [260, 180, 2],
      [520, 300, 3], [130, 400, 2], [360, 360, 3], [470, 480, 2], [40, 560, 3], [230, 520, 2], [580, 580, 2],
    ].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>
    <rect y="200" width="600" height="100" fill="#7f8cff18"/>`,
  frame: '#aab4d6',
  // A glowing gate out, and a beacon flag.
  exit: `<circle cx="20" cy="150" r="17" fill="#7fe3ff44" stroke="#7fe3ff" stroke-width="5"/><path d="M4 150h28" stroke="#fff" stroke-width="12" stroke-linecap="round"/><path d="M28 132 54 150 28 168Z" fill="#fff"/>
    <path d="M14 124V24" stroke="#aab4d6" stroke-width="5" stroke-linecap="round"/>
    <path d="M16 25 56 38 16 52Z" fill="#ffd23f"/>`,
};

export const SKINS: readonly Skin[] = [CITY, FARM, SPACE];

export function skinById(id: string): Skin {
  return SKINS.find((s) => s.id === id) ?? CITY;
}

/** The red Vehicle alone, for the Skin picker. */
export function heroPicture(skin: Skin): string {
  return `<svg viewBox="-10 -10 220 120" aria-hidden="true">${skin.vehicle(2, RED, true)}${face(100, 50)}</svg>`;
}
