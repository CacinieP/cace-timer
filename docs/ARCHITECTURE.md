# cace-timer Architecture

> 对内架构文档。面向贡献者,不写在 npm 包内。

## 模块布局

```
src/
├── index.ts          # CLI 入口:参数解析 → locale → 路由(命令 | Dashboard)
├── types.ts          # 全局类型(Session / Data / etc.)
├── data.ts           # 持久化(loadData/saveData) + 积分/等级/连续天数算法
├── parser.ts         # 自研 mini-arg-parser(无依赖)
├── i18n.ts           # zh/en 双语字典 + 自动检测
├── utils.ts          # formatDuration / sleep / generateId
├── mascot.ts         # CACE 字符画(13 行 ASCII + 5 个 mood)
│
├── commands/         # 一文件一命令(纯 console 输出)
│   ├── start.ts  mark.ts  stop.ts  status.ts
│   ├── list.ts   search.ts  summary.ts  delete.ts
│   ├── resume.ts  export.ts  sync.ts  help.ts
│   └── pomodoro.ts      # ← 唯一在交互终端里调 TUI 的命令
│
└── tui/              # 交互式 TUI 模块(blessed-based)
    ├── index.ts          # isInteractiveTerminal(): 判断 TTY
    ├── dashboard.ts      # 主菜单(Promise<DashboardAction>)
    ├── countdown.ts      # 番茄钟倒计时(回调式 onDone)
    └── reflection.ts     # stop 时的反思输入(Promise<{text}>)
```

## 入口路由

```
argv → parseArgs
     → resolveLocale(--lang | stored | 系统)
     → setLocale
     │
     ├ command === '' && isTTY → showDashboard() → runDashboardAction(action)
     ├ command === '--help'/'-h' → cmdHelp()
     └ command else → runCommand(command)
```

`index.ts:182` 是 TTY 决策点——**只有这个无参 + TTY 路径会进 Dashboard**。
Pomodoro 和 Stop 的 TUI 由各自命令内部判断 `isInteractiveTerminal()`,
不依赖 `tk` 无参入口。

## TUI 三屏职责

| 屏 | 函数 | 返回 | 触发场景 |
|----|------|------|----------|
| Dashboard | `showDashboard(): Promise<DashboardAction>` | `'start'\|'focus'\|'mark'\|'stop'\|'summary'\|'list'\|'help'\|'quit'` | `tk` 无参 + TTY |
| Countdown | `showCountdown({totalMs,label,mascots,onDone}): void` | 回调,无 Promise | `cmdPomodoro` 的每一轮 |
| Reflection | `showReflectionInput(): Promise<{text}>` | `{text:string}` | `cmdStop` 在 TTY 且没传 `--reflection` |

调用方降级:

| 函数 | 非 TTY 行为 |
|------|-----------|
| Dashboard | 走 `cmdHelp()` |
| Countdown | 走 `runCountdown(workMin*60000)`(console-only sleep 循环) |
| Reflection | `session.reflection` 不被赋值 |

## 退出路径汇总(blessed 已知问题点)

每个 TUI 屏都通过 `screen.destroy()` 退出,但**没有**显式还原
`process.stdin.setRawMode(false)` / cursor,blessed 也不帮你做。
详见 `tui-audit.md` P0-1。

```
Dashboard
  ├─ q / Esc / Ctrl+C  → screen.destroy() → resolve('quit')
  └─ [s|m|b|l|?|f]     → screen.destroy() → resolve(action)

Countdown
  ├─ Ctrl+C            → clearInterval + screen.destroy + exit(0)  ← 退出码应是 130
  ├─ 500ms timer 自然完成 → screen.destroy + onDone() (再下一轮 / cleanup)
  └─ onDone 抛错        → 无兜底,带 raw mode 退出  ← 见 P0-2

Reflection
  ├─ Enter             → screen.destroy + resolve({text})
  ├─ Esc               → screen.destroy + resolve({text:''})
  └─ Ctrl+C            → screen.destroy + resolve({text:''})
```

## 数据流

```text
~/.cace-timer.json
   │
   └─▶ loadData() ─▶ in-memory Data
                       │
                       ├─ 一次性命令(read once, mutate, saveData)
                       │     e.g. start / mark / stop / delete / resume
                       │
                       └─ 循环型命令(pomodoro 每轮都读写)
                             e.g. cmdPomodoro 在每轮结束时
                                  set end → unshift to history
                                  → saveData → 下一轮 / 总结
                       │
                       ▼
                   console 输出 / TUI 渲染
```

读路径:`loadData()` 在每次命令入口调用一次。
写路径:几乎所有修改都通过同一个 `saveData()` 落盘(`data.ts`)。

唯一的特殊点是 `cmdPomodoro`:**它在循环内部多次 saveData**(每轮结束都更新
`history` 和 `current`),而不像其它命令那样 read-modify-write 一次。
所以 pomodoro 崩溃时残留状态可能比其它命令更复杂。

## 依赖

| 包 | 用途 | 备注 |
|----|------|------|
| `blessed@^0.1.81` | TUI | 上游低活跃,见审计 P3-11 |
| `@types/blessed` | TS 类型 | |
| `typescript@^5.3` | 编译 | strict mode |
| `vitest@^4.1.7` | 测试 | 当前 30 用例,0 覆盖 TUI |
| `eslint@^10` + `typescript-eslint@^8.60` | 静态检查 | flat config |

## 构建/发布

```
src/*.ts ──tsc──▶ dist/*.js + *.d.ts
                     │
                     ├─ bin tk ─────▶ dist/index.js
                     └─ bin cace-timer ─▶ dist/index.js
```

`package.json` 的 `prepare: npm run build` 让 `npm install` 自动编译。
GitHub Actions CI 在 Node 18/20/22 三版本上跑 build + lint + test。
