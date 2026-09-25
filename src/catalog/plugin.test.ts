// The dev server side of the Game Shelf plugin, run on a scratch site: each Game's page and
// public files at /<slug>/, kept up to date as Game folders come and go while it runs.
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer, type ViteDevServer } from 'vite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { gameShelf } from './plugin.ts';

const root = mkdtempSync(join(tmpdir(), 'game-shelf-'));
const page = (title: string) => `<!doctype html><title>${title}</title>`;

function addGame(slug: string, name: string) {
  const dir = join(root, 'games', slug);
  mkdirSync(join(dir, 'public'), { recursive: true });
  writeFileSync(join(dir, 'index.html'), page(name));
  writeFileSync(join(dir, 'public/icon.webp'), 'RIFF');
  const entry = { name, category: 'logic', tile: 'icon.webp', shelf: 'on', added: '2026-01-01' };
  writeFileSync(join(dir, 'game.json'), JSON.stringify(entry));
}

let server: ViteDevServer;
const get = (path: string) => fetch(new URL(path, server.resolvedUrls!.local[0]), { redirect: 'manual' });
const title = async (path: string) => /<title>([^<]*)/.exec(await (await get(path)).text())?.[1];

/** What read() gives once it is want, or after 3 s. The watcher takes a moment to see a change. */
async function becomes<T>(read: () => Promise<T>, want: T) {
  const until = Date.now() + 3000;
  // Nothing while the server restarts.
  const now = () => read().catch(() => undefined);
  let got = await now();
  while (got !== want && Date.now() < until) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    got = await now();
  }
  return got;
}

describe('the dev server', () => {
  beforeAll(async () => {
    writeFileSync(join(root, 'index.html'), page('Hub'));
    addGame('one', 'One');
    server = await createServer({
      configFile: false,
      root,
      logLevel: 'silent',
      plugins: [gameShelf(root)],
      server: { host: '127.0.0.1', port: 0 },
      optimizeDeps: { noDiscovery: true },
    });
    await server.listen();
  });

  afterAll(async () => {
    await server.close();
    rmSync(root, { recursive: true, force: true });
  });

  it('serves a Game page at /<slug>/', async () => {
    expect((await get('/one')).headers.get('location')).toBe('/one/');
    expect(await title('/one/')).toBe('One');
    expect(await title('/one/index.html')).toBe('One');
  });

  it('serves public files with their own type', async () => {
    const res = await get('/one/icon.webp');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('image/webp');
  });

  it('answers a bad escape without an error', async () => {
    expect((await get('/one/%E0%A4%A')).status).toBeLessThan(500);
  });

  it('picks up a Game folder added while it runs', async () => {
    addGame('two', 'Two');
    expect(await becomes(() => title('/two/'), 'Two')).toBe('Two');
    expect((await get('/two/icon.webp')).headers.get('content-type')).toBe('image/webp');
  });

  it('lets go of a Game folder removed while it runs', async () => {
    rmSync(join(root, 'games/two'), { recursive: true });
    // A Game's address without the slash is sent to /<slug>/; a folder that's gone isn't.
    expect(await becomes(async () => (await get('/two')).status, 200)).toBe(200);
  });
});
