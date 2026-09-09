export interface RefreshLoop {
  refresh(): void;
  dispose(): void;
}

// A single owned timer per screen. The caller only writes changed content;
// this clock never changes task data or signals business completion.
export function startRefreshLoop(
  render: (elapsedMs: number) => void,
  onError: (error: unknown) => void,
  intervalMs = 100,
  now: () => number = () => performance.now(),
): RefreshLoop {
  const startedAt = now();
  let disposed = false;
  const dispose = (): void => {
    if (disposed) return;
    disposed = true;
    clearInterval(timer);
  };
  const refresh = (): void => {
    if (disposed) return;
    try {
      render(Math.max(0, now() - startedAt));
    } catch (error) {
      dispose();
      onError(error);
    }
  };
  const timer = setInterval(refresh, intervalMs);
  refresh();
  return { refresh, dispose };
}
