---
status: accepted
---

# Hints solve the current Board, in a Worker

A hint is the first Move of a shortest solution from the Board as it is now, not from the start, so it still helps after a child has shuffled everything around. Rush Hour Moves can always be undone, so every reachable Board can still be solved and a hint always exists. Solving is a breadth-first search, a few milliseconds for easy Boards and up to about 50 ms for the hardest. It runs in a Web Worker so a hint never stalls a drag. Each answer also fills in the hints for every Board along its solution, so a child following hints costs one solve. If Workers aren't available it solves on the main thread. Hints never block the Sparkle, which is about the Move count only.
