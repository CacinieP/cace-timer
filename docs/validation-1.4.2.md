# Version 1.4.2 local validation

2026-09-09, macOS / Apple Silicon, Node 22.22.3. Scope: lower face artwork,
the muted contour colour token, README portrait and release metadata.

- TypeScript build and ESLint passed, with no lint warnings or errors.
- 77 unit tests passed in 9 files; 5 built CLI checks passed.
- All 16 expressions passed alignment checks with `NCURSES_CJK_WIDTH=2`.
- Actual source frames were rendered for comparison, blink and palette review.
  Full/compact contours retain the previous width; blinking changes only eyes.
- Both palettes support the new contour colour. Plain/ASCII output preserves
  punctuation without colour tokens or terminal control sequences.

No process/timer lifecycle logic changes. The previous 1.4.0 PTY suite was not
rerun for this visual patch; native terminal font differences remain unverified.
No remote CI was triggered and nothing was pushed or published.
