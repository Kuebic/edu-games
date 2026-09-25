// The Game Shelf Vite plugin: serves each games/<slug>/ folder as the page at /<slug>/,
// with its public/ files at /<slug>/<file>.
import { readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { Plugin } from 'vite';
import { discoverGames, filesIn } from './discover.ts';
import { isBuilt, type Game } from './entry.ts';

export function gameShelf(rootDir: string): Plugin {
  const gamesDir = join(rootDir, 'games');
  let games: Game[] = [];
  let built: Game[] = [];
  return {
    name: 'game-shelf',
    // Reads the Games, again on every dev server restart.
    config: () => {
      games = discoverGames(gamesDir);
      built = games.filter(isBuilt);
      return {
        build: {
          rollupOptions: {
            input: {
              hub: join(rootDir, 'index.html'),
              ...Object.fromEntries(built.map((game) => [game.slug, join(gamesDir, game.slug, 'index.html')])),
            },
          },
        },
      };
    },
    // Dev: /<slug>/ is the Game's page and /<slug>/<file> comes from its public/ folder,
    // both served by Vite itself. Every Game, even an Off one. Runs before Vite's own middleware.
    configureServer(server) {
      // A Game folder added, removed or renamed, or its game.json edited: restart, which reads the Games again.
      server.watcher.on('all', (_, path) => {
        if (/^[^/\\]+[/\\]game\.json$/.test(relative(gamesDir, path))) void server.restart();
      });
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://x');
        const [, slug, ...rest] = url.pathname.split('/');
        if (!slug || !games.some((game) => game.slug === slug)) return next();
        if (rest.length === 0) {
          res.writeHead(301, { Location: `/${slug}/${url.search}` }).end();
          return;
        }
        const path = rest.join('/');
        const file = path === '' || path === 'index.html' ? 'index.html' : `public/${path}`;
        req.url = `/games/${slug}/${file}${url.search}`;
        next();
      });
    },
    // Build, for Games that aren't Off: games/<slug>/index.html lands at <slug>/index.html,
    // and games/<slug>/public/ is copied to <slug>/. Runs after Vite has emitted the HTML.
    generateBundle: {
      order: 'post',
      handler(_, bundle) {
        for (const file of Object.values(bundle)) {
          const match = /^games\/([^/]+)\/index\.html$/.exec(file.fileName);
          if (match) file.fileName = `${match[1]}/index.html`;
        }
        for (const game of built) {
          const publicDir = join(gamesDir, game.slug, 'public');
          for (const path of filesIn(publicDir)) {
            this.emitFile({ type: 'asset', fileName: `${game.slug}/${relative(publicDir, path)}`, source: readFileSync(path) });
          }
        }
      },
    },
  };
}
