import { describe, it, expect } from 'vitest';
import { generateId, formatDuration, formatTime, formatDate } from '../utils';

describe('generateId', () => {
  it('returns a non-empty string', () => {
    const id = generateId();
    expect(id).toBeTruthy();
    expect(typeof id).toBe('string');
  });

  it('generates unique ids', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

describe('formatDuration', () => {
  it('formats seconds only', () => {
    expect(formatDuration(0)).toBe('0s');
    expect(formatDuration(5000)).toBe('5s');
    expect(formatDuration(30000)).toBe('30s');
  });

  it('formats minutes and seconds', () => {
    expect(formatDuration(90000)).toBe('1m 30s');
    expect(formatDuration(3300000)).toBe('55m 0s');
  });

  it('formats hours, minutes and seconds', () => {
    expect(formatDuration(3661000)).toBe('1h 1m 1s');
    expect(formatDuration(7200000)).toBe('2h 0m 0s');
  });
});

describe('formatTime', () => {
  it('returns a non-empty string', () => {
    const result = formatTime(new Date().toISOString());
    expect(result).toBeTruthy();
  });
});

describe('formatDate', () => {
  it('returns a non-empty string', () => {
    const result = formatDate(new Date().toISOString());
    expect(result).toBeTruthy();
  });
});
