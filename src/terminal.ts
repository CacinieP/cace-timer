import blessed from 'blessed';
import { stripVTControlCharacters } from 'node:util';

export type ColorMode = 'auto' | 'always' | '256' | 'never';
export interface DisplayOptions {
  animation: boolean;
  tui: boolean;
  ascii: boolean;
  color: ColorMode;
  theme: 'dark' | 'light';
}

let display: DisplayOptions = {
  animation: true,
  tui: true,
  ascii: false,
  color: 'auto',
  theme: 'dark',
};

export function configureDisplay(options: Partial<DisplayOptions>): void {
  display = { ...display, ...options };
}

export function getDisplay(): Readonly<DisplayOptions> {
  return display;
}

export function resolveColor(
  mode = display.color,
  isTTY = process.stdout.isTTY === true,
  env: NodeJS.ProcessEnv = process.env,
): Exclude<ColorMode, 'auto'> {
  if (mode !== 'auto') return mode;
  if (!isTTY || env.TERM === 'dumb' || env.NO_COLOR !== undefined) return 'never';
  return /^(truecolor|24bit)$/.test(env.COLORTERM ?? '') ? 'always' : '256';
}

// Use the same width table as the terminal renderer, including ambiguous-width
// policy (NCURSES_CJK_WIDTH), rather than JavaScript UTF-16 string lengths.
const unicode = (
  blessed as unknown as {
    unicode: { charWidth(point: number): number; strWidth(text: string): number };
  }
).unicode;

export function cellWidth(text: string): number {
  return unicode.strWidth(text);
}

export function safeText(text: string): string {
  return stripVTControlCharacters(text).replace(/[\p{Cc}\p{Cf}]/gu, ' ');
}

export function fitText(text: string, columns: number): string {
  const clean = safeText(text);
  const width = Math.max(0, Math.floor(columns));
  if (cellWidth(clean) <= width) return clean;
  if (!width) return '';
  let result = '';
  let used = 0;
  for (const char of clean) {
    const size = unicode.charWidth(char.codePointAt(0)!);
    if (used + size > width - 1) break;
    result += char;
    used += size;
  }
  return result + '~';
}

export function paint(text: string, color: 'cyan' | 'yellow' | 'red' | 'green'): string {
  const clean = safeText(text);
  if (resolveColor() === 'never') return clean;
  const codes = { cyan: 36, yellow: 33, red: 31, green: 32 };
  return `\x1b[${codes[color]}m${clean}\x1b[0m`;
}
