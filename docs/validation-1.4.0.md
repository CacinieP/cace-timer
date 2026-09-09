# Version 1.4.0 local validation

Validated on 2026-09-09 on macOS (Apple Silicon). Base: `c8404fb`, version
1.3.2. Branch: `feat/mint-terminal-p1`. This release implements the MINT artwork
and terminal iteration. Process collection, transactional time accounting,
model inference and schedule automation remain subsequent milestones.

| Check | Result |
| --- | --- |
| TypeScript build, Node 22.22.3 | Passed |
| ESLint | Passed, no errors or warnings |
| Unit tests, Node 22.22.3 | 77 passed in 9 files |
| Unit tests, Node 24.20.0 | 77 passed in 9 files |
| Built CLI integration | 5 passed |
| POSIX pseudo-terminal integration | 17 passed |
| Wide ambiguous-character policy | All 16 expressions passed column checks |
| npm package install | Installed in an isolated prefix; version and 16 ASCII exports verified |
| Whitespace validation | `git diff --check` passed |

The baseline build and 41 tests passed; its three unused-variable lint warnings
have been removed. All state-changing integration scenarios use temporary timer
files, isolated from the user's history.

CLI checks cover start/mark/stop/resume compatibility, removed intro delay,
redirected output, global switches before commands, ASCII export, explicit colour
modes, invalid options and `NO_COLOR` in existing commands.

PTY checks use real POSIX terminal descriptors with key bytes, window-size ioctls
and OS signals. Dashboard dimensions: 120×40, 80×24, 60×20, 40×12 and 20×8.
The preview resizes through 40×12, 20×8 and 120×40. The suite checks blink repaint,
no repaint under `--no-animation`, normal completion, q/Esc/Ctrl+C cancellation,
SIGTERM, an injected renderer failure, reflection exits, and `--no-tui`.
It verifies process exit, terminal canonical mode/echo restoration, alternate
screen/cursor restoration when entered, and completion-history invariants.

Cancellation returns 130; SIGTERM returns 143; render failure returns 1.
Interrupted countdowns retain the active record and do not create completed
history. That record still follows the existing wall-clock timer model; proper
pause/recovery accounting belongs to the next iteration.

The artwork review used rendered TypeScript assets and a captured blessed screen
buffer. The GIF illustrates the actual 3.8-second open / 0.2-second closed frame
sequence; it is not a desktop screen recording. Native Terminal, VS Code and
iTerm2 font-specific rendering was not individually certified. ASCII fallback
and column tests reduce, but cannot eliminate, differences between fonts and
terminal Unicode-width policies. Windows and Linux were not run locally.

The existing Node 20/22 CI and npm publishing workflows now include CLI and PTY
checks. **No GitHub workflow was dispatched, no commits/tags were pushed, and
nothing was published to npm.** Node 20 is configured in CI but was not locally
tested. The release tag is local; pushing a `v*` tag would activate the existing
publish workflow.

To reproduce on a POSIX host with Node and Python 3:

```sh
npm ci
npm run build
npm run lint
npm test
node --test scripts/cli-smoke.cjs
python3 scripts/pty-smoke.py
NCURSES_CJK_WIDTH=2 node_modules/.bin/ts-node align_check.ts
```

Application execution does not require Python. Interactive review:

```sh
node dist/index.js mascot preview
node dist/index.js mascot preview --all --ascii --color never --lang en
```

Use n/p or arrow keys to inspect expressions and q/Esc to exit. Asset provenance
and visual constraints are documented in [design/mint.md](design/mint.md).
