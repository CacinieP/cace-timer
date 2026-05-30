// ============ i18n ============
export type Locale = 'zh' | 'en';

export type LocaleStrings = Record<string, string>;

let currentLocale: Locale = 'zh';

export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

// ---- Locale detection ----
export function detectLocale(): Locale {
  const intlLocale = Intl.DateTimeFormat().resolvedOptions().locale;
  if (intlLocale.startsWith('zh')) return 'zh';
  return 'en';
}

export function resolveLocale(cliFlag?: string, storedLang?: string): Locale {
  if (cliFlag === 'zh' || cliFlag === 'en') return cliFlag as Locale;
  if (storedLang === 'zh' || storedLang === 'en') return storedLang as Locale;
  return detectLocale();
}

// ---- String maps ----
const strings: Record<Locale, LocaleStrings> = {
  zh: {
    // Greetings
    'greeting.lateNight': '夜深了',
    'greeting.morning': '早上好',
    'greeting.afternoon': '下午好',
    'greeting.evening': '晚上好',

    // Common
    'common.noActiveTask': '当前没有进行中的任务',
    'common.useStartToBegin': '使用 tk start "任务名" 开始新任务',
    'common.alreadyActive': '已有进行中的任务，请先使用 tk stop 结束',
    'common.useStopFirst': '请先使用 tk stop 结束当前任务',
    'common.noHistory': '暂无记录',
    'common.notFound': '未找到匹配记录',
    'common.noData': '无数据',
    'common.deleted': '已删除',
    'common.resumed': '已恢复',
    'common.task': '任务',
    'common.tags': '标签',
    'common.start': '开始',
    'common.duration': '时长',
    'common.marks': '标记',
    'common.estimate': '预计',
    'common.running': '进行中',
    'common.id': 'ID',
    'common.idle': '😴 当前没有进行中的任务',

    // cmd: start
    'cmd.start.recording': '开始记录',
    'cmd.start.taskLabel': '任务',
    'cmd.start.tagLabel': '标签',
    'cmd.start.estimateLabel': '预计',
    'cmd.start.startLabel': '开始',
    'cmd.start.unnamedTask': '未命名任务',

    // cmd: mark
    'cmd.mark.marked': '✓ 已标记',
    'cmd.mark.markPoint': '标记点',
    'cmd.mark.elapsed': '已用时',
    'cmd.mark.noActive': '没有进行中的任务，请先用 tk start 开始',

    // cmd: stop
    'cmd.stop.taskComplete': '任务完成！',
    'cmd.stop.taskSummary': '📊 任务总结',
    'cmd.stop.efficiencyScore': '效率分',
    'cmd.stop.noEstimate': '未设置预估时长，无法计算效率分',
    'cmd.stop.noActive': '没有进行中的任务',
    'cmd.stop.marksCount': '个',

    // cmd: status
    'cmd.status.inProgress': '🔥 进行中',
    'cmd.status.idle': '当前没有进行中的任务',
    'cmd.status.useStartToBegin': '使用 tk start "任务名" 开始新任务',

    // cmd: list
    'cmd.list.historyTitle': '历史记录',
    'cmd.list.noRecords': '📭 暂无记录',

    // cmd: search
    'cmd.search.searchFor': '搜索: "{keyword}"',
    'cmd.search.found': '找到 {count} 条记录:',
    'cmd.search.noMatch': '🔍 未找到匹配记录',

    // cmd: sync
    'cmd.sync.configured': '同步已配置',
    'cmd.sync.syncPath': '📂 同步路径: {path}',
    'cmd.sync.syncTip': '💡 提示: 可将文件放在 Dropbox/iCloud/OneDrive 等同步目录',
    'cmd.sync.emptyPath': '⚠ 请提供同步文件路径',
    'cmd.sync.dirNotExist': '⚠ 目录不存在: {dir}',

    // cmd: help
    'cmd.help.title': 'CACE TIMER - 命令帮助',
    'cmd.help.start': 'tk start <任务名> [选项]',
    'cmd.help.startDesc': '开始新任务',
    'cmd.help.startTag': '--tag <标签>    添加标签（可多个: --tag dev --tag api 或 --tag dev,api）',
    'cmd.help.startEstimate': '--estimate <分钟>  预估时长',
    'cmd.help.mark': 'tk mark <备注>',
    'cmd.help.markDesc': '记录时间点',
    'cmd.help.stop': 'tk stop',
    'cmd.help.stopDesc': '结束当前任务（显示效率评分）',
    'cmd.help.status': 'tk status',
    'cmd.help.statusDesc': '查看当前状态',
    'cmd.help.list': 'tk list [选项]',
    'cmd.help.listDesc': '查看历史记录',
    'cmd.help.listToday': '--today         仅今天',
    'cmd.help.listTag': '--tag <标签>    按标签筛选',
    'cmd.help.listLimit': '--limit <数量>  限制数量',
    'cmd.help.search': 'tk search <关键词>',
    'cmd.help.searchDesc': '搜索记录',
    'cmd.help.sync': 'tk sync <文件路径>',
    'cmd.help.syncDesc': '设置同步文件路径',
    'cmd.help.summary': 'tk summary [选项]',
    'cmd.help.summaryDesc': '统计报表',
    'cmd.help.summaryToday': '--today         仅今天',
    'cmd.help.summaryWeek': '--week          本周',
    'cmd.help.summaryMonth': '--month         本月',
    'cmd.help.summaryTag': '--tag <标签>    按标签筛选',
    'cmd.help.delete': 'tk delete <id | --last>',
    'cmd.help.deleteDesc': '删除记录',
    'cmd.help.resume': 'tk resume <id | --last>',
    'cmd.help.resumeDesc': '恢复任务',
    'cmd.help.export': 'tk export [选项]',
    'cmd.help.exportDesc': '导出数据',
    'cmd.help.exportFormat': '--format csv|markdown  输出格式（默认 csv）',
    'cmd.help.exportOutput': '--output <文件>  输出到文件',
    'cmd.help.pomodoro': 'tk pomodoro <任务名> [选项]',
    'cmd.help.pomodoroDesc': '番茄钟',
    'cmd.help.pomodoroWork': '--work <分钟>   工作时长（默认 25）',
    'cmd.help.pomodoroBreak': '--break <分钟>  休息时长（默认 5）',
    'cmd.help.pomodoroRounds': '--rounds <数量> 轮数（默认 4）',
    'cmd.help.pomodoroTag': '--tag <标签>    添加标签',
    'cmd.help.lang': '--lang zh|en    设置语言',
    'cmd.help.help': 'tk help',
    'cmd.help.helpDesc': '显示帮助',

    // cmd: summary
    'cmd.summary.title': '统计报表',
    'cmd.summary.totalSessions': '总会话数',
    'cmd.summary.totalDuration': '总时长',
    'cmd.summary.avgDuration': '平均时长',
    'cmd.summary.tagBreakdown': '标签分布',
    'cmd.summary.dailyHours': '每日时长',
    'cmd.summary.dailyHoursLabel': '近 7 天',
    'cmd.summary.top5': '最长任务 Top 5',
    'cmd.summary.noData': '暂无统计数据',
    'cmd.summary.sessions': '个会话',

    // cmd: delete
    'cmd.delete.specify': '请指定要删除的会话 ID 或使用 --last',
    'cmd.delete.notFound': '未找到该会话',
    'cmd.delete.deleted': '已删除会话: {task}',
    'cmd.delete.deletedLast': '已删除最近一条记录: {task}',
    'cmd.delete.noHistory': '暂无记录可删除',

    // cmd: resume
    'cmd.resume.specify': '请指定要恢复的会话 ID 或使用 --last',
    'cmd.resume.notFound': '未找到该会话',
    'cmd.resume.resumed': '已恢复任务: {task}',
    'cmd.resume.noHistory': '暂无记录可恢复',

    // cmd: export
    'cmd.export.noData': '暂无数据可导出',
    'cmd.export.exportedTo': '已导出到: {path}',
    'cmd.export.unsupportedFormat': '不支持的格式，请使用 csv 或 markdown',
    'cmd.export.defaultOutput': '输出到 stdout',

    // cmd: pomodoro
    'cmd.pomodoro.round': '第 {round}/{total} 轮',
    'cmd.pomodoro.workPhase': '工作',
    'cmd.pomodoro.breakPhase': '休息',
    'cmd.pomodoro.workDone': '工作阶段完成！',
    'cmd.pomodoro.breakDone': '休息结束',
    'cmd.pomodoro.breakTime': '休息时间',
    'cmd.pomodoro.complete': '番茄钟全部完成！',
    'cmd.pomodoro.totalWork': '总工作时间',
    'cmd.pomodoro.totalBreak': '总休息时间',
    'cmd.pomodoro.roundsCompleted': '完成轮数',
    'cmd.pomodoro.interrupted': '番茄钟已中断',
    'cmd.pomodoro.starting': '番茄钟开始',

    // Score / Level / Streak
    'score.earned': '+{points} 积分',
    'score.total': '总积分',
    'score.level': '等级',
    'score.progress': '{current}/{needed} 升级',
    'score.streak': '连续打卡',
    'score.streakDays': '{days} 天',
    'score.streakFire': '🔥 连续 {days} 天！',
    'score.newStreak': '🎉 开始新的打卡记录！',

    // Reflection
    'cmd.stop.reflection': '💭 心得感悟（可选，按 Enter 跳过）',
    'cmd.stop.reflectionSaved': '心得已保存',

    // Focus shortcut
    'cmd.focus.alias': '快捷专注',
    'cmd.focus.start': '开始专注: {task} ({minutes}分钟)',
    'cmd.focus.encourage1': '💪 加油，专注就是力量！',
    'cmd.focus.encourage2': '🎯 保持专注，你在进步！',
    'cmd.focus.encourage3': '⭐ 你做得很棒！继续！',
    'cmd.focus.encourage4': '🚀 专注中的你最有魅力！',
    'cmd.focus.encourage5': '🌸 每一分钟的专注都算数！',
    'cmd.focus.encourage6': '✨ 深呼吸，继续前进！',

    // Guardian / Mascot moods
    'mascot.encourage1': 'CACE 正在注视着你...',
    'mascot.encourage2': 'CACE 相信你可以的！',
    'mascot.encourage3': 'CACE: 坚持住！',
    'mascot.focused': '😤 专注中...',
    'mascot.celebrating': '🎉 太棒了！',
    'mascot.disappointed': '😴 别灰心，明天再来！',

    // Status enhancements
    'cmd.status.level': '📊 Lv.{level} | {score} pts',
    'cmd.status.streak': '{fire} 连续 {days} 天',
    'cmd.status.noStreak': '今天开始打卡吧！',

    // Help additions
    'cmd.help.focus': 'tk focus <5|15|30|60> [任务名]',
    'cmd.help.focusDesc': '快捷专注（等同于番茄钟）',
    'cmd.help.stopReflection': '    --reflection <text>  记录心得感悟',

    // Error
    'error.unknownCommand': '未知命令: {command}',
    'error.useHelp': '使用 tk help 查看帮助',
  },

  en: {
    // Greetings
    'greeting.lateNight': 'Late night',
    'greeting.morning': 'Good morning',
    'greeting.afternoon': 'Good afternoon',
    'greeting.evening': 'Good evening',

    // Common
    'common.noActiveTask': 'No active task',
    'common.useStartToBegin': 'Use tk start "task name" to begin',
    'common.alreadyActive': 'Already have an active task, use tk stop first',
    'common.useStopFirst': 'Please stop the current task first with tk stop',
    'common.noHistory': 'No records yet',
    'common.notFound': 'No matching records found',
    'common.noData': 'No data',
    'common.deleted': 'Deleted',
    'common.resumed': 'Resumed',
    'common.task': 'Task',
    'common.tags': 'Tags',
    'common.start': 'Start',
    'common.duration': 'Duration',
    'common.marks': 'Marks',
    'common.estimate': 'Estimate',
    'common.running': 'Running',
    'common.id': 'ID',
    'common.idle': '😴 No active task',

    // cmd: start
    'cmd.start.recording': 'Recording',
    'cmd.start.taskLabel': 'Task',
    'cmd.start.tagLabel': 'Tags',
    'cmd.start.estimateLabel': 'Estimate',
    'cmd.start.startLabel': 'Start',
    'cmd.start.unnamedTask': 'Untitled task',

    // cmd: mark
    'cmd.mark.marked': '✓ Marked',
    'cmd.mark.markPoint': 'Mark point',
    'cmd.mark.elapsed': 'Elapsed',
    'cmd.mark.noActive': 'No active task, use tk start first',

    // cmd: stop
    'cmd.stop.taskComplete': 'Task complete!',
    'cmd.stop.taskSummary': '📊 Task Summary',
    'cmd.stop.efficiencyScore': 'Efficiency',
    'cmd.stop.noEstimate': 'No estimate set, cannot calculate efficiency',
    'cmd.stop.noActive': 'No active task',
    'cmd.stop.marksCount': 'marks',

    // cmd: status
    'cmd.status.inProgress': '🔥 In progress',
    'cmd.status.idle': 'No active task',
    'cmd.status.useStartToBegin': 'Use tk start "task name" to begin',

    // cmd: list
    'cmd.list.historyTitle': 'History',
    'cmd.list.noRecords': '📭 No records yet',

    // cmd: search
    'cmd.search.searchFor': 'Search: "{keyword}"',
    'cmd.search.found': 'Found {count} records:',
    'cmd.search.noMatch': '🔍 No matching records',

    // cmd: sync
    'cmd.sync.configured': 'Sync configured',
    'cmd.sync.syncPath': '📂 Sync path: {path}',
    'cmd.sync.syncTip': '💡 Tip: Place the file in a synced folder like Dropbox/iCloud/OneDrive',
    'cmd.sync.emptyPath': '⚠ Please provide a sync file path',
    'cmd.sync.dirNotExist': '⚠ Directory does not exist: {dir}',

    // cmd: help
    'cmd.help.title': 'CACE TIMER - Help',
    'cmd.help.start': 'tk start <task> [options]',
    'cmd.help.startDesc': 'Start a new task',
    'cmd.help.startTag': '--tag <tag>      Add tag(s) (--tag dev --tag api or --tag dev,api)',
    'cmd.help.startEstimate': '--estimate <min>  Estimated duration',
    'cmd.help.mark': 'tk mark <note>',
    'cmd.help.markDesc': 'Record a time checkpoint',
    'cmd.help.stop': 'tk stop',
    'cmd.help.stopDesc': 'Stop current task (show efficiency score)',
    'cmd.help.status': 'tk status',
    'cmd.help.statusDesc': 'Show current status',
    'cmd.help.list': 'tk list [options]',
    'cmd.help.listDesc': 'View history',
    'cmd.help.listToday': '--today         Today only',
    'cmd.help.listTag': '--tag <tag>     Filter by tag',
    'cmd.help.listLimit': '--limit <n>     Limit count',
    'cmd.help.search': 'tk search <keyword>',
    'cmd.help.searchDesc': 'Search records',
    'cmd.help.sync': 'tk sync <file-path>',
    'cmd.help.syncDesc': 'Set sync file path',
    'cmd.help.summary': 'tk summary [options]',
    'cmd.help.summaryDesc': 'Statistics report',
    'cmd.help.summaryToday': '--today         Today only',
    'cmd.help.summaryWeek': '--week          This week',
    'cmd.help.summaryMonth': '--month         This month',
    'cmd.help.summaryTag': '--tag <tag>     Filter by tag',
    'cmd.help.delete': 'tk delete <id | --last>',
    'cmd.help.deleteDesc': 'Delete a record',
    'cmd.help.resume': 'tk resume <id | --last>',
    'cmd.help.resumeDesc': 'Resume a task',
    'cmd.help.export': 'tk export [options]',
    'cmd.help.exportDesc': 'Export data',
    'cmd.help.exportFormat': '--format csv|markdown  Output format (default: csv)',
    'cmd.help.exportOutput': '--output <file>  Output to file',
    'cmd.help.pomodoro': 'tk pomodoro <task> [options]',
    'cmd.help.pomodoroDesc': 'Pomodoro timer',
    'cmd.help.pomodoroWork': '--work <min>    Work duration (default: 25)',
    'cmd.help.pomodoroBreak': '--break <min>   Break duration (default: 5)',
    'cmd.help.pomodoroRounds': '--rounds <n>    Number of rounds (default: 4)',
    'cmd.help.pomodoroTag': '--tag <tag>     Add tag(s)',
    'cmd.help.lang': '--lang zh|en    Set language',
    'cmd.help.help': 'tk help',
    'cmd.help.helpDesc': 'Show help',

    // cmd: summary
    'cmd.summary.title': 'Statistics',
    'cmd.summary.totalSessions': 'Total sessions',
    'cmd.summary.totalDuration': 'Total duration',
    'cmd.summary.avgDuration': 'Average duration',
    'cmd.summary.tagBreakdown': 'Tag breakdown',
    'cmd.summary.dailyHours': 'Daily hours',
    'cmd.summary.dailyHoursLabel': 'Last 7 days',
    'cmd.summary.top5': 'Top 5 longest tasks',
    'cmd.summary.noData': 'No data for this period',
    'cmd.summary.sessions': 'sessions',

    // cmd: delete
    'cmd.delete.specify': 'Specify a session ID or use --last',
    'cmd.delete.notFound': 'Session not found',
    'cmd.delete.deleted': 'Session deleted: {task}',
    'cmd.delete.deletedLast': 'Deleted most recent record: {task}',
    'cmd.delete.noHistory': 'No records to delete',

    // cmd: resume
    'cmd.resume.specify': 'Specify a session ID or use --last',
    'cmd.resume.notFound': 'Session not found',
    'cmd.resume.resumed': 'Task resumed: {task}',
    'cmd.resume.noHistory': 'No records to resume',

    // cmd: export
    'cmd.export.noData': 'No data to export',
    'cmd.export.exportedTo': 'Exported to: {path}',
    'cmd.export.unsupportedFormat': 'Unsupported format, use csv or markdown',
    'cmd.export.defaultOutput': 'Output to stdout',

    // cmd: pomodoro
    'cmd.pomodoro.round': 'Round {round}/{total}',
    'cmd.pomodoro.workPhase': 'Work',
    'cmd.pomodoro.breakPhase': 'Break',
    'cmd.pomodoro.workDone': 'Work phase done!',
    'cmd.pomodoro.breakDone': 'Break over',
    'cmd.pomodoro.breakTime': 'Break time',
    'cmd.pomodoro.complete': 'All pomodoro rounds complete!',
    'cmd.pomodoro.totalWork': 'Total work time',
    'cmd.pomodoro.totalBreak': 'Total break time',
    'cmd.pomodoro.roundsCompleted': 'Rounds completed',
    'cmd.pomodoro.interrupted': 'Pomodoro interrupted',
    'cmd.pomodoro.starting': 'Pomodoro starting',

    // Score / Level / Streak
    'score.earned': '+{points} pts',
    'score.total': 'Total score',
    'score.level': 'Level',
    'score.progress': '{current}/{needed} to next',
    'score.streak': 'Streak',
    'score.streakDays': '{days} days',
    'score.streakFire': '🔥 {days} day streak!',
    'score.newStreak': '🎉 New streak started!',

    // Reflection
    'cmd.stop.reflection': '💭 Reflection (optional, press Enter to skip)',
    'cmd.stop.reflectionSaved': 'Reflection saved',

    // Focus shortcut
    'cmd.focus.alias': 'Quick focus',
    'cmd.focus.start': 'Focus: {task} ({minutes}min)',
    'cmd.focus.encourage1': '💪 Keep going, focus is power!',
    'cmd.focus.encourage2': '🎯 Stay focused, you are improving!',
    'cmd.focus.encourage3': '⭐ You are doing great! Keep it up!',
    'cmd.focus.encourage4': '🚀 You shine brightest when focused!',
    'cmd.focus.encourage5': '🌸 Every minute of focus counts!',
    'cmd.focus.encourage6': '✨ Take a deep breath, keep going!',

    // Guardian / Mascot moods
    'mascot.encourage1': 'CACE is watching you...',
    'mascot.encourage2': 'CACE believes in you!',
    'mascot.encourage3': 'CACE: Hang in there!',
    'mascot.focused': '😤 Focused...',
    'mascot.celebrating': '🎉 Awesome!',
    'mascot.disappointed': '😴 Don\'t worry, try again tomorrow!',

    // Status enhancements
    'cmd.status.level': '📊 Lv.{level} | {score} pts',
    'cmd.status.streak': '{fire} {days} day streak',
    'cmd.status.noStreak': 'Start your streak today!',

    // Help additions
    'cmd.help.focus': 'tk focus <5|15|30|60> [task]',
    'cmd.help.focusDesc': 'Quick focus (same as pomodoro)',
    'cmd.help.stopReflection': '    --reflection <text>  Save reflection',

    // Error
    'error.unknownCommand': 'Unknown command: {command}',
    'error.useHelp': 'Use tk help for help',
  },
};

// ---- t() lookup ----
export function t(key: string, params?: Record<string, string | number>): string {
  const map = strings[currentLocale];
  let result = map[key];
  if (result === undefined) {
    // Fallback to zh if key missing in current locale
    result = strings.zh[key];
  }
  if (result === undefined) return key;

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return result;
}
