// The hub: one Shelf per Category, each holding a Tile per Game. Pictures first, so a
// pre-reader can find a game on their own.

import { registerOffline } from '../shared/pwa';
import { CATEGORIES, GAMES } from '../catalog/catalog';
import './style.css';

const root = document.querySelector<HTMLElement>('#app')!;

const page = document.createElement('main');
page.className = 'hub';
const title = document.createElement('h1');
title.textContent = 'Game Shelf';
page.append(title);

for (const category of CATEGORIES) {
  const games = GAMES.filter((game) => game.category === category.id);
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
