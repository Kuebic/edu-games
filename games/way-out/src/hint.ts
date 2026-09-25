// The next best Move from wherever the board is now. Solving runs in a Worker; each answer
// also covers every board along its solution, so following the hints costs one solve.

import { apply, solve, type Board, type Move } from './game/board';
import type { SolveReply, SolveRequest } from './solver.worker';

let worker: Worker | null | undefined;
let asked = 0;
const waiting = new Map<number, { board: Board; resolve: (moves: Move[] | null) => void }>();
const known = new Map<Board, Promise<Move | null>>();

function startWorker(): Worker | null {
  try {
    const started = new Worker(new URL('./solver.worker.ts', import.meta.url), { type: 'module' });
    started.addEventListener('message', (event: MessageEvent<SolveReply>) => {
      waiting.get(event.data.id)?.resolve(event.data.moves);
      waiting.delete(event.data.id);
    });
    started.addEventListener('error', () => {
      // Fall back to solving here, and answer anything still waiting.
      worker = null;
      for (const { board, resolve } of waiting.values()) resolve(solve(board));
      waiting.clear();
    });
    return started;
  } catch {
    return null;
  }
}

function solveSomewhere(board: Board): Promise<Move[] | null> {
  if (worker === undefined) worker = startWorker();
  if (!worker) return Promise.resolve(solve(board));
  const request: SolveRequest = { id: ++asked, board };
  return new Promise((resolve) => {
    waiting.set(request.id, { board, resolve });
    worker!.postMessage(request);
  });
}

export function nextMove(board: Board): Promise<Move | null> {
  const cached = known.get(board);
  if (cached) return cached;
  const answer = solveSomewhere(board).then((moves) => {
    // Remember the rest of the solution for the boards along it.
    let at = board;
    moves?.forEach((move, i) => {
      if (i > 0) known.set(at, Promise.resolve(move));
      at = apply(at, move);
    });
    return moves?.[0] ?? null;
  });
  known.set(board, answer);
  return answer;
}
