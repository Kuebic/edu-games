import { describe, expect, it } from 'vitest';
import { add, canAdd, cycleTimes, editorFor, moveCursor, remove, select, type Editor } from './editor';
import type { Op } from './level';

function tap(editor: Editor, maxSlots: number, ...ops: Op[]): Editor {
  return ops.reduce((e, op) => add(e, op, maxSlots)!, editor);
}

describe('editor', () => {
  it('adds at the end, and stops when the Program is full', () => {
    const full = tap(editorFor([]), 3, 'right', 'right', 'up');
    expect(full.program).toEqual([{ op: 'right' }, { op: 'right' }, { op: 'up' }]);
    expect(add(full, 'down', 3)).toBeNull();
    expect(canAdd(full, 'down', 3)).toBe(false);
  });

  it('replaces a selected Command, and ✕ deletes it', () => {
    const editor = select(tap(editorFor([]), 5, 'right', 'up', 'left'), { slot: 1 });
    const replaced = add(editor, 'down', 5)!;
    expect(replaced.program.map((c) => c.op)).toEqual(['right', 'down', 'left']);
    expect(replaced.selected).toBeNull();
    expect(remove(editor).program.map((c) => c.op)).toEqual(['right', 'left']);
  });

  it('replaces even when the Program is full', () => {
    const full = select(tap(editorFor([]), 2, 'right', 'up'), { slot: 0 });
    expect(add(full, 'down', 2)!.program.map((c) => c.op)).toEqual(['down', 'up']);
  });

  it('tapping the selected Slot again unselects it', () => {
    const once = select(editorFor([{ op: 'up' }]), { slot: 0 });
    expect(select(once, { slot: 0 }).selected).toBeNull();
  });

  it('opens a Repeat Block body and fills it, up to four', () => {
    const editor = tap(editorFor([]), 9, 'right', 'repeat', 'up', 'right', 'up', 'right');
    expect(editor.body).toBe(1);
    expect(editor.program[1]).toEqual({ op: 'repeat', times: 2, body: [{ op: 'up' }, { op: 'right' }, { op: 'up' }, { op: 'right' }] });
    expect(add(editor, 'up', 9)).toBeNull();
    const out = add(moveCursor(editor, null), 'down', 9)!;
    expect(out.program.map((c) => c.op)).toEqual(['right', 'repeat', 'down']);
  });

  it('never nests Repeat Blocks', () => {
    const editor = tap(editorFor([]), 9, 'repeat', 'up');
    expect(add(editor, 'repeat', 9)).toBeNull();
    expect(add(select(editor, { slot: 0, inner: 0 }), 'repeat', 9)).toBeNull();
  });

  it('cycles the number 2 → 3 → 4 → 5 → 2', () => {
    let editor = tap(editorFor([]), 4, 'repeat');
    const seen = [];
    for (let i = 0; i < 5; i++) {
      editor = cycleTimes(editor, 0);
      seen.push(editor.program[0]!.op === 'repeat' && editor.program[0]!.times);
    }
    expect(seen).toEqual([3, 4, 5, 2, 3]);
  });

  it('deleting a Repeat Block takes its body and moves the cursor out', () => {
    const editor = tap(editorFor([]), 9, 'up', 'repeat', 'right');
    const gone = remove(select(editor, { slot: 1 }));
    expect(gone.program).toEqual([{ op: 'up' }]);
    expect(gone.body).toBeNull();
  });

  it('deleting inside a body keeps the rest', () => {
    const editor = tap(editorFor([]), 9, 'repeat', 'up', 'right');
    expect(remove(select(editor, { slot: 0, inner: 0 })).program[0]).toEqual({ op: 'repeat', times: 2, body: [{ op: 'right' }] });
  });
});
