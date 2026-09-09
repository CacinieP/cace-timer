import { describe, it, expect } from 'vitest';
import { EXPRESSIONS, SIZES, MascotSize } from '../mascot/assets/mint';
import { getFrame, plainFrame, renderFrame } from '../mascot/frames';
import { expressionForState } from '../mascot/state';
import { cellWidth } from '../terminal';

describe('MINT artwork', () => {
  it.each(EXPRESSIONS.map((item) => item.key))(
    '%s stays inside a fixed canvas in every size and charset',
    (expression) => {
      for (const size of Object.keys(SIZES) as MascotSize[]) {
        for (const ascii of [false, true]) {
          const frame = getFrame({ expression, size, ascii });
          const rows = plainFrame(frame).split('\n');
          expect(rows).toHaveLength(SIZES[size].height);
          for (const row of rows) expect(cellWidth(row)).toBe(frame.width);
          expect(plainFrame(frame)).not.toMatch(/[{}]/);
          expect(plainFrame(frame)).not.toContain('\x1b');
          if (ascii) expect(plainFrame(frame)).toMatch(/^[\x20-\x7e\n]*$/);
        }
      }
    },
  );

  it('keeps the balanced rounded jaw fixed between expressions, including whole-head tilts', () => {
    const baseline = getFrame().rows.slice(10, 14);
    const shape = (rows: typeof baseline): string[] =>
      rows.map((row) =>
        row
          .filter((span) => span.role === 's')
          .map((span) => span.text.replace(/[ᴗoｰv3~]/g, '.'))
          .join(''),
      );
    for (const item of EXPRESSIONS)
      expect(shape(getFrame({ expression: item.key }).rows.slice(10, 14))).toEqual(shape(baseline));
    const plain = plainFrame(getFrame()).split('\n');
    expect(plain[10].indexOf('(')).toBe(10);
    expect(plain[10].indexOf(')')).toBe(22);
    expect(plain[13]).toContain('╰─────╯');
    expect(plain[13]).not.toContain('_______');
    const compact = plainFrame(getFrame({ size: 'compact' })).split('\n');
    expect(compact[6].indexOf('(')).toBe(7);
    expect(compact[6].indexOf(')')).toBe(15);
    expect(compact[8]).toContain('╰───╯');
  });

  it('blinks without moving any other row, then restores the original frame', () => {
    const open = plainFrame(getFrame({ motion: true, elapsedMs: 0 }));
    const closed = plainFrame(getFrame({ motion: true, elapsedMs: 3850 }));
    expect(closed).not.toBe(open);
    expect(closed.split('\n').filter((row, i) => row !== open.split('\n')[i])).toHaveLength(1);
    expect(plainFrame(getFrame({ motion: true, elapsedMs: 4000 }))).toBe(open);
    expect(plainFrame(getFrame({ motion: false, elapsedMs: 3850 }))).toBe(open);
  });

  it('provides 16 distinct full expressions with no source mutations', () => {
    const before = plainFrame(getFrame());
    expect(
      new Set(EXPRESSIONS.map((item) => plainFrame(getFrame({ expression: item.key })))).size,
    ).toBe(16);
    expect(plainFrame(getFrame())).toBe(before);
  });

  it('renders explicit truecolor, 256-colour and plain output', () => {
    const frame = getFrame();
    expect(renderFrame(frame, { color: 'always' })).toContain('\x1b[38;2;114;203;187m');
    expect(renderFrame(frame, { color: '256' })).toContain('\x1b[38;5;');
    expect(renderFrame(frame, { color: 'never' })).toBe(plainFrame(frame));
    expect(renderFrame(frame, { color: 'never', format: 'blessed' })).not.toContain('{');
  });

  it('distinguishes successful jobs from task completion and failure', () => {
    expect(expressionForState('job_succeeded')).toBe('happy');
    expect(expressionForState('task_completed')).toBe('excited');
    expect(expressionForState('task_completed', 1100)).toBe('little_smile');
    expect(expressionForState('failed', 600)).toBe('head_tilt');
    expect(expressionForState('unclassified')).toBe('head_tilt');
  });
});
