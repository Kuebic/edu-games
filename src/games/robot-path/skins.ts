// Skins: art for the board, drawn as SVG in cell units so there's nothing to download.
// A Skin only changes looks and sounds. Letters, numbers and the grid are the same in every Skin.
// Sprites are centred on (0, 0) and about one cell across; the robot is drawn facing up.

import type { SkinId } from './progress';

export interface Skin {
  id: SkinId;
  name: string;
  /** Page, title and frame colours. */
  sky: string;
  title: string;
  frame: string;
  floor: [string, string];
  wall: string;
  flag: string;
  gem: string;
  crate: string;
  target: string;
  robot: string;
}

const eyes = (white = '#fff') =>
  `<circle cx="-0.14" cy="-0.28" r="0.11" fill="${white}" stroke="#1f2937" stroke-width="0.035"/>` +
  `<circle cx="0.14" cy="-0.28" r="0.11" fill="${white}" stroke="#1f2937" stroke-width="0.035"/>` +
  `<circle cx="-0.14" cy="-0.31" r="0.05" fill="#1f2937"/><circle cx="0.14" cy="-0.31" r="0.05" fill="#1f2937"/>`;

/** The arrow on the robot's body, so its facing is plain even without the eyes. */
const chestArrow = (color: string) => `<path d="M0 -0.1 0.14 0.1H-0.14Z" fill="${color}" stroke="${color}" stroke-width="0.04" stroke-linejoin="round"/>`;

const GARDEN: Skin = {
  id: 'garden',
  name: 'Garden',
  sky: '#dff3c9',
  title: '#2b3445',
  frame: '#6aa84f',
  floor: ['#a9dc8b', '#9fd47f'],
  wall:
    '<rect x="-0.47" y="-0.47" width="0.94" height="0.94" rx="0.22" fill="#3f8f3a"/>' +
    '<circle cx="-0.2" cy="-0.18" r="0.17" fill="#58a94c"/><circle cx="0.18" cy="-0.1" r="0.15" fill="#58a94c"/>' +
    '<circle cx="-0.05" cy="0.2" r="0.16" fill="#58a94c"/><circle cx="0.24" cy="0.26" r="0.06" fill="#ff8fb8"/>',
  flag:
    '<ellipse cx="0" cy="0.34" rx="0.2" ry="0.07" fill="#00000026"/><path d="M-0.12 0.34V-0.38" stroke="#6b4b2a" stroke-width="0.07" stroke-linecap="round"/>' +
    '<path d="M-0.1 -0.38 0.32 -0.22 -0.1 -0.06Z" fill="#ef4444" stroke="#b91c1c" stroke-width="0.03" stroke-linejoin="round"/>',
  gem:
    [0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-0.15" rx="0.11" ry="0.16" fill="#ff7eb6" transform="rotate(${a})"/>`).join('') +
    '<circle r="0.1" fill="#ffd23f" stroke="#e8a900" stroke-width="0.03"/>',
  crate:
    '<path d="M-0.3 -0.34H0.3L0.34 0.36H-0.34Z" fill="#f3e2b8" stroke="#a37b3f" stroke-width="0.05" stroke-linejoin="round"/>' +
    '<path d="M-0.3 -0.22H0.3" stroke="#a37b3f" stroke-width="0.04"/>' +
    '<circle cx="0" cy="0.06" r="0.08" fill="#ffd23f"/>' +
    [0, 90, 180, 270].map((a) => `<ellipse cx="0" cy="-0.1" rx="0.06" ry="0.08" fill="#ff7eb6" transform="translate(0 0.06) rotate(${a})"/>`).join(''),
  target:
    '<ellipse cx="0" cy="0" rx="0.4" ry="0.36" fill="#8a5a36"/><ellipse cx="0" cy="0" rx="0.3" ry="0.26" fill="#a06a40"/>' +
    '<path d="M-0.15 -0.05h0.06M0.08 0.1h0.06M0 -0.14h0.05" stroke="#6d4428" stroke-width="0.04" stroke-linecap="round"/>',
  robot:
    '<rect x="-0.3" y="-0.3" width="0.6" height="0.62" rx="0.17" fill="#2fb5a8" stroke="#1d7c73" stroke-width="0.05"/>' +
    '<path d="M0 0.32V0.4" stroke="#1d7c73" stroke-width="0.05"/>' +
    chestArrow('#fff') + eyes(),
};

const PLANET: Skin = {
  id: 'planet',
  name: 'Planet',
  sky: '#2b2350',
  title: '#ffffff',
  frame: '#6b5bd6',
  floor: ['#f0b27a', '#e9a66b'],
  wall:
    '<path d="M-0.42 0.3C-0.48 -0.05 -0.3 -0.42 0.05 -0.42C0.4 -0.4 0.5 -0.05 0.42 0.3C0.3 0.45 -0.3 0.45 -0.42 0.3Z" fill="#8b6b5c" stroke="#5f463b" stroke-width="0.05"/>' +
    '<ellipse cx="-0.08" cy="-0.1" rx="0.14" ry="0.1" fill="#a58576"/><circle cx="0.18" cy="0.14" r="0.07" fill="#6f5446"/>',
  flag:
    '<ellipse cx="0" cy="0.34" rx="0.22" ry="0.07" fill="#00000030"/><path d="M0 0.34V-0.12" stroke="#cbd5e1" stroke-width="0.07"/>' +
    '<path d="M-0.18 0.34 0 0.12 0.18 0.34" fill="none" stroke="#cbd5e1" stroke-width="0.05"/>' +
    '<circle cx="0" cy="-0.24" r="0.2" fill="#ff4d6d" opacity="0.35"/><circle cx="0" cy="-0.24" r="0.12" fill="#ff4d6d" stroke="#fff" stroke-width="0.03"/>',
  gem:
    '<path d="M0 -0.36 0.22 -0.06 0 0.34 -0.22 -0.06Z" fill="#5ce1e6" stroke="#0e9aa7" stroke-width="0.04" stroke-linejoin="round"/>' +
    '<path d="M0 -0.36V0.34M-0.22 -0.06H0.22" stroke="#bff6f8" stroke-width="0.03"/>',
  crate:
    '<rect x="-0.34" y="-0.34" width="0.68" height="0.68" rx="0.08" fill="#9aa5b1" stroke="#5b6672" stroke-width="0.05"/>' +
    '<path d="M-0.34 -0.12H0.34M-0.34 0.12H0.34" stroke="#ffd23f" stroke-width="0.08"/>',
  target:
    '<circle r="0.4" fill="#d9d2e9" stroke="#8b7fc7" stroke-width="0.05"/><circle r="0.26" fill="none" stroke="#8b7fc7" stroke-width="0.04" stroke-dasharray="0.08 0.06"/>' +
    '<text y="0.1" text-anchor="middle" font-size="0.3" font-weight="900" fill="#8b7fc7" font-family="system-ui">H</text>',
  robot:
    '<rect x="-0.4" y="-0.22" width="0.13" height="0.2" rx="0.05" fill="#374151"/><rect x="0.27" y="-0.22" width="0.13" height="0.2" rx="0.05" fill="#374151"/>' +
    '<rect x="-0.4" y="0.12" width="0.13" height="0.2" rx="0.05" fill="#374151"/><rect x="0.27" y="0.12" width="0.13" height="0.2" rx="0.05" fill="#374151"/>' +
    '<rect x="-0.28" y="-0.3" width="0.56" height="0.64" rx="0.14" fill="#f8fafc" stroke="#94a3b8" stroke-width="0.05"/>' +
    '<rect x="-0.28" y="0.14" width="0.56" height="0.08" fill="#f97316"/>' +
    chestArrow('#f97316') + eyes('#fef9c3'),
};

const SEA: Skin = {
  id: 'sea',
  name: 'Sea',
  sky: '#cdeefb',
  title: '#2b3445',
  frame: '#1e88c9',
  floor: ['#8fd6f2', '#84cdec'],
  wall:
    '<path d="M-0.4 0.4C-0.46 0 -0.36 -0.3 -0.12 -0.4C0.1 -0.46 0.38 -0.34 0.42 -0.06C0.48 0.2 0.4 0.4 0.3 0.42Z" fill="#f07c6c" stroke="#c9574a" stroke-width="0.05"/>' +
    '<circle cx="-0.12" cy="-0.1" r="0.07" fill="#c9574a"/><circle cx="0.14" cy="0.08" r="0.06" fill="#c9574a"/><circle cx="-0.05" cy="0.22" r="0.05" fill="#c9574a"/>',
  flag:
    '<ellipse cx="0" cy="0.34" rx="0.2" ry="0.07" fill="#00000022"/><path d="M-0.14 0.34V-0.38" stroke="#475569" stroke-width="0.07" stroke-linecap="round"/>' +
    '<rect x="-0.12" y="-0.38" width="0.42" height="0.32" fill="#ef4444" stroke="#b91c1c" stroke-width="0.03"/>' +
    '<path d="M-0.12 -0.38 0.3 -0.06" stroke="#fff" stroke-width="0.07"/>',
  gem:
    '<path d="M-0.3 0.1C-0.3 -0.2 0.3 -0.2 0.3 0.1L0 0.3Z" fill="#fbcfe8" stroke="#db2777" stroke-width="0.04" stroke-linejoin="round"/>' +
    '<circle cx="0" cy="-0.02" r="0.14" fill="#fff" stroke="#cbd5e1" stroke-width="0.03"/><circle cx="-0.04" cy="-0.06" r="0.04" fill="#fff" opacity="0.9"/>',
  crate:
    '<rect x="-0.3" y="-0.36" width="0.6" height="0.72" rx="0.18" fill="#b7793f" stroke="#7c4a1e" stroke-width="0.05"/>' +
    '<path d="M-0.3 -0.16H0.3M-0.3 0.16H0.3" stroke="#6b7280" stroke-width="0.07"/>',
  target:
    '<circle r="0.38" fill="none" stroke="#fff" stroke-width="0.05" stroke-dasharray="0.1 0.07"/>' +
    '<path d="M-0.16 -0.16 0.16 0.16M0.16 -0.16 -0.16 0.16" stroke="#e11d48" stroke-width="0.08" stroke-linecap="round"/>',
  robot:
    '<path d="M-0.16 0.34 0 0.26 0.16 0.34 0 0.42Z" fill="#475569"/>' +
    '<rect x="-0.3" y="-0.34" width="0.6" height="0.68" rx="0.3" fill="#facc15" stroke="#ca8a04" stroke-width="0.05"/>' +
    '<rect x="-0.05" y="-0.1" width="0.1" height="0.12" fill="#ca8a04"/>' +
    chestArrow('#ca8a04') + eyes('#e0f2fe'),
};

export const SKIN_ART: Record<SkinId, Skin> = { garden: GARDEN, planet: PLANET, sea: SEA };

/** The same in every Skin: a white tile with the letter or number. */
export function tileMarkup(value: string | number): string {
  return (
    '<rect x="-0.33" y="-0.33" width="0.66" height="0.66" rx="0.12" fill="#fff" stroke="#2b3445" stroke-width="0.05"/>' +
    `<text y="0.17" text-anchor="middle" font-size="0.48" font-weight="800" fill="#2b3445" font-family="ui-rounded, system-ui, sans-serif">${value}</text>`
  );
}

/** A standalone SVG of one sprite, for buttons and the goal strip. */
export function spriteSvg(markup: string, className = ''): string {
  return `<svg class="${className}" viewBox="-0.5 -0.5 1 1" aria-hidden="true">${markup}</svg>`;
}
