# cace-timer — TUI 审计

> 对内文档。配套阅读 [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md)。

- 仓库: <https://github.com/CacinieP/cace-timer>
- 提交: `cace-timer@1.2.5`(本地 clone,基于 `main`)
- 审计范围: `src/tui/*` + 调用方(`src/index.ts`、`src/commands/{pomodoro,stop}.ts`)
- 工具栈: Node ≥ 18, blessed ^0.1.81, TypeScript strict, vitest, eslint
- 基线状态: ✅ 30/30 测试通过,✅ `tsc --noEmit` 0 错,⚠ lint 8 warnings(全部在 TUI/相关模块)

> **一句话总结**:TUI 模块在功能上能跑,但**所有退出路径都漏掉了 blessed 的 raw-mode 还原**——这是一个在 blessed 生态里被反复报告的"祖传坑"(Ctrl+C 后用户终端卡住,需要 `stty sane` 或重开 tab)。除此之外,还有布局硬编码、交互缺测、关键 UI 区域(鼓励语、label)是空壳等问题。

---

## 严重度图例

| 级别 | 含义 |
|------|------|
| 🔴 P0 | 终端卡死/数据丢失/安全风险——必须修 |
| 🟠 P1 | 在常见路径上触发——应当修 |
| 🟡 P2 | 体验/可维护性问题——建议修 |
| 🔵 P3 | 锦上添花 |

---

## 🔴 P0-1 Ctrl+C 后 TTY 卡在 raw mode

**位置**:`src/tui/countdown.ts:133-138`、`src/tui/dashboard.ts:148-151`、`src/tui/reflection.ts:70-73`、`src/commands/pomodoro.ts:60-66`

**问题**:blessed 启动后会调 `process.stdin.setRawMode(true)`,捕获 `Ctrl+C` 后调用 `screen.destroy()`。但 blessed **不会**自动把 raw mode 关回去,也不会还原 cursor。`cace-timer` 三个 TUI 文件都只调用了 `screen.destroy()`(或更糟,直接 `process.exit(0)`),**没有**显式:

- `process.stdin.setRawMode(false)`
- `screen.program.showCursor()` / `screen.program.cursorReset()`

**实际后果**:用户在 Pomodoro / Dashboard / Reflection 中按 `q` / `Esc` / `Ctrl+C` 后,父 shell 经常处于"按键不响应 / 不回显 / 看不见光标"的状态,必须 `stty sane` 或重开 terminal。这是 blessed 生态被报告了十年的著名问题。

`pomodoro.ts:60-66` 那段唯一注册了 `SIGINT` 的代码也只调 `process.exit(0)`,问题同样存在。

**修复模式**(任选一种):

```ts
// 抽到 src/tui/lifecycle.ts
export function destroyScreen(screen: blessed.Widgets.Screen) {
  try { screen.destroy(); } catch {}
  try {
    if (process.stdin.isTTY) process.stdin.setRawMode(false);
  } catch {}
  try { screen.program.showCursor(); } catch {}
  try { screen.program.normalCursor(); } catch {}
}
```

然后让 `Ctrl+C` / `q` / `Esc` / `onDone` / 超时 / 未捕获异常**全部**走这条路径。`process.exit(0)` 改成 `process.kill(process.pid, 'SIGINT')` 让 SIGINT handler 跑清理。

---

## 🔴 P0-2 `showCountdown` 没有兜底异常 / `onDone` 抛错会泄漏屏幕

**位置**:`src/tui/countdown.ts:97-130`、`src/commands/pomodoro.ts:109-121`

**问题**:`setInterval` 回调里 `screen.destroy()` 之后**同步**调用 `options.onDone()`。`onDone` 实际上来自 `pomodoro.ts:111` 的 `resolve`,而 `resolve` 之后的代码会继续跑(写入 session、saveData、再次进入下一轮)。

但更严重的是:**没有任何 try/catch 也没有 `screen.on('destroy', ...)`**。一旦 `onDone` 抛错(或更现实的——下一轮 `cmdPomodoro` 又进 TUI,而前一个 screen 因为 timer 回调里 `clearInterval` 已经被销毁了),Node 进程会带着"raw mode + 已隐藏的 cursor"死掉,回到 P0-1 的同款症状。

`pomodoro.ts:55-70` 的 SIGINT 清理和 countdown 的清理是两套并行逻辑,互不知道对方。

**修复**:

```ts
// countdown.ts 末尾
interval.unref?.();   // 防止 interval 拖死进程退出
screen.on('destroy', () => clearInterval(interval));
try { ... } finally { destroyScreen(screen); }
```

并把所有退出路径(Ctrl+C、超时、`onDone` 抛错)统一走 `finally` 清理。

---

## 🟠 P1-3 布局像素硬编码,小终端直接错位/截断

**位置**:`src/tui/dashboard.ts:46-53`、`src/tui/countdown.ts:21-86`

**问题**:所有 box 都用了 `top: 13/16/18/22`、`height: 13/16/3`、`left: 'center'` 这种**绝对像素**位置,blessed 自己会监听 `SIGWINCH` 重排,但它不会替你重排硬编码的绝对偏移。在以下情况会错位:

- 终端高度 < 26 行(进度条与控件撞在一起)
- 终端宽度 < 80 列(mascot 是固定 13 行 46 列,会吃掉半屏)
- 有 active task 时 `menuTop = 18`,没 active 时 `menuTop = 17`——只差 1px,但 box 高度又是 `menuItems.length + 1`,**对小屏没有下边界检查**

`reflection.ts` 同样用 `top: 9` 给 hint,但 textarea 自己 `height: 5`——宽度 < 80 时 `left: '10%' width: '80%'` 倒是 OK,高度 < 12 时 hint 会被推到屏幕外。

**修复**:用 blessed 的 `layout` 或 `grid`/`column`/`row`,至少把"控件堆"改成相对锚点(`bottom: N`),并且对 `termHeight < 24` 时拒绝进 TUI 并降级到普通 console(就像 `isInteractiveTerminal` 已经为非 TTY 准备的兜底那样)。

---

## 🟠 P1-4 交互区"空壳化"——Linter 已经替我们找到了

**位置**:
- `src/tui/countdown.ts:2` import 了 `t` 但**完全没用**
- `src/tui/countdown.ts:31` 创建了 `labelBox` 但**没存引用也没设过 content**(只有硬编码的 `options.label` 在另一处)
- `src/tui/countdown.ts:66` 创建了 `encourageBox` 但**从未 setContent**
- `src/tui/dashboard.ts:4-5` import 了 `formatTime` / `getLocale` 但**完全没用**

ESLint 警告:
```
src/tui/countdown.ts
  2:10  warning  't' is defined but never used
 31:9   warning  'labelBox' is assigned a value but never used
 66:9   warning  'encourageBox' is assigned a value but never used
src/tui/dashboard.ts
  4:26  warning  'formatTime' is defined but never used
  5:13  warning  'getLocale' is defined but never used
```

**问题**:`encourageBox` 是个空框——README 第 35 行说 pomodoro 有"鼓励语",代码里啥也没塞。`labelBox` 同理。`dashboard.ts` 没拿到当前 locale(虽然没必要,但既然 import 了说明有过这个想法)。

**修复**:要么塞内容(随机鼓励语从 i18n 里抽、labelBox 在每轮切换文案),要么删 box 和 import。半成品 UI 元素会比"没有"更糟糕,因为用户会以为是个 bug。

---

## 🟠 P1-5 Reflection 输入框极不安全 & 无字符限制

**位置**:`src/tui/reflection.ts:29-43`

**问题**:

1. **没有长度上限**。`blessed.textarea` 的 value 可以无限长,然后被原样写进 JSON(`session.reflection = result.text`)和后续 export(CSV/Markdown)。一个 100MB 的粘贴会让 `~/.cace-timer.json` 膨胀到不可读、export 慢到卡死。
2. **没有 ANSI / 控制字符过滤**。textarea 允许 paste,粘贴里如果带 `\x1b[2J` 或终端控制序列,在 blessed 里通常被当文本,但导出到 CSV/Markdown 后,在某些 viewer(less、Vim)里会执行清屏/光标控制。blessed 的 input 不做过滤。
3. **没有 multiline 处理**。README 第 42 行说"记录感想",但 textarea 的 `enter` 现在直接当提交(这是 blessed 的默认,不算 bug),如果用户想换行则没有快捷键。

**修复**:
- 在 `getValue().trim()` 后卡 `Math.min(text.length, 500)` 截断
- `text.replace(/[\x00-\x08\x0B-\x1F\x7F]/g, '')` 过滤控制字符
- 长按 Enter 提交、Shift+Enter 换行(或反过来,二选一写在 hint 里)

---

## 🟠 P1-6 菜单键与 i18n 标签不一致时无降级

**位置**:`src/tui/dashboard.ts:97-111`、`src/tui/index.ts:182-188`

**问题**:

1. 菜单的 key(`s`/`m`/`b`/`l`/`f`/`?`)是**硬编码英文字母**,但菜单标签是 `t('cmd.help.startDesc')` 等多语言字符串。当用户切到中文,标签是"开始任务",但提示 `[s]` 仍是 `s`——读起来割裂。
2. `showDashboard()` 没有 i18n 入口参数,但用户在 CLI 里 `--lang zh` 会改 locale 后**再**进 dashboard。这种 locale 是在 `setLocale(locale)` 之后调用的所以应该 OK,但因为 `getLocale` 在 dashboard 里被 import 了又没用——说明原来想做的"dashboard 显示当前 locale"半途放弃了。
3. `?` 在某些终端/shell 下是粘滞键(尤其 macOS iTerm 早期版本),用它做菜单键会撞。

**修复**:
- 至少在 dashboard 顶部加一行 `当前语言: zh / Lang: en` + 一对 `[l]` 切语言
- 把菜单提示里的 `[s]` 用 `m.key` 包的 hint 格式独立起来,跟 label 解耦

---

## 🟡 P2-7 没有 TUI 单测,覆盖率 0

**位置**:`src/__tests__/` 只有 `utils/parser/data/i18n` 四个文件,无任何 `tui/*.test.ts`

**问题**:TUI 是用户交互的核心,但完全没测过。结果是:

- 我能在 `countdown.ts` 里直接说 "elapsed >= totalMs 时清理",但 `pomodoro.ts:130` 又自己 `process.stdout.write('\x07')`——两个铃声,功能重复但没人发现。
- `dashboard.ts:30` 里 `const last = new Date(data.lastActiveDate); const now = new Date(today)` 然后除 `86400000`——这个 streak 计算跟 `data.ts` 里 `updateStreak` 是两条独立逻辑,只要一边改了另一边就漂。

blessed 本身难单测,但可以把"按键路由"、"i18n key 完整性"、"渲染前的状态计算"这几层抽成纯函数:

```ts
// 抽出来单测
export function buildDashboardView(data: Data, locale: Locale): DashboardView;
export function mapMenuKeyToAction(ch: string, items: MenuItem[]): DashboardAction | null;
```

---

## 🟡 P2-8 `Ctrl+C` 退出码是 0,而不是 130(SIGINT 惯例)

**位置**:`src/tui/countdown.ts:133-138`

**问题**:用户主动取消 pomodoro,这是"中断",shell 惯例是 `exit 130`。代码里写的是 `process.exit(0)`。这会让:

- CI/脚本里 `tk focus 25 && do_next_step` 在用户取消后**仍然跑下一段**(应当停)
- `tk focus 25; echo done` 永远会 `done`,即使你按 Ctrl+C 是想停

**修复**:`process.exit(130)`。其余正常退出保留 0。

---

## 🟡 P2-9 Timer 关闭后没还原进程对 `'\x07'` 铃声的偏好

**位置**:`src/tui/countdown.ts:127`、`src/commands/pomodoro.ts:130`

**问题**:两处都 `process.stdout.write('\x07')`,导致完成一轮 pomodoro 会响**两次**铃(一次是 countdown 结束、一次是 pomodoro 控制流)。同时没有可关闭项——`--quiet`/`--no-bell` 这种用户偏好完全没有。

**修复**:把铃声控制权统一在 `cmdPomodoro` 里,countdown 通过回调(`onTick` 或 `onDone`)通知"我准备响铃了",上层决定响不响。或者干脆加个 `bell: boolean` 选项。

---

## 🟡 P2-10 Mascot 内容没做终端宽度适配

**位置**:`src/tui/dashboard.ts:42-53`、`src/tui/countdown.ts:19-28`、`src/mascot.ts`(13 行 × ~28 列字符画)

**问题**:吉祥物是固定 13 行、约 28 宽的 ASCII 字符画。当终端宽度 < 30 列时会被截断或换行错位。blessed 的 `box` 不会替你缩字。

**修复**:拿到 `screen.width` 后判断,如果 `screen.width < 40` 就改用 `CACE_SMALL`(在 `mascot.ts` 里其实已经有 `showCaceSmall`,值得抽出 `CACE_SMALL_ASCII` 静态常量),或者干脆只在 `width >= 40` 时启用 mascot。

---

## 🔵 P3-11 `blessed` 本身已经低活跃

**位置**:`package.json` 依赖 `blessed@^0.1.81`

**观察**:上游 `chjj/blessed` 已经多年低频维护,P0-1 那个 raw-mode / SIGINT 泄漏问题至今没修。
ecosystem 里现在的实际选项是这几家:

| 框架 | 模型 | 维护状态 | 对 cace-timer 的体积影响 | 改动量 |
|------|------|----------|---------------------------|--------|
| **`blessed@0.1.81`**(当前) | 命令式 DOM | 低活跃 | 0(已在用) | 0 |
| **`neo-blessed`**(blessedjs fork) | 命令式 DOM | 偶发更新,API 大致 drop-in | 0(API 兼容) | 小(改 import) |
| **`@inquirer/prompts`** | React-like | 活跃 | +~600 KB | 中(要重写 3 屏) |
| **`ink@^5`** + `@inkjs/ui` | React | 活跃 | +~1 MB(含 React) | 大(整个 tui/ 重写) |

**`neo-blessed` 实际 diff**(零功能迁移成本,只换包名):

```diff
- import blessed from 'blessed';
+ import blessed from 'neo-blessed';
```

API 兼容,但 P0-1 的 raw-mode 泄漏**没修**(neo-blessed 是 fork 不重写)。
唯一现实好处:依赖从一个无人维护的项目挪到还活着的 fork。

**`@inquirer/prompts` 实际 diff**(影响最大的一处举例 —— reflection):

```diff
// reflection.ts: 142 行 blessed 屏 → ~20 行 inquirer
- import blessed from 'blessed';
- import { t } from '../i18n';
- export function showReflectionInput(): Promise<ReflectionResult> {
-   return new Promise(resolve => { /* 77 行 blessed setup */ });
- }
+ import { input } from '@inquirer/prompts';
+ import { t } from '../i18n';
+ export async function showReflectionInput(): Promise<ReflectionResult> {
+   const text = await input({
+     message: t('cmd.stop.reflection'),
+     default: '',
+     validate: v => v.length > 500 ? 'too long' : true,
+   });
+   return { text: text.trim() };
+ }
```

**`ink` 实际 diff**(完整重写,dashboard 举例):

```diff
- import blessed from 'blessed';
- // ... 155 行的 blessed.box 堆叠 ...
+ import React, { useState, useEffect } from 'react';
+ import { render, Box, Text, useInput } from 'ink';
+ import { CACE_FOCUSED, CACE_SLEEPY } from '../mascot';
+ const Dashboard: React.FC<{onSelect: (a: Action) => void}> = ({onSelect}) => {
+   const data = loadData();
+   useInput((ch, key) => {
+     if (key.escape || ch === 'q') onSelect('quit');
+     /* mapMenuKeyToAction(ch) */
+   });
+   return (
+     <Box flexDirection="column">
+       <Text>{data.current ? CACE_FOCUSED : CACE_SLEEPY}</Text>
+       <Text>{/* 等级 / streak 渲染 */}</Text>
+       <Text>{/* 菜单 */}</Text>
+     </Box>
+   );
+ };
+ render(<Dashboard onSelect={/* resolve */} />);
```

**我推荐的取舍**(短期 vs 长期):

1. **立刻的最小行动**:不改库,先修 P0-1(`destroyScreen` helper)。
   这是仓库当前最欠的,跟库选型完全解耦。
2. **如果 6 个月内不打算重写 TUI**:`neo-blessed` 零成本切换,至少有活人看着。
3. **如果准备投入 TUI 重写**:直接跳 Ink。`@inquirer/prompts` 适合"只想
   修 reflection 一个屏"的过渡,但 Dashboard / Countdown 这种多元素布局
   inquirer 不擅长,会卡在它只能"一问一答"的模型里。

**结论**:除非有明确动机重写 TUI,**不要现在就动 blessed**。P0-1 修了,
现状可以再用 1~2 年。

---

## 🔵 P3-12 没有 `--no-tui` 强制降级开关

**问题**:`isInteractiveTerminal()` 自动降级,但用户在 SSH 远程、tmux 嵌套、CI 环境里经常需要**强制**用 console 模式(例如录 GIF、或 pipe 别的工具)。建议加 `--no-tui`。

---

## 总评

| 维度 | 评分 | 说明 |
|------|------|------|
| 功能完整性 | ⭐⭐⭐⭐ | Dashboard / Pomodoro / Reflection 都打通 |
| 健壮性 / 退出路径 | ⭐⭐ | P0-1/P0-2 都是 blessed 长期已知坑,未处理 |
| 国际化 | ⭐⭐⭐ | i18n 基础在,但 TUI 里没拼好(见 P1-6) |
| 可访问性 | ⭐ | 无鼠标以外的可发现性、无屏幕阅读器、无色彩以外的对比度设计 |
| 测试覆盖 | ⭐⭐ | 30 个测试 0 个覆盖 TUI 路径 |
| 维护性 | ⭐⭐⭐ | 模块切分清楚,但半成品 box/import 反映缺复盘 |
| 文档一致性 | ⭐⭐⭐⭐ | README/CHANGELOG/代码对得上 |

**推荐修复顺序**:

1. P0-1 + P0-2(引入 `destroyScreen(screen)` helper,统一所有退出路径)→ **1 PR**
2. P1-3 + P2-10(layout 改 blessed `layout` / 加终端宽高降级)
3. P1-5(reflection 输入框 hardening)+ P2-9(铃统一)
4. P1-4 + P2-8(空壳 UI + 退出码)
5. P1-6(dashboard i18n)+ P2-7(抽出 TUI 纯函数 + 加测试)
6. P3-11/12 按需

**最低限度,这个仓库在发布给陌生用户之前应该修掉 P0-1**——否则 `npm i -g @cacinie/cace-timer` 之后任何一次 Ctrl+C 都会让用户的 shell 卡住。

---

## 附录 A:已确认的基线命令

```bash
npm install          # 152 packages, 0 vulnerabilities
npm test             # 30/30 passed (245ms)
npx tsc --noEmit     # 0 errors
npm run lint         # 0 errors, 8 warnings (全在 TUI 或其依赖)
npm run build        # dist/ 生成 OK
```

## 附录 B:被审计的源文件清单

```
src/tui/index.ts        (7 行, 1 个 export)
src/tui/countdown.ts    (142 行)
src/tui/dashboard.ts    (155 行)
src/tui/reflection.ts   (77 行)
src/index.ts:180-189    (TUI 入口决策)
src/commands/pomodoro.ts:55-118  (调用 showCountdown + 自己的 SIGINT 处理)
src/commands/stop.ts:38-46       (调用 showReflectionInput)
src/mascot.ts           (字符画数据,被 dashboard/countdown 用)
```

## 附录 C:参考资料

- [chjj/blessed README — Screen.destroy & Server-side Usage](https://github.com/chjj/blessed)
- WebSearch: "blessed.js screen destroy SIGINT raw mode stdin TTY leak Node.js"
