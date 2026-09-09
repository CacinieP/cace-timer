import { cellWidth, resolveColor, ColorMode } from '../terminal';
import {
  FULL,
  COMPACT,
  TINY,
  SIZES,
  EXPRESSIONS,
  DARK_PALETTE,
  LIGHT_PALETTE,
  ColorRole,
  Expression,
  MascotSize,
} from './assets/mint';

export interface Span {
  role: ColorRole;
  text: string;
}
export interface MascotFrame {
  rows: Span[][];
  width: number;
  height: number;
}
export interface FrameOptions {
  expression?: Expression;
  size?: MascotSize;
  elapsedMs?: number;
  motion?: boolean;
  ascii?: boolean;
}

const ASCII: Record<string, string> = {
  ﾉ: '/',
  ノ: '/',
  ヽ: '\\',
  ﾊ: 'h',
  ｨ: ',',
  '◕': 'O',
  ﾟ: "'",
  '╰': '\\',
  '─': '_',
  '╯': '/',
  ﾐ: '=',
  ᴗ: 'v',
  ｰ: '-',
  '｡': '.',
  '✧': '*',
  '☆': '*',
  '¬': '-',
};

function asciiText(value: string): string {
  return Array.from(value, (char) => {
    if (/^[\x20-\x7e]$/.test(char)) return char;
    return (ASCII[char] ?? '?').padEnd(cellWidth(char), ' ');
  }).join('');
}

function spans(row: string, ascii: boolean): Span[] {
  let role: ColorRole = 'w';
  const result: Span[] = [];
  for (const part of row.split(/(\{[hmespgwdc]\})/)) {
    if (/^\{[hmespgwdc]\}$/.test(part)) role = part[1] as ColorRole;
    else if (part) result.push({ role, text: ascii ? asciiText(part) : part });
  }
  return result;
}

export function plainFrame(frame: MascotFrame): string {
  return frame.rows.map((row) => row.map((span) => span.text).join('')).join('\n');
}

export function getFrame(options: FrameOptions = {}): MascotFrame {
  const {
    expression = 'little_smile',
    size = 'full',
    elapsedMs = 0,
    motion = false,
    ascii = false,
  } = options;
  const selected = EXPRESSIONS.find((item) => item.key === expression)!;
  const blink = motion && expression === 'little_smile' && elapsedMs % 4000 >= 3800;
  const source = size === 'full' ? FULL : size === 'compact' ? COMPACT : TINY;
  const resting = expression === 'asleep' || expression === 'sleepy';
  const success = expression === 'happy' || expression === 'excited' || expression === 'smug';
  const attention = expression === 'surprised' || expression === 'head_tilt';
  const smallEyes = blink || resting ? '- ' : success ? '^ ' : attention ? 'O ' : '◕ﾟ';

  const rows = source.map((original, index) => {
    let row: string = original;
    if (size === 'full') {
      row = row
        .replace('ｨ◕ﾟ', blink ? ' ｰ ' : selected.left)
        .replace('ﾟ◕ﾐ', blink ? ' ｰ ' : selected.right)
        .replace('ᴗ', selected.mouth);
      // Shift the complete head together, preserving the jaw across expressions.
      if (['wink', 'head_tilt', 'peek'].includes(expression) && index < 14) row = ' ' + row;
      if (index === 3 && selected.mark) {
        const used = spans(row, false).reduce((sum, span) => sum + cellWidth(span.text), 0);
        row += ' '.repeat(Math.max(0, 33 - used)) + '{p}' + selected.mark;
      }
      if (expression === 'crying') row = row.replace(/\/\//g, '||');
    } else if (size === 'compact') {
      row = row.replace(/◕ﾟ/g, smallEyes).replace('ᴗ', resting ? '-' : attention ? 'o' : 'ᴗ');
    } else {
      row = row.replace(
        'o-o',
        blink || resting ? '---' : success ? '^-^' : attention ? 'O-O' : 'o-o',
      );
    }
    return spans(row, ascii);
  });
  // Every expression shares one canvas, including an ambiguous-width policy.
  const ambiguityExtra = Math.max(0, cellWidth('◕') - 1);
  const width = SIZES[size].width + (size === 'full' ? 3 : 2) * ambiguityExtra;
  for (const row of rows) {
    const used = row.reduce((sum, span) => sum + cellWidth(span.text), 0);
    if (used > width)
      throw new Error(`MINT ${size} row exceeds its ${width}-column canvas (${used})`);
    row.push({ role: 'w', text: ' '.repeat(width - used) });
  }
  return { rows, width, height: SIZES[size].height };
}

export function renderFrame(
  frame: MascotFrame,
  options: { color?: ColorMode; theme?: 'dark' | 'light'; format?: 'ansi' | 'blessed' } = {},
): string {
  const color = resolveColor(options.color);
  if (color === 'never') return plainFrame(frame);
  const palette = options.theme === 'light' ? LIGHT_PALETTE : DARK_PALETTE;
  return frame.rows
    .map((row) =>
      row
        .map((span) => {
          if (!span.text.trim()) return span.text;
          const hex = palette[span.role];
          if (options.format === 'blessed') return `{#${hex}-fg}${span.text}{/}`;
          const [r, g, b] = [0, 2, 4].map((index) => parseInt(hex.slice(index, index + 2), 16));
          const code =
            color === '256'
              ? `38;5;${16 + 36 * Math.round((r / 255) * 5) + 6 * Math.round((g / 255) * 5) + Math.round((b / 255) * 5)}`
              : `38;2;${r};${g};${b}`;
          return `\x1b[${code}m${span.text}\x1b[0m`;
        })
        .join(''),
    )
    .join('\n');
}
