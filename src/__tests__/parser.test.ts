import { describe, it, expect } from 'vitest';
import { parseArgs } from '../parser';

describe('parseArgs', () => {
  it('parses no args', () => {
    const result = parseArgs([]);
    expect(result.command).toBe('');
    expect(result.positional).toEqual([]);
    expect(result.options).toEqual({});
  });

  it('parses a single command', () => {
    const result = parseArgs(['help']);
    expect(result.command).toBe('help');
  });

  it('parses command with positional args', () => {
    const result = parseArgs(['start', '写周报']);
    expect(result.command).toBe('start');
    expect(result.positional).toEqual(['写周报']);
  });

  it('parses flag with value', () => {
    const result = parseArgs(['start', 'task', '--tag', 'work']);
    expect(result.options.tag).toBe('work');
  });

  it('parses boolean flag', () => {
    const result = parseArgs(['list', '--today']);
    expect(result.options.today).toBe(true);
  });

  it('parses multiple flags', () => {
    const result = parseArgs(['start', 'task', '--tag', 'dev', '--estimate', '30']);
    expect(result.options.tag).toBe('dev');
    expect(result.options.estimate).toBe('30');
  });

  it('parses limit flag', () => {
    const result = parseArgs(['list', '--limit', '20']);
    expect(result.options.limit).toBe('20');
  });

  it('handles flag at end without value as boolean', () => {
    const result = parseArgs(['list', '--today', '--tag']);
    expect(result.options.today).toBe(true);
    expect(result.options.tag).toBe(true);
  });
});
