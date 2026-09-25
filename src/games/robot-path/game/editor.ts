// Editing a Program with taps alone. Pure: every action returns a new Editor, or null
// when the tap isn't allowed (the Program is full, or it would nest a Repeat Block).

import { MAX_BODY, MAX_TIMES, MIN_TIMES, programLength, type Command, type Op, type Program } from './level';
import type { Address } from './engine';

export interface Editor {
  program: Program;
  /** The Repeat Block whose body has the cursor, or null for the end of the main bar. */
  body: number | null;
  /** A filled Slot the child tapped: the palette now replaces it, and ✕ deletes it. */
  selected: Address | null;
}

export const DEFAULT_TIMES = MIN_TIMES;

export function editorFor(program: Program): Editor {
  return { program, body: null, selected: null };
}

const replaced = <T>(list: readonly T[], i: number, value: T): T[] => list.map((item, j) => (j === i ? value : item));
const cost = (command: Command) => (command.op === 'repeat' ? 1 + command.body.length : 1);
const make = (op: Op): Command => (op === 'repeat' ? { op, times: DEFAULT_TIMES, body: [] } : { op });

/** Can this palette button do anything right now? */
export function canAdd(editor: Editor, op: Op, maxSlots: number): boolean {
  return add(editor, op, maxSlots) !== null;
}

/** A palette tap: replace the selected Command, or add at the cursor. */
export function add(editor: Editor, op: Op, maxSlots: number): Editor | null {
  const { program, body, selected } = editor;
  const free = maxSlots - programLength(program);

  if (selected) {
    const block = program[selected.slot]!;
    if (selected.inner !== undefined) {
      if (op === 'repeat' || block.op !== 'repeat') return null;
      const inner = [...block.body];
      inner[selected.inner] = { op };
      return { program: replaced(program, selected.slot, { ...block, body: inner }), body, selected: null };
    }
    const command = make(op);
    if (cost(command) - cost(block) > free) return null;
    return {
      program: replaced(program, selected.slot, command),
      body: op === 'repeat' ? selected.slot : body === selected.slot ? null : body,
      selected: null,
    };
  }

  if (free < 1) return null;
  if (body !== null) {
    const block = program[body]!;
    if (op === 'repeat' || block.op !== 'repeat' || block.body.length >= MAX_BODY) return null;
    return { program: replaced(program, body, { ...block, body: [...block.body, { op }] }), body, selected: null };
  }
  return { program: [...program, make(op)], body: op === 'repeat' ? program.length : null, selected: null };
}

/** Tap a filled Slot: select it, or unselect it if it already was. */
export function select(editor: Editor, at: Address): Editor {
  const same = editor.selected?.slot === at.slot && editor.selected.inner === at.inner;
  return { ...editor, selected: same ? null : at };
}

/** Tap an empty Slot: the cursor jumps to the end of the main bar, or of that Repeat Block's body. */
export function moveCursor(editor: Editor, body: number | null): Editor {
  return { ...editor, body, selected: null };
}

/** ✕ on the selected Command. Everything after it shifts left. */
export function remove(editor: Editor): Editor {
  const { program, body, selected } = editor;
  if (!selected) return editor;
  if (selected.inner !== undefined) {
    const block = program[selected.slot]!;
    if (block.op !== 'repeat') return editor;
    const inner = block.body.filter((_, i) => i !== selected.inner);
    return { program: replaced(program, selected.slot, { ...block, body: inner }), body, selected: null };
  }
  const next = program.filter((_, i) => i !== selected.slot);
  const cursor = body === null || body === selected.slot ? null : body > selected.slot ? body - 1 : body;
  return { program: next, body: cursor, selected: null };
}

/** Tap a Repeat Block's number: 2 → 3 → 4 → 5 → 2. */
export function cycleTimes(editor: Editor, slot: number): Editor {
  const block = editor.program[slot];
  if (block?.op !== 'repeat') return editor;
  const times = block.times >= MAX_TIMES ? MIN_TIMES : block.times + 1;
  return { ...editor, program: replaced(editor.program, slot, { ...block, times }), selected: null };
}

export function clear(): Editor {
  return editorFor([]);
}
