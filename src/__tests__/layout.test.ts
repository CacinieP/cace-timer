import { describe, it, expect } from 'vitest';
import { calculateLayout } from '../tui/layout';

describe('responsive terminal layout', () => {
  it.each([
    [120, 40],
    [80, 24],
    [60, 20],
    [40, 12],
    [20, 8],
    [8, 5],
    [1, 1],
  ])('keeps artwork, content and controls within %ix%i cells', (columns, rows) => {
    const layout = calculateLayout(columns, rows, 12);
    for (const rect of [layout.body, layout.footer, layout.mascot].filter(
      (item) => item !== undefined,
    )) {
      expect(rect.left).toBeGreaterThanOrEqual(0);
      expect(rect.top).toBeGreaterThanOrEqual(0);
      expect(rect.left + rect.width).toBeLessThanOrEqual(columns);
      expect(rect.top + rect.height).toBeLessThanOrEqual(rows);
    }
    expect(layout.body.top + layout.body.height).toBeLessThanOrEqual(layout.footer.top);
    if (layout.mascot) {
      expect(
        layout.mascot.left + layout.mascot.width <= layout.body.left ||
          layout.mascot.top + layout.mascot.height < layout.body.top,
      ).toBe(true);
    }
  });
  it('prioritizes controls over art in short windows', () => {
    expect(calculateLayout(20, 8, 7).mascot).toBeUndefined();
    expect(calculateLayout(120, 40, 12).mascot?.size).toBe('full');
    expect(calculateLayout(60, 24, 10).mascot?.size).toBe('compact');
    expect(calculateLayout(40, 20, 10).mascot?.size).toBe('tiny');
  });
});
