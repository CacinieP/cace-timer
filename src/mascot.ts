import { sleep } from './utils';
import { t } from './i18n';

// ============ CACE TIMER Animation ============
// Full-body mascot with different expressions

const CACE_FRAMES = [
  // Frame 1: 正常
  `
     ▄▄▄▄▄▄▄▄▄▄▄▄
    █░░░░░░░░░░░░█
    █░▄▄▄▄▄▄▄▄▄░█
    █░│ ●   ● │░█
    █░│   ▽   │░█
    █░│  ───  │░█
    ╰────────────╯
       ╭──────╮
       │ ▓▓▓▓ │
       │ ▓▓▓▓ │
       ╰──────╯
       ╭──┬──╮
       │  │  │
       ╰──┴──╯`,
  // Frame 2: 眨眼
  `
     ▄▄▄▄▄▄▄▄▄▄▄▄
    █░░░░░░░░░░░░█
    █░▄▄▄▄▄▄▄▄▄░█
    █░│ ─   ─ │░█
    █░│   ▽   │░█
    █░│  ───  │░█
    ╰────────────╯
       ╭──────╮
       │ ▓▓▓▓ │
       │ ▓▓▓▓ │
       ╰──────╯
       ╭──┬──╮
       │  │  │
       ╰──┴──╯`,
  // Frame 3: 开心
  `
     ▄▄▄▄▄▄▄▄▄▄▄▄
    █░░░░░░░░░░░░█
    █░▄▄▄▄▄▄▄▄▄░█
    █░│ ★   ★ │░█
    █░│   ▽   │░█
    █░│  ◡◡◡  │░█
    ╰────────────╯
       ╭──────╮
       │ ▓▓▓▓ │
       │ ▓▓▓▓ │
       ╰──────╯
      ╭─┴──┴─╮
      │      │
      ╰──────╯`,
  // Frame 4: 超开心 + 举手
  `
     ▄▄▄▄▄▄▄▄▄▄▄▄
    █░░░░░░░░░░░░█
    █░▄▄▄▄▄▄▄▄▄░█
    █░│ ◉   ◉ │░█
    █░│   ▽   │░█
    █░│  ▽△▽  │░█
    ╰────────────╯
    ╭──╮──────╮╭──╮
    │✊│ ▓▓▓▓ ││✊│
    ╰──╯ ▓▓▓▓ ╰──╯
         ╰──────╯
        ╭─┴──┴─╮
        │      │
        ╰──────╯`,
];

// Small mascots for inline display
const CACE_SMALL = `
     ▄▄▄▄▄▄▄▄▄▄▄▄
    █░▄▄▄▄▄▄▄▄▄░█
    █░│ ●   ● │░█
    █░│   ▽   │░█
    █░│  ───  │░█
    ╰────────────╯
       ╭──────╮
       │ ▓▓▓▓ │
       ╰──────╯
       ╭──┬──╮
       │  │  │
       ╰──┴──╯`;

const CACE_HAPPY = `
     ▄▄▄▄▄▄▄▄▄▄▄▄
    █░▄▄▄▄▄▄▄▄▄░█
    █░│ ★   ★ │░█
    █░│   ▽   │░█
    █░│  ◡◡◡  │░█
    ╰────────────╯
       ╭──────╮
       │ ▓▓▓▓ │
       ╰──────╯
      ╭─┴──┴─╮
      │      │
      ╰──────╯`;

const CACE_SLEEPY = `
     ▄▄▄▄▄▄▄▄▄▄▄▄
    █░▄▄▄▄▄▄▄▄▄░█
    █░│ ─   ─ │░█
    █░│   ▽   │░█
    █░│  ～～  │░█
    ╰────────────╯
       ╭──────╮
       │ ▒▒▒▒ │
       │ ▒▒▒▒ │
       ╰──────╯
       ╭──┬──╮
       │  │  │
       ╰──┴──╯`;

const CACE_FOCUSED = `
     ▄▄▄▄▄▄▄▄▄▄▄▄
    █░▄▄▄▄▄▄▄▄▄░█
    █░│ ◆   ◆ │░█
    █░│   ▽   │░█
    █░│  ▬▬▬  │░█
    ╰────────────╯
       ╭──────╮
       │ ▓▓▓▓ │
       │ ▓▓▓▓ │
       ╰──────╯
       ╭──┬──╮
       │  │  │
       ╰──┴──╯`;

const CACE_CELEBRATING = `
     ▄▄▄▄▄▄▄▄▄▄▄▄
    █░▄▄▄▄▄▄▄▄▄░█
    █░│ ◉   ◉ │░█
    █░│   ▽   │░█
    █░│  ▽△▽  │░█
    ╰────────────╯
    ╭──╮──────╮╭──╮
    │🎊│ ▓▓▓▓ ││🎊│
    ╰──╯ ▓▓▓▓ ╰──╯
         ╰──────╯
        ╭─┴──┴─╮
        │  ♪   │
        ╰──────╯`;

export type CaceMood = 'normal' | 'happy' | 'sleepy' | 'focused' | 'celebrating';

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return t('greeting.lateNight');
  if (hour < 12) return t('greeting.morning');
  if (hour < 18) return t('greeting.afternoon');
  return t('greeting.evening');
}

export async function showCaceAnimation(message: string = ''): Promise<void> {
  const cyan = '\x1b[36m';
  const bold = '\x1b[1m';
  const reset = '\x1b[0m';

  // Animation loop
  for (let i = 0; i < 2; i++) {
    for (const frame of CACE_FRAMES) {
      console.clear();
      console.log(cyan + frame + reset);
      console.log();
      console.log(cyan + bold + '  ════════════════════════════════' + reset);
      console.log(cyan + bold + '       C A C E   T I M E R' + reset);
      console.log(cyan + bold + '  ════════════════════════════════' + reset);
      if (message) {
        console.log();
        console.log('  ' + message);
      }
      await sleep(180);
    }
  }
}

export function showCaceSmall(status: string = '', mood: CaceMood = 'normal'): void {
  const cyan = '\x1b[36m';
  const reset = '\x1b[0m';

  let face = CACE_SMALL;
  if (mood === 'happy') face = CACE_HAPPY;
  else if (mood === 'sleepy') face = CACE_SLEEPY;
  else if (mood === 'focused') face = CACE_FOCUSED;
  else if (mood === 'celebrating') face = CACE_CELEBRATING;

  console.log(cyan + face + reset);
  if (status) {
    console.log(cyan + '  ' + status + reset);
  }
}
