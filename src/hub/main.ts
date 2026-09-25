// The hub: one Shelf per Category, each holding a Tile per On Game. Pictures first, so a
// pre-reader can find a game on their own.

import { registerOffline } from '../shared/pwa';
import { CATEGORIES, GAMES } from '../catalog/catalog';
import { tilesFor } from './tiles';
import './style.css';

const root = document.querySelector<HTMLElement>('#app')!;

const page = document.createElement('main');
page.className = 'hub';
const title = document.createElement('h1');
title.textContent = 'Game Shelf';
page.append(title);

for (const category of CATEGORIES) {
  const games = tilesFor(GAMES, category.id, import.meta.env.DEV);
  if (games.length === 0) continue;
  const shelf = document.createElement('section');
  shelf.className = 'shelf';
  shelf.style.setProperty('--shelf', category.color);
  const heading = document.createElement('h2');
  heading.innerHTML = `<span class="shelf-icon" aria-hidden="true">${category.icon}</span>`;
  heading.append(category.name);
  const tiles = document.createElement('div');
  tiles.className = 'tiles';
  for (const game of games) {
    const tile = document.createElement('a');
    tile.className = 'tile';
    tile.href = `/${game.slug}/`;
    // Dev only: marks a Hidden or Off Game's Tile.
    if (game.shelf !== 'on') tile.dataset.shelf = game.shelf;
    const picture = document.createElement('img');
    picture.src = `/${game.slug}/${game.tile}`;
    picture.alt = '';
    const name = document.createElement('span');
    name.textContent = game.name;
    tile.append(picture, name);
    tiles.append(tile);
  }
  shelf.append(heading, tiles);
  page.append(shelf);
}

root.replaceChildren(page);
document.addEventListener('contextmenu', (event) => event.preventDefault());
if (import.meta.env.PROD) registerOffline();
