---
status: accepted
---

# Three Shelf statuses: On, Hidden, Off

Each Game's entry says whether it is On (Tile, built, precached), Hidden (built and precached, reachable by URL, no Tile) or Off (not built, not shipped, not precached). Hidden is exactly On without the Tile, so a grown-up can test a new Game offline on a real phone. Leaving Hidden Games out of the precache would mean tracing shared hashed chunks back to one Game. Off Games are still type-checked and tested, because Off means "not published", not "abandoned". A Game nobody will maintain gets deleted, and git keeps it. The dev server and dev Hub show every Game, marked, so an Off Game can be worked on without flipping it.
