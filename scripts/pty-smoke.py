#!/usr/bin/env python3
"""POSIX pseudo-terminal integration checks; Python standard library only.

Run after npm run build: python3 scripts/pty-smoke.py [artifact-directory]
Uses only temporary data files. Requires node on PATH; never dispatches CI.
"""
import errno
import fcntl
import json
import os
from pathlib import Path
import pty
import select
import signal
import struct
import subprocess
import sys
import tempfile
import termios
import time

ROOT = Path(__file__).resolve().parent.parent
ARTIFACTS = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else None
if ARTIFACTS:
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
RESULTS = []


def run_case(name, mode, size=(80, 24), keys=None, expected=0, resize=False, os_signal=None, linger=0, args=(), static=False):
    with tempfile.TemporaryDirectory(prefix='cace-pty-') as scratch:
        data = Path(scratch) / 'timer.json'
        data.write_text(json.dumps(dict(current=None, history=[], score=0, streak=0)))
        master, slave = pty.openpty()
        initial = termios.tcgetattr(slave)
        fcntl.ioctl(slave, termios.TIOCSWINSZ, struct.pack('HHHH', size[1], size[0], 0, 0))
        capture = (ARTIFACTS / (name + '.ansi')) if ARTIFACTS else Path(scratch) / 'capture.ansi'
        for old in [capture, Path(str(capture) + '.json')]:
            if old.exists():
                old.unlink()
        env = {**os.environ, 'TERM': 'xterm-256color', 'COLORTERM': 'truecolor',
               'CACE_TEST_DATA': str(data), 'CACE_TEST_CAPTURE': str(capture)}
        process = subprocess.Popen(['node', str(ROOT / 'scripts/pty-fixture.cjs'), mode, *args],
                                   cwd=ROOT, stdin=slave, stdout=slave, stderr=slave, env=env, start_new_session=True)
        output = bytearray()
        started = time.monotonic()
        sent = False
        resized = False
        changed_at = None
        deadline = started + 10 + linger
        try:
            while process.poll() is None and time.monotonic() < deadline:
                ready, _, _ = select.select([master], [], [], 0.03)
                if ready:
                    try:
                        output.extend(os.read(master, 65536))
                    except OSError as exc:
                        if exc.errno != errno.EIO:
                            raise
                # Wait for the first actual screen snapshot, not an arbitrary startup delay.
                if capture.exists() and not resized and resize:
                    for width, height in [(40, 12), (20, 8), (120, 40)]:
                        fcntl.ioctl(slave, termios.TIOCSWINSZ, struct.pack('HHHH', height, width, 0, 0))
                        process.send_signal(signal.SIGWINCH)
                        target_deadline = time.monotonic() + 1.5
                        while time.monotonic() < target_deadline:
                            readable, _, _ = select.select([master], [], [], 0.03)
                            if readable:
                                output.extend(os.read(master, 65536))
                            try:
                                meta = json.loads(Path(str(capture) + '.json').read_text())
                                if (meta['columns'], meta['rows']) == (width, height):
                                    break
                            except (FileNotFoundError, json.JSONDecodeError):
                                pass
                        else:
                            raise AssertionError(f'{name}: resize to {width}x{height} was not rendered; exit={process.poll()}; tail={output[-1200:]!r}')
                    resized = True
                    changed_at = time.monotonic()
                if capture.exists() and not sent:
                    changed_at = changed_at or time.monotonic()
                    if time.monotonic() - changed_at >= linger:
                        if os_signal:
                            process.send_signal(os_signal)
                        if keys is not None:
                            os.write(master, keys)
                        sent = True
            if process.poll() is None:
                raise AssertionError(f'{name}: process did not exit')
            while select.select([master], [], [], 0.03)[0]:
                try:
                    part = os.read(master, 65536)
                except OSError:
                    break
                if not part:
                    break
                output.extend(part)
            code = process.wait()
            text = output.decode('utf-8', errors='replace')
            assert code == expected, f'{name}: expected exit {expected}, got {code}: {text[-1600:]}'
            flags = termios.ECHO | termios.ICANON
            restored = termios.tcgetattr(slave)[3] & flags == initial[3] & flags
            assert restored, f'{name}: terminal raw mode/echo not restored'
            entered = b'\x1b[?1049h' in output
            if entered:
                assert b'\x1b[?1049l' in output, f'{name}: alternate screen not restored'
                assert b'\x1b[?25h' in output, f'{name}: cursor not restored'
            record = json.loads(data.read_text())
            if mode in ('cancel', 'render-error'):
                assert len(record['history']) == 0 and record['current'], f'{name}: interruption counted as completion'
            if mode == 'complete':
                assert len(record['history']) == 1 and record['current'] is None, f'{name}: wrong completion history'
            if mode == 'render-error':
                assert 'injected render failure' in text
            if linger >= 4.1:
                meta = json.loads(Path(str(capture) + '.json').read_text())
                if static:
                    assert meta['renders'] == 1, f'{name}: --no-animation still repainted'
                else:
                    assert meta['renders'] >= 3, f'{name}: blink did not repaint'
            elapsed = time.monotonic() - started
            RESULTS.append(dict(name=name, exit=code, raw_restored=restored, alternate_screen=entered, seconds=round(elapsed, 3)))
            print('PASS', name, f'({elapsed:.2f}s)')
        finally:
            if process.poll() is None:
                process.kill()
                process.wait()
            os.close(master)
            os.close(slave)


for size in [(120, 40), (80, 24), (60, 20), (40, 12), (20, 8)]:
    run_case('dashboard-%dx%d' % size, 'dashboard', size=size, keys=b'q')
run_case('preview-resize', 'preview', keys=b'nq', resize=True)
run_case('preview-blink', 'preview', keys=b'q', linger=4.2)
run_case('preview-no-animation', 'cli', keys=b'q', linger=4.2, static=True,
         args=('--no-animation', 'mascot', 'preview'))
run_case('complete', 'complete')
run_case('cancel-q', 'cancel', keys=b'q', expected=130)
run_case('cancel-escape', 'cancel', keys=b'\x1b', expected=130)
run_case('cancel-control-c', 'cancel', keys=b'\x03', expected=130)
run_case('cancel-sigterm', 'cancel', os_signal=signal.SIGTERM, expected=143)
run_case('render-error', 'render-error', expected=1)
run_case('reflection-escape', 'reflection', keys=b'\x1b')
run_case('reflection-sigterm', 'reflection', os_signal=signal.SIGTERM, expected=143)
run_case('no-tui', 'cli', args=('--no-tui', '--color', 'never'))

if ARTIFACTS:
    (ARTIFACTS / 'results.json').write_text(json.dumps(RESULTS, indent=2) + '\n')
print(f'{len(RESULTS)} PTY checks passed')
