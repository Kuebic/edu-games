import { fileURLToPath } from 'node:url';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';
import { gameShelf } from './src/catalog/plugin.ts';

const page = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: { alias: { '@shared': page('src/shared') } },
  // Every imported file becomes one hashed file in assets/, never a data: URI in the JS or CSS.
  build: { assetsInlineLimit: 0 },
  plugins: [
    // Each games/<slug>/ folder becomes the page at /<slug>/.
    gameShelf(page('.')),
    // One service worker for the whole site: install once, every game works offline.
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      workbox: {
        // A new deploy takes over as soon as it has installed, and autoUpdate reloads the page onto it. The
        // plugin only sets these itself when it injects the register script, and the shell registers instead,
        // so without them a new version waited until every tab of the site was closed.
        skipWaiting: true,
        clientsClaim: true,
        // A new asset file type (mp3, webp, woff2) must be added here, or it isn't precached.
        globPatterns: ['**/*.{js,css,html,png,svg,ogg,mp3,webmanifest}'],
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
