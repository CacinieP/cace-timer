import { afterEach, describe, expect, it, vi } from 'vitest';
import { startRefreshLoop } from '../tui/animation';
import { showCaceAnimation } from '../mascot';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('owned animation clock', () => {
  it('repaints on demand and stops all scheduled work on dispose', () => {
    vi.useFakeTimers();
    const render = vi.fn();
    const loop = startRefreshLoop(render, vi.fn(), 100, Date.now);
    expect(render).toHaveBeenCalledWith(0);
    vi.advanceTimersByTime(400);
    expect(render).toHaveBeenLastCalledWith(400);
    loop.dispose();
    loop.dispose();
    const calls = render.mock.calls.length;
    vi.advanceTimersByTime(10000);
    loop.refresh();
    expect(render).toHaveBeenCalledTimes(calls);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('reports a render failure once and stops instead of completing a task', () => {
    vi.useFakeTimers();
    const error = new Error('render failed');
    const failure = vi.fn();
    startRefreshLoop(() => {
      throw error;
    }, failure);
    vi.advanceTimersByTime(10000);
    expect(failure).toHaveBeenCalledExactlyOnceWith(error);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('one-shot task feedback does not clear the screen or schedule an intro delay', async () => {
    vi.useFakeTimers();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const clear = vi.spyOn(console, 'clear').mockImplementation(() => {});
    await showCaceAnimation('Started');
    expect(vi.getTimerCount()).toBe(0);
    expect(clear).not.toHaveBeenCalled();
  });
});
