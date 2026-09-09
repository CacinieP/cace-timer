# cace-timer architecture (1.4.0)

`src/index.ts` parses CLI/display options, resolves locale, then routes to a
command or the interactive dashboard. `src/tui/index.ts` disables interactive
screens for non-TTY streams, `TERM=dumb`, or `--no-tui`.

```text
src/
  index.ts / parser.ts       command and option routing
  terminal.ts               display preferences, safe text, cell widths, colour
  data.ts / types.ts         existing JSON data and score/streak model
  commands/                 CLI actions; mascot.ts adds the preview entry
  mascot.ts                 compatibility facade; instant command feedback
  mascot/assets/mint.ts      art, 16 expressions, fixed sizes and palettes
  mascot/frames.ts           pure frame data; ANSI or blessed-tag rendering
  mascot/state.ts            verified state -> expression mapping
  tui/layout.ts             pure terminal-size layout selection
  tui/surface.ts             separate artwork and untrusted-text widgets
  tui/animation.ts           one owned refresh loop with error/dispose paths
  tui/dashboard.ts          menu and live elapsed-time display
  tui/countdown.ts           Promise<boolean> timer screen
  tui/reflection.ts          completion-note input
  tui/lifecycle.ts           shared screen, cursor, raw-mode and signal cleanup
```

The full art uses a fixed 38×17 canvas under the default terminal-width policy;
compact and tiny use 22×11 and 8×5. Rendering preserves each row's original
coordinates. Layout picks side-by-side full art when both columns fit, otherwise
stacks the largest fitting variant above content, finally hiding art. Footer
controls always have their own row. User text is clipped by display columns and
never parsed as blessed tags; terminal control sequences are removed.

The surface compares content and dimensions before rendering. A 100ms animation
clock provides a 200ms blink every 4 seconds; it does not control the task clock.
`--no-animation` keeps timer updates but produces static art. A preview with no
changing content does not repaint. Signals, normal screen destruction and
render failures dispose clocks and handlers.

`showCountdown()` resolves true only for natural completion and false for q/Esc
cancellation. Render failures reject. The caller archives a session only after
true. Ctrl+C/SIGTERM use 130/143 and restore the terminal; the existing active
session remains on disk after interruption. The command layer owns the single
completion bell. CLI errors set a nonzero exit status.

Persistence is still `loadData()` / `saveData()` over `~/.cace-timer.json`.
This release does not claim concurrent-write safety, pause/AFK accounting,
process observation, model inference or automatic scheduling. Those require
the next task/event/storage iteration. Old history stays compatible.

See [MINT design](design/mint.md) for source attribution and visual decisions.
`docs/tui-audit.md` is a historical audit, not the current behavior reference.

Validation commands: `npm run build`, `npm run lint`, `npm test`,
`npm run test:cli`, and `npm run test:pty` (POSIX + Python 3). Both integration
launchers isolate timer data in temporary directories. CI and publishing run
the built CLI and PTY checks in addition to unit tests.
