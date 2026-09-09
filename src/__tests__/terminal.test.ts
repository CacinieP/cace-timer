import { describe, it, expect } from 'vitest';
import { resolveColor, fitText, safeText, cellWidth } from '../terminal';
import { parseArgs } from '../parser';

describe('terminal display options', () => {
  it('honours NO_COLOR, dumb terminals, redirection and explicit overrides', () => {
    expect(resolveColor('auto', false, {})).toBe('never');
    expect(resolveColor('auto', true, { NO_COLOR: '' })).toBe('never');
    expect(resolveColor('auto', true, { TERM: 'dumb' })).toBe('never');
    expect(resolveColor('auto', true, { COLORTERM: 'truecolor' })).toBe('always');
    expect(resolveColor('auto', true, {})).toBe('256');
    expect(resolveColor('always', false, { NO_COLOR: '1' })).toBe('always');
  });
  it('clips by terminal cells, preserving CJK characters and combining marks', () => {
    expect(fitText('中文标题', 3)).toBe('中~');
    expect(fitText('ábc', 3)).toBe('ábc');
    expect(fitText('abc', 0)).toBe('');
    expect(fitText('abc', 1)).toBe('~');
    for (const width of [1, 2, 5, 10])
      expect(cellWidth(fitText('很长的任务 task', width))).toBeLessThanOrEqual(width);
  });
  it('removes cursor, clipboard and line-breaking controls from task text', () => {
    expect(safeText('task\x1b[2J\x1b]52;c;secret\x07\nnext')).toBe('task next');
    expect(safeText('\x1b[31mred\x1b[0m')).toBe('red');
  });
  it('does not consume a command after a boolean option', () => {
    const parsed = parseArgs([
      '--ascii',
      '--no-animation',
      '--no-tui',
      'mascot',
      'preview',
      '--all',
    ]);
    expect(parsed.command).toBe('mascot');
    expect(parsed.positional).toEqual(['preview']);
    expect(parsed.options).toEqual({
      ascii: true,
      'no-animation': true,
      'no-tui': true,
      all: true,
    });
  });
});
