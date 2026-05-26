#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// ============ Types ============
interface Mark {
  time: string;
  note: string;
}

interface Session {
  id: string;
  start: string;
  end?: string;
  task: string;
  tags: string[];
  marks: Mark[];
  estimatedMinutes?: number;
}

interface TimeKeeperData {
  syncPath?: string;
  current: Session | null;
  history: Session[];
}

// ============ CACE TIMER Animation ============
// 可爱短发小女孩头像
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
`,
  // Frame 2: 眨眼
  `
  ▄▄▄▄▄▄▄▄▄▄▄▄
 █░░░░░░░░░░░░█
 █░▄▄▄▄▄▄▄▄▄░█
 █░│ ─   ─ │░█
 █░│   ▽   │░█
 █░│  ───  │░█
 ╰────────────╯
`,
  // Frame 3: 开心
  `
  ▄▄▄▄▄▄▄▄▄▄▄▄
 █░░░░░░░░░░░░█
 █░▄▄▄▄▄▄▄▄▄░█
 █░│ ★   ★ │░█
 █░│   ▽   │░█
 █░│  ◡◡◡  │░█
 ╰────────────╯
`,
  // Frame 4: 超开心
  `
  ▄▄▄▄▄▄▄▄▄▄▄▄
 █░░░░░░░░░░░░█
 █░▄▄▄▄▄▄▄▄▄░█
 █░│ ◉   ◉ │░█
 █░│   ▽   │░█
 █░│  ▽△▽  │░█
 ╰────────────╯
`,
];

const CACE_SMALL = `
  ▄▄▄▄▄▄▄▄▄▄
 █░░░░░░░░░░█
 █░▄▄▄▄▄▄▄░█
 █│ ●   ● │
 █│   ▽   │
 █│  ───  │
 ╰─────────╯`;

const CACE_HAPPY = `
  ▄▄▄▄▄▄▄▄▄▄
 █░░░░░░░░░░█
 █░▄▄▄▄▄▄▄░█
 █│ ★   ★ │
 █│   ▽   │
 █│  ◡◡◡  │
 ╰─────────╯`;

const CACE_SLEEPY = `
  ▄▄▄▄▄▄▄▄▄▄
 █░░░░░░░░░░█
 █░▄▄▄▄▄▄▄░█
 █│ ─   ─ │
 █│   ▽   │
 █│  ───  │
 ╰─────────╯`;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return '夜深了';
  if (hour < 12) return '早上好';
  if (hour < 18) return '下午好';
  return '晚上好';
}

async function showCaceAnimation(message: string = ''): Promise<void> {
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

type CaceMood = 'normal' | 'happy' | 'sleepy';

function showCaceSmall(status: string = '', mood: CaceMood = 'normal'): void {
  const cyan = '\x1b[36m';
  const reset = '\x1b[0m';

  let face = CACE_SMALL;
  if (mood === 'happy') face = CACE_HAPPY;
  else if (mood === 'sleepy') face = CACE_SLEEPY;

  console.log(cyan + face + reset);
  if (status) {
    console.log(cyan + '  ' + status + reset);
  }
}

// ============ Utilities ============
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('zh-CN');
}

// ============ Data Management ============
const DATA_FILE = path.join(os.homedir(), '.cace-timer.json');

function loadData(): TimeKeeperData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    // Ignore errors
  }
  return { current: null, history: [] };
}

function saveData(data: TimeKeeperData): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

  // Sync to external path if set
  if (data.syncPath && fs.existsSync(path.dirname(data.syncPath))) {
    fs.writeFileSync(data.syncPath, JSON.stringify(data, null, 2));
  }
}

// ============ Commands ============
async function cmdStart(task: string, options: { tag?: string; estimate?: number }): Promise<void> {
  const data = loadData();

  if (data.current) {
    console.log('\x1b[33m⚠ 已有进行中的任务，请先使用 tk stop 结束\x1b[0m');
    return;
  }

  const session: Session = {
    id: generateId(),
    start: new Date().toISOString(),
    task: task || '未命名任务',
    tags: options.tag ? [options.tag] : [],
    marks: [],
    estimatedMinutes: options.estimate
  };

  data.current = session;
  saveData(data);

  await showCaceAnimation(`${getGreeting()}！开始记录: ${session.task}`);
  console.log();
  console.log(`  📌 任务: ${session.task}`);
  if (session.tags.length > 0) {
    console.log(`  🏷  标签: ${session.tags.join(', ')}`);
  }
  if (session.estimatedMinutes) {
    console.log(`  ⏱  预计: ${session.estimatedMinutes} 分钟`);
  }
  console.log(`  🕐 开始: ${formatTime(session.start)}`);
  console.log();
}

async function cmdMark(note: string): Promise<void> {
  const data = loadData();

  if (!data.current) {
    console.log('\x1b[33m⚠ 没有进行中的任务，请先用 tk start 开始\x1b[0m');
    return;
  }

  const mark: Mark = {
    time: new Date().toISOString(),
    note: note || '标记点'
  };

  data.current.marks.push(mark);
  saveData(data);

  const elapsed = Date.now() - new Date(data.current.start).getTime();
  console.log();
  showCaceSmall('✓ 已标记', 'happy');
  console.log();
  console.log(`  📍 ${formatTime(mark.time)} - ${mark.note}`);
  console.log(`  ⏱  已用时: ${formatDuration(elapsed)}`);
  console.log();
}

async function cmdStop(): Promise<void> {
  const data = loadData();

  if (!data.current) {
    console.log('\x1b[33m⚠ 没有进行中的任务\x1b[0m');
    return;
  }

  const session = data.current;
  session.end = new Date().toISOString();

  const duration = new Date(session.end).getTime() - new Date(session.start).getTime();
  const durationMinutes = duration / 60000;

  // Calculate efficiency score
  const hasEstimate = session.estimatedMinutes && session.estimatedMinutes > 0;
  let efficiency = -1;
  if (hasEstimate) {
    efficiency = Math.min(100, Math.round((session.estimatedMinutes! / durationMinutes) * 100));
  }

  data.history.unshift(session);
  data.current = null;
  saveData(data);

  console.log();
  showCaceSmall('任务完成！', 'happy');
  console.log();
  console.log('  ┌─────────────────────────────────┐');
  console.log('  │          📊 任务总结            │');
  console.log('  └─────────────────────────────────┘');
  console.log();
  console.log(`  📌 任务: ${session.task}`);
  console.log(`  🕐 时长: ${formatDuration(duration)}`);
  if (session.tags.length > 0) {
    console.log(`  🏷  标签: ${session.tags.join(', ')}`);
  }
  if (session.marks.length > 0) {
    console.log(`  📍 标记: ${session.marks.length} 个`);
  }

  // Efficiency display
  if (hasEstimate) {
    let effEmoji = '⭐';
    let effColor = '\x1b[32m';
    if (efficiency < 50) {
      effEmoji = '💀';
      effColor = '\x1b[31m';
    } else if (efficiency < 80) {
      effEmoji = '💪';
      effColor = '\x1b[33m';
    } else if (efficiency >= 100) {
      effEmoji = '🏆';
    }
    console.log(`  ${effEmoji} 效率分: ${effColor}${efficiency}%\x1b[0m`);
  } else {
    console.log('  ⏱  未设置预估时长，无法计算效率分');
  }
  console.log();
}

function cmdStatus(): void {
  const data = loadData();

  console.log();
  showCaceSmall('', data.current ? 'normal' : 'sleepy');

  if (!data.current) {
    console.log();
    console.log('  😴 当前没有进行中的任务');
    console.log('  使用 tk start "任务名" 开始新任务');
    console.log();
    return;
  }

  const elapsed = Date.now() - new Date(data.current.start).getTime();
  console.log();
  console.log('  🔥 进行中');
  console.log();
  console.log(`  📌 任务: ${data.current.task}`);
  console.log(`  🕐 开始: ${formatTime(data.current.start)}`);
  console.log(`  ⏱  已用: ${formatDuration(elapsed)}`);

  if (data.current.tags.length > 0) {
    console.log(`  🏷  标签: ${data.current.tags.join(', ')}`);
  }
  if (data.current.marks.length > 0) {
    console.log(`  📍 标记: ${data.current.marks.length} 个`);
    data.current.marks.forEach((m, i) => {
      console.log(`     ${i + 1}. ${formatTime(m.time)} - ${m.note}`);
    });
  }
  console.log();
}

function cmdList(options: { today?: boolean; tag?: string; limit?: number }): void {
  const data = loadData();
  let sessions = data.history;

  // Filter by today
  if (options.today) {
    const today = formatDate(new Date().toISOString());
    sessions = sessions.filter(s => formatDate(s.start) === today);
  }

  // Filter by tag
  if (options.tag) {
    sessions = sessions.filter(s => s.tags.includes(options.tag!));
  }

  // Limit
  const limit = options.limit ?? 10;
  sessions = sessions.slice(0, limit);

  console.log();
  showCaceSmall('历史记录');
  console.log();

  if (sessions.length === 0) {
    console.log('  📭 暂无记录');
    console.log();
    return;
  }

  sessions.forEach((session, i) => {
    const duration = session.end
      ? formatDuration(new Date(session.end).getTime() - new Date(session.start).getTime())
      : '进行中';

    console.log(`  ${i + 1}. ${session.task}`);
    console.log(`     📅 ${formatTime(session.start)} | ⏱ ${duration}`);
    if (session.tags.length > 0) {
      console.log(`     🏷  ${session.tags.map(t => '#' + t).join(' ')}`);
    }
    console.log();
  });
}

function cmdSearch(keyword: string): void {
  const data = loadData();
  const results = data.history.filter(s =>
    s.task.toLowerCase().includes(keyword.toLowerCase()) ||
    s.tags.some(t => t.toLowerCase().includes(keyword.toLowerCase())) ||
    s.marks.some(m => m.note.toLowerCase().includes(keyword.toLowerCase()))
  );

  console.log();
  showCaceSmall(`搜索: "${keyword}"`);
  console.log();

  if (results.length === 0) {
    console.log('  🔍 未找到匹配记录');
    console.log();
    return;
  }

  console.log(`  找到 ${results.length} 条记录:\n`);
  results.forEach((session, i) => {
    const duration = session.end
      ? formatDuration(new Date(session.end).getTime() - new Date(session.start).getTime())
      : '进行中';

    console.log(`  ${i + 1}. ${session.task}`);
    console.log(`     📅 ${formatTime(session.start)} | ⏱ ${duration}`);
    console.log();
  });
}

function cmdSync(filePath: string): void {
  const data = loadData();
  const absPath = path.resolve(filePath);

  data.syncPath = absPath;
  saveData(data);

  console.log();
  showCaceSmall('同步已配置');
  console.log();
  console.log(`  📂 同步路径: ${absPath}`);
  console.log('  💡 提示: 可将文件放在 Dropbox/iCloud/OneDrive 等同步目录');
  console.log();
}

function cmdHelp(): void {
  console.log();
  showCaceSmall('');
  console.log();
  console.log('  ╔═══════════════════════════════════════════╗');
  console.log('  ║        CACE TIMER - 命令帮助             ║');
  console.log('  ╚═══════════════════════════════════════════╝');
  console.log();
  console.log('  tk start <任务名> [选项]');
  console.log('     开始新任务');
  console.log('     --tag <标签>    添加标签');
  console.log('     --estimate <分钟>  预估时长');
  console.log();
  console.log('  tk mark <备注>');
  console.log('     记录时间点');
  console.log();
  console.log('  tk stop');
  console.log('     结束当前任务（显示效率评分）');
  console.log();
  console.log('  tk status');
  console.log('     查看当前状态');
  console.log();
  console.log('  tk list [选项]');
  console.log('     查看历史记录');
  console.log('     --today         仅今天');
  console.log('     --tag <标签>    按标签筛选');
  console.log('     --limit <数量>  限制数量');
  console.log();
  console.log('  tk search <关键词>');
  console.log('     搜索记录');
  console.log();
  console.log('  tk sync <文件路径>');
  console.log('     设置同步文件路径');
  console.log();
  console.log('  tk help');
  console.log('     显示帮助');
  console.log();
}

// ============ CLI Parser ============
interface ParsedArgs {
  command: string;
  positional: string[];
  options: Record<string, string | boolean>;
}

function parseArgs(args: string[]): ParsedArgs {
  const result: ParsedArgs = {
    command: '',
    positional: [],
    options: {}
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const nextArg = args[i + 1];

      if (nextArg && !nextArg.startsWith('-')) {
        result.options[key] = nextArg;
        i += 2;
      } else {
        result.options[key] = true;
        i++;
      }
    } else if (!result.command) {
      result.command = arg;
      i++;
    } else {
      result.positional.push(arg);
      i++;
    }
  }

  return result;
}

// ============ Main ============
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const parsed = parseArgs(args);

  const { command, positional, options } = parsed;

  switch (command) {
    case 'start':
      await cmdStart(positional[0] || '', {
        tag: options.tag as string,
        estimate: options.estimate ? (Number(options.estimate) > 0 ? parseInt(options.estimate as string) : undefined) : undefined
      });
      break;

    case 'mark':
      await cmdMark(positional[0] || '标记点');
      break;

    case 'stop':
      await cmdStop();
      break;

    case 'status':
      cmdStatus();
      break;

    case 'list':
    case 'ls':
      cmdList({
        today: !!options.today,
        tag: options.tag as string,
        limit: options.limit ? parseInt(options.limit as string) : 10
      });
      break;

    case 'search':
      cmdSearch(positional[0] || '');
      break;

    case 'sync':
      cmdSync(positional[0] || '');
      break;

    case 'help':
    case '--help':
    case '-h':
    case '':
      cmdHelp();
      break;

    default:
      console.log(`\x1b[31m未知命令: ${command}\x1b[0m`);
      console.log('使用 tk help 查看帮助');
  }
}

main().catch(console.error);
