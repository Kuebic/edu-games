import { fileURLToPath } from 'node:url';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';
import { GAMES } from './src/hub/catalog.ts';

const page = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: { alias: { '@shared': page('src/shared') } },
  build: {
    rollupOptions: {
      input: {
        hub: page('index.html'),
        ...Object.fromEntries(GAMES.map((game) => [game.slug, page(`${game.slug}/index.html`)])),
      },
    },
  },
  plugins: [
    // One service worker for the whole site: install once, every game works offline.
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ogg,webmanifest}'],
        // Each game has its own index.html; never answer a game URL with the hub page.
        navigateFallback: null,
      },
      manifest: {
        name: 'Game Shelf',
        short_name: 'Game Shelf',
        description: 'Gentle learning games for little kids.',
        start_url: '/',
        scope: '/',
        display: 'fullscreen',
        orientation: 'portrait',
        background_color: '#fff6e8',
        theme_color: '#fff6e8',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  test: {
    environment: 'node',
  },
});
