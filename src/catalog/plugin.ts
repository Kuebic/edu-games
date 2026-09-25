// The Game Shelf Vite plugin: serves each games/<slug>/ folder as the page at /<slug>/,
// with its public/ files at /<slug>/<file>.
import { createReadStream, existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import type { Plugin } from 'vite';
import { GAMES } from '../hub/catalog.ts';

const MIME: Record<string, string> = {
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ogg': 'audio/ogg',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
};

const walk = (dir: string): string[] =>
  !existsSync(dir)
    ? []
    : readdirSync(dir, { recursive: true, withFileTypes: true })
        .filter((entry) => entry.isFile())
        .map((entry) => join(entry.parentPath, entry.name));

const isFile = (path: string) => existsSync(path) && statSync(path).isFile();

export function gameShelf(rootDir: string): Plugin {
  const gamesDir = join(rootDir, 'games');
  return {
    name: 'game-shelf',
    config: () => ({
      build: {
        rollupOptions: {
          input: {
            hub: join(rootDir, 'index.html'),
            ...Object.fromEntries(GAMES.map((game) => [game.slug, join(gamesDir, game.slug, 'index.html')])),
          },
        },
      },
    }),
    // Dev: /<slug>/ is the Game's page and /<slug>/<file> comes from its public/ folder.
    // Runs before Vite's own middleware.
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://x');
        const [, slug, ...rest] = url.pathname.split('/');
        if (!slug || !GAMES.some((game) => game.slug === slug)) return next();
        if (rest.length === 0) {
          res.writeHead(301, { Location: `/${slug}/${url.search}` }).end();
          return;
        }
        const path = rest.join('/');
        if (path === '' || path === 'index.html') {
          req.url = `/games/${slug}/index.html${url.search}`;
          return next();
        }
        const file = join(gamesDir, slug, 'public', ...rest.map(decodeURIComponent));
        if (!file.startsWith(join(gamesDir, slug, 'public')) || !isFile(file)) return next();
        res.setHeader('Content-Type', MIME[extname(file)] ?? 'application/octet-stream');
        createReadStream(file).pipe(res);
      });
    },
    // Build: games/<slug>/index.html lands at <slug>/index.html, and games/<slug>/public/
    // is copied to <slug>/. Runs after Vite has emitted the HTML.
    generateBundle: {
      order: 'post',
      handler(_, bundle) {
        for (const file of Object.values(bundle)) {
          const match = /^games\/([^/]+)\/index\.html$/.exec(file.fileName);
          if (match) file.fileName = `${match[1]}/index.html`;
        }
        for (const game of GAMES) {
          const publicDir = join(gamesDir, game.slug, 'public');
          for (const path of walk(publicDir)) {
            this.emitFile({ type: 'asset', fileName: `${game.slug}/${relative(publicDir, path)}`, source: readFileSync(path) });
          }
        }
      },
    },
  };
}
