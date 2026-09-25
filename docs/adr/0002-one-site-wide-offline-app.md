---
status: accepted
---

# One installable app for the whole site

There is one web app manifest and one service worker (vite-plugin-pwa, `generateSW`), scoped to `/`. It precaches every built Game's pages, code, pictures and sounds (see 0004). Installing from any page puts one "Game Shelf" icon on the home screen that opens the Hub, and every game then works offline. Games don't ship their own manifest or service worker: Snack Math's hand-written `sw.js` and Push Pals's own PWA config were dropped when they moved in. `navigateFallback` is off so a game's URL is never answered with the Hub page. The cost is that a child can't have one game alone as its own icon. We accepted that to keep one install and one cache to reason about.
