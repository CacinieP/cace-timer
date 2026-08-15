import { describe, it, expect, vi, afterEach } from 'vitest';
import type blessed from 'blessed';
import { destroyScreen, installSignalCleanup } from '../tui/lifecycle';

type Screen = blessed.Widgets.Screen;

function makeFakeScreen(): Screen {
  // The @types/blessed Screen type has hundreds of fields; we only stub
  // what destroyScreen actually calls. Cast through unknown to avoid
  // stubbing every property.
  return {
    destroy: vi.fn(),
    program: {
      showCursor: vi.fn(),
      normalCursor: vi.fn(),
    },
  } as unknown as Screen;
}

describe('destroyScreen', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls screen.destroy()', () => {
    const screen = makeFakeScreen();
    destroyScreen(screen);
    expect(screen.destroy).toHaveBeenCalledTimes(1);
  });

  it('calls showCursor and normalCursor on the program', () => {
    const screen = makeFakeScreen();
    destroyScreen(screen);
    const program = screen.program as unknown as {
      showCursor: ReturnType<typeof vi.fn>;
      normalCursor: ReturnType<typeof vi.fn>;
    };
    expect(program.showCursor).toHaveBeenCalledTimes(1);
    expect(program.normalCursor).toHaveBeenCalledTimes(1);
  });

  it('restores raw mode when stdin is a TTY', () => {
    const screen = makeFakeScreen();
    const setRawMode = vi.fn();
    // Replace stdin descriptor with a fake TTY carrying setRawMode.
    Object.defineProperty(process.stdin, 'isTTY', {
      value: true,
      configurable: true,
    });
    const originalSetRawMode = process.stdin.setRawMode;
    (process.stdin as unknown as { setRawMode: unknown }).setRawMode = setRawMode;

    try {
      destroyScreen(screen);
      expect(setRawMode).toHaveBeenCalledWith(false);
    } finally {
      (process.stdin as unknown as { setRawMode: unknown }).setRawMode =
        originalSetRawMode;
      Object.defineProperty(process.stdin, 'isTTY', {
        value: false,
        configurable: true,
      });
    }
  });

  it('does NOT call setRawMode when stdin is not a TTY', () => {
    const screen = makeFakeScreen();
    const setRawMode = vi.fn();
    Object.defineProperty(process.stdin, 'isTTY', {
      value: false,
      configurable: true,
    });
    const originalSetRawMode = process.stdin.setRawMode;
    (process.stdin as unknown as { setRawMode: unknown }).setRawMode = setRawMode;

    try {
      destroyScreen(screen);
      expect(setRawMode).not.toHaveBeenCalled();
    } finally {
      (process.stdin as unknown as { setRawMode: unknown }).setRawMode =
        originalSetRawMode;
    }
  });

  it('tolerates screen.destroy() throwing (already destroyed)', () => {
    const screen = {
      destroy: vi.fn(() => {
        throw new Error('already destroyed');
      }),
      program: {
        showCursor: vi.fn(),
        normalCursor: vi.fn(),
      },
    } as unknown as Screen;
    expect(() => destroyScreen(screen)).not.toThrow();
  });

  it('tolerates program methods throwing', () => {
    const screen = {
      destroy: vi.fn(),
      program: {
        showCursor: vi.fn(() => {
          throw new Error('program gone');
        }),
        normalCursor: vi.fn(() => {
          throw new Error('program gone');
        }),
      },
    } as unknown as Screen;
    expect(() => destroyScreen(screen)).not.toThrow();
  });

  it('tolerates missing normalCursor (older blessed versions)', () => {
    const screen = {
      destroy: vi.fn(),
      program: {
        showCursor: vi.fn(),
      },
    } as unknown as Screen;
    expect(() => destroyScreen(screen)).not.toThrow();
    const program = screen.program as unknown as {
      showCursor: ReturnType<typeof vi.fn>;
    };
    expect(program.showCursor).toHaveBeenCalledTimes(1);
  });
});

describe('installSignalCleanup', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    // Restore default signal handlers so other tests aren't affected.
    process.removeAllListeners('SIGINT');
    process.removeAllListeners('SIGTERM');
  });

  it('exits 130 for SIGINT after cleanup', () => {
    const screen = makeFakeScreen();
    const exit = vi
      .spyOn(process, 'exit')
      .mockImplementation((() => undefined) as never);

    installSignalCleanup(screen);
    process.emit('SIGINT');

    expect(screen.destroy).toHaveBeenCalledTimes(1);
    expect(exit).toHaveBeenCalledWith(130);
  });

  it('exits 143 for SIGTERM after cleanup', () => {
    const screen = makeFakeScreen();
    const exit = vi
      .spyOn(process, 'exit')
      .mockImplementation((() => undefined) as never);

    installSignalCleanup(screen);
    process.emit('SIGTERM');

    expect(screen.destroy).toHaveBeenCalledTimes(1);
    expect(exit).toHaveBeenCalledWith(143);
  });

  it('is idempotent — installing twice replaces the previous handler', () => {
    const screen1 = makeFakeScreen();
    const screen2 = makeFakeScreen();
    const exit = vi
      .spyOn(process, 'exit')
      .mockImplementation((() => undefined) as never);

    installSignalCleanup(screen1);
    installSignalCleanup(screen2);
    process.emit('SIGINT');

    // screen1 should NOT have been destroyed — its handler was replaced.
    expect(screen1.destroy).not.toHaveBeenCalled();
    expect(screen2.destroy).toHaveBeenCalledTimes(1);
    expect(exit).toHaveBeenCalledWith(130);
  });

  it('dispose() removes the signal handlers', () => {
    const screen = makeFakeScreen();
    const exit = vi
      .spyOn(process, 'exit')
      .mockImplementation((() => undefined) as never);

    const dispose = installSignalCleanup(screen);
    dispose();
    process.emit('SIGINT');

    expect(screen.destroy).not.toHaveBeenCalled();
    expect(exit).not.toHaveBeenCalled();
  });
});
