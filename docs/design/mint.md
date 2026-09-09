# MINT terminal iteration

The first iteration replaces the CACE artwork and terminal animation without
introducing process tracking, automatic task inference or scheduling. Those
features remain later milestones of the developer-schedule roadmap.

The reference is CacinieP's **设计初音未来风ASCII终端** task, final revision on
2026-09-09 after “修复不规则缺口”, followed by the request that the facial contour
be smooth without looking wide or chubby. The original 16-expression text is
preserved in [mint-reference.txt](mint-reference.txt).

Reference SHA-256:
`d78462b5a658c0ac58636dcfb6d25b1713f7944b91efffefeb2c708d5da97f62`.

Design constraints:

- Teal bob, cowlick, star clip, delicate round glasses, large bright eyes and bow.
- No nose or hands; one-cell mouth; hair carries the chibi head volume.
- Cheeks retain gentle fullness and taper inward into a rounded chin. Keep the same jaw for
  all expressions. Avoid the reference's long flat chin line.
- Move the whole head for tilted expressions. Keep the mouth and eye anchors
  stable during a blink; no string-by-string centering.
- Retain all 16 original expression names. Compact and tiny art simplify
  expression details while keeping textual status visible.

Version 1.4.1 incorporates the follow-up “脸太瘦了”: full and compact faces are
one column wider on each side throughout the lower contour. This restores cheek
and jaw fullness while preserving the centre, eye/mouth anchors and rounded
corners. Tiny art and the outer hair silhouette remain unchanged.

Version 1.4.2 responds to “柔和虚化下巴线条”. The lower contour uses a muted
skin-colour role `c` in both palettes. Punctuation and a short baseline suggest
the chin without the continuous box-drawing corners. This is a terminal-native
low-contrast treatment, with the same 1.4.1 face width and stable expression
anchors; it does not blur raster images. ASCII keeps the sparse contour, and
tiny art adopts the muted colour.

Art is TypeScript data in `src/mascot/assets/mint.ts`. `frames.ts` supplies
fixed canvases and semantic colour spans; the full canvas is 38×17, compact
22×11 and tiny 8×5 under the default one-cell ambiguous-width policy. Wider
ambiguous characters receive a shared larger canvas. ASCII replacements preserve
display columns. Dark/light palettes come from the reference.

The default blink is 200ms in a 4-second cycle. Single CLI operations print
immediately; only owned TUI screens have refresh clocks. No Python is required
to run the application. A successful job and completion of a task have separate
state mappings; this iteration does not manufacture background-job events.

One screen owns blessed's alternate buffer, refresh timer and signal handlers.
Render errors reject a countdown, cancellation returns false, and only true
completion enters completed history. The active record is retained on
interruption, matching the current timer model; pause/recovery belongs to the
next data-model iteration.

Tests use temporary data files. `npm test` verifies artwork, state mappings,
column bounds, display options, animation disposal and existing behavior.
`npm run test:cli` checks the built CLI. `npm run test:pty` requires a POSIX host
with Python 3 and exercises resizing, actual key bytes, OS signals, normal
completion, a forced renderer failure, cursor restoration and raw-mode recovery.

Baseline at `c8404fb` on Node 22.22.3: build passed, 41 tests passed, lint had
3 unused-variable warnings. These baseline results were obtained locally,
independently of the older `docs/tui-audit.md` report.
