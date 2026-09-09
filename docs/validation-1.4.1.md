# Version 1.4.1 local validation

2026-09-09, macOS / Apple Silicon, Node 22.22.3. This patch changes full/compact
face contours, the README portrait, existing contour assertions and package
version metadata. No terminal lifecycle or scheduling logic changes.

- TypeScript build: passed.
- ESLint: passed with no warnings or errors.
- Unit tests: 77 passed in 9 files.
- Built CLI checks: 5 passed.
- `NCURSES_CJK_WIDTH=2` alignment check: all 16 expressions passed.
- Visual inspection: before/after rendering from actual TypeScript assets;
  blink frames use the same widened contour.

The existing 1.4.0 PTY run is documented in [validation-1.4.0.md](validation-1.4.0.md);
its 17 cases were not rerun for this artwork-only patch. Native terminal font
differences remain subject to the same limitation. No remote CI or publication.
