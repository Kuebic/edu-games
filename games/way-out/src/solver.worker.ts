// Solves boards off the main thread, so asking for a hint never freezes a drag.

import { solve, type Board, type Move } from './game/board';

export interface SolveRequest {
  id: number;
  board: Board;
}

export interface SolveReply {
  id: number;
  moves: Move[] | null;
}

self.addEventListener('message', (event: MessageEvent<SolveRequest>) => {
  const { id, board } = event.data;
  const reply: SolveReply = { id, moves: solve(board) };
  self.postMessage(reply);
});
