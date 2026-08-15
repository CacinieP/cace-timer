import { sleep } from './utils';
import { t } from './i18n';

// ============ CACE TIMER Mascot ============
// 可爱短发小女孩 — 完整身体设计
// 人设参考: 语码 Cace — 译者 + Vibe Coder + 电音/VOCALOID 宅
// 特征: 呆毛 + 齐耳 Bob 短发 + 尖下巴 + A 字裙(CACE 绣在裙面)
// 动画帧用于开场动画，各 mood 用于内联显示
// 对齐约定: 中心线在 13/14 列之间,所有 ┬┴┘└ 连接点逐列对齐

const CACE_FRAMES = [
  // Frame 1: 正常站立
  `
             ╭╮
       ╭────────────╮
       │   ●    ●   │
       │     ▽      │
       │    ───     │
       ╰──╯      ╯──╯
             ││
       ╭─────┴┴─────╮
      ╱   ╔══════╗   ╲
     │    ║ CACE ║    │
     │    ╚══════╝    │
     ╰─────┬────┬─────╯
           │    │
           │    │
           │    │
         ╭─╯    ╯─╮
        ╰──╯  ╰──╯`,
  // Frame 2: 眨眼
  `
             ╭╮
       ╭────────────╮
       │   ─    ─   │
       │     ▽      │
       │    ───     │
       ╰──╯      ╯──╯
             ││
       ╭─────┴┴─────╮
      ╱   ╔══════╗   ╲
     │    ║ CACE ║    │
     │    ╚══════╝    │
     ╰─────┬────┬─────╯
           │    │
           │    │
           │    │
         ╭─╯    ╯─╮
        ╰──╯  ╰──╯`,
  // Frame 3: 微笑蹦跳
  `
             ╭╮
       ╭────────────╮
       │   ★    ★   │
       │     ▽      │
       │    ◡◡◡    │
       ╰──╯      ╯──╯
             ││
       ╭─────┴┴─────╮
      ╱   ╔══════╗   ╲
     │    ║ CACE ║    │
     │    ╚══════╝    │
     ╰─────┬────┬─────╯
       ╭───┘    └───╮
       │            │
       │            │
     ╭─╯            ╯─╮
    ╰──╯          ╰──╯`,
  // Frame 4: 超开心 + 举手
  `
  ♪           ╭╮
       ╭────────────╮
     o\\│   ◉    ◉   │/o
      \\│     ▽      │/
       │    ▽△▽    │
       ╰──╯      ╯──╯
             ││
       ╭─────┴┴─────╮
      ╱   ╔══════╗   ╲
     │    ║ CACE ║    │
     │    ╚══════╝    │
     ╰─────┬────┬─────╯
           │    │
           │    │
           │    │
         ╭─╯    ╯─╮
        ╰──╯  ╰──╯`,
];

// --- Inline mascot variants ---

export const CACE_SMALL = `
             ╭╮
       ╭────────────╮
       │   ●    ●   │
       │     ▽      │
       │    ───     │
       ╰──╯      ╯──╯
             ││
       ╭─────┴┴─────╮
      ╱   ╔══════╗   ╲
     │    ║ CACE ║    │
     │    ╚══════╝    │
     ╰─────┬────┬─────╯
           │    │
           │    │
           │    │
         ╭─╯    ╯─╮
        ╰──╯  ╰──╯`;

export const CACE_HAPPY = `
             ╭╮
       ╭────────────╮
       │   ★    ★   │
       │     ▽      │
       │    ◡◡◡    │
       ╰──╯      ╯──╯
             ││
       ╭─────┴┴─────╮
      ╱   ╔══════╗   ╲
     │    ║ CACE ║    │
     │    ╚══════╝    │
     ╰─────┬────┬─────╯
       ╭───┘    └───╮
       │            │
       │            │
     ╭─╯            ╯─╮
    ╰──╯          ╰──╯`;

export const CACE_SLEEPY = `
             ╭╮
       ╭────────────╮
       │   ─    ─   │
       │     ▽      │
       │     ～～     │
       ╰──╯      ╯──╯
             ││
       ╭─────┴┴─────╮
      ╱   ╔══════╗   ╲
     │    ║ CACE ║    │
     │    ╚══════╝    │
     ╰─────┬────┬─────╯
           │    │
           │    │
           │    │
         ╭─╯    ╯─╮
        ╰──╯  ╰──╯`;

export const CACE_FOCUSED = `
             │
       ╭────────────╮
       │   ◆    ◆   │
       │     ▽      │
       │    ▬▬▬    │
       ╰──╯      ╯──╯
             ││
       ╭─────┴┴─────╮
      ╱   ╔══════╗   ╲
     │    ║ CACE ║    │
     │    ╚══════╝    │
     ╰─────┬────┬─────╯
           │    │
           │    │
           │    │
         ╭─╯    ╯─╮
        ╰──╯  ╰──╯`;

export const CACE_CELEBRATING = `
  ♪           ╭╮
       ╭────────────╮
     o\\│   ◉    ◉   │/o
      \\│     ▽      │/
       │    ▽△▽    │
       ╰──╯      ╯──╯
             ││
       ╭─────┴┴─────╮
      ╱   ╔══════╗   ╲
     │    ║ CACE ║    │
     │    ╚══════╝    │
     ╰─────┬────┬─────╯
           │    │
           │    │
           │    │
         ╭─╯    ╯─╮
        ╰──╯  ╰──╯`;

export type CaceMood = 'normal' | 'happy' | 'sleepy' | 'focused' | 'celebrating';

const MOOD_MAP: Record<CaceMood, string> = {
  normal: CACE_SMALL,
  happy: CACE_HAPPY,
  sleepy: CACE_SLEEPY,
  focused: CACE_FOCUSED,
  celebrating: CACE_CELEBRATING,
};

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

  // Animation: 3 cycles through frames for a smooth intro
  for (let i = 0; i < 3; i++) {
    for (const frame of CACE_FRAMES) {
      console.clear();
      console.log(cyan + frame + reset);
      console.log();
      console.log(cyan + bold + '  ═══════════════════════════════════' + reset);
      console.log(cyan + bold + '        C A C E   T I M E R' + reset);
      console.log(cyan + bold + '  ═══════════════════════════════════' + reset);
      if (message) {
        console.log();
        console.log('  ' + message);
      }
      await sleep(200);
    }
  }
}

export function showCaceSmall(status: string = '', mood: CaceMood = 'normal'): void {
  const cyan = '\x1b[36m';
  const reset = '\x1b[0m';

  const face = MOOD_MAP[mood] || CACE_SMALL;

  console.log(cyan + face + reset);
  if (status) {
    console.log(cyan + '  ' + status + reset);
  }
}
