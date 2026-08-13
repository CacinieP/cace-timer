import blessed from 'blessed';
import { loadData, scoreToLevel, pointsToNextLevel, getTodayStr } from '../data';
import { CACE_FOCUSED, CACE_SLEEPY } from '../mascot';
import { formatDuration } from '../utils';
import { t } from '../i18n';

export type DashboardAction =
  | 'start'
  | 'focus'
  | 'mark'
  | 'stop'
  | 'summary'
  | 'list'
  | 'help'
  | 'quit';

export function showDashboard(): Promise<DashboardAction> {
  return new Promise(resolve => {
    const data = loadData();

    // Refresh streak display (don't mutate saved data here)
    let displayStreak = data.streak || 0;
    const today = getTodayStr();
    if (data.lastActiveDate && data.lastActiveDate !== today) {
      const last = new Date(data.lastActiveDate);
      const now = new Date(today);
      const diff = Math.floor((now.getTime() - last.getTime()) / 86400000);
      if (diff > 1) displayStreak = 0;
    }

    const level = scoreToLevel(data.score || 0);
    const prog = pointsToNextLevel(data.score || 0);

    const screen = blessed.screen({
      smartCSR: true,
      title: 'CACE TIMER',
      fullUnicode: true,
    });

    // Mascot
    const mascotContent = data.current ? CACE_FOCUSED : CACE_SLEEPY;
    blessed.box({
      parent: screen,
      top: 0,
      left: 'center',
      width: 46,
      height: 13,
      align: 'center',
      valign: 'top',
      style: { fg: 'cyan' },
      content: mascotContent,
    });

    // Level / Score / Streak bar
    const streakStr =
      displayStreak > 1
        ? t('score.streakFire', { days: String(displayStreak) })
        : displayStreak === 1
          ? t('score.newStreak')
          : t('cmd.status.noStreak');

    const progFilled = Math.min(20, Math.round((prog.current / Math.max(1, prog.needed)) * 20));
    const progressBar = '█'.repeat(progFilled) + '░'.repeat(20 - progFilled);

    blessed.box({
      parent: screen,
      top: 13,
      left: 'center',
      width: '100%',
      height: 3,
      align: 'center',
      style: { fg: 'yellow', bold: true },
      content: ` ${t('cmd.status.level', { level: String(level), score: String(data.score || 0) })}  |  ${streakStr}\n ${progressBar} ${t('score.progress', { current: String(prog.current), needed: String(prog.needed) })}`,
    });

    // Active task panel
    const hasActive = !!data.current;
    const menuTop = hasActive ? 18 : 17;

    if (hasActive && data.current) {
      const elapsed = Date.now() - new Date(data.current.start).getTime();
      const taskInfo = data.current;
      blessed.box({
        parent: screen,
        top: 16,
        left: '10%',
        width: '80%',
        height: 2,
        align: 'center',
        border: { type: 'line' },
        style: { fg: 'green', border: { fg: 'green' } },
        content: ` ${t('cmd.status.inProgress')}: ${taskInfo.task} | ${t('cmd.mark.elapsed')}: ${formatDuration(elapsed)}`,
      });
    }

    // Menu items - context-dependent
    const menuItems: { key: string; label: string; action: DashboardAction }[] = hasActive
      ? [
          { key: 'm', label: `📍 ${t('cmd.mark.markPoint')}`, action: 'mark' },
          { key: 's', label: `⏹  ${t('cmd.help.stopDesc')}`, action: 'stop' },
          { key: 'b', label: `📊 ${t('cmd.help.summaryDesc')}`, action: 'summary' },
          { key: 'l', label: `📋 ${t('cmd.help.listDesc')}`, action: 'list' },
          { key: '?', label: `❓ ${t('cmd.help.helpDesc')}`, action: 'help' },
        ]
      : [
          { key: 's', label: `🚀 ${t('cmd.help.startDesc')}`, action: 'start' },
          { key: 'f', label: `🍅 ${t('cmd.help.focusDesc')}`, action: 'focus' },
          { key: 'b', label: `📊 ${t('cmd.help.summaryDesc')}`, action: 'summary' },
          { key: 'l', label: `📋 ${t('cmd.help.listDesc')}`, action: 'list' },
          { key: '?', label: `❓ ${t('cmd.help.helpDesc')}`, action: 'help' },
        ];

    const menuContent = menuItems.map(m => `  [${m.key}]  ${m.label}`).join('\n');

    blessed.box({
      parent: screen,
      top: menuTop,
      left: 'center',
      width: '80%',
      height: menuItems.length + 1,
      align: 'center',
      style: { fg: 'white' },
      content: menuContent,
    });

    // Bottom hint
    blessed.box({
      parent: screen,
      bottom: 0,
      left: 'center',
      width: '100%',
      height: 1,
      align: 'center',
      style: { fg: 'gray' },
      content: 'q/Esc to quit',
    });

    // Handle keys
    const allKeys = menuItems.map(m => m.key);
    screen.key([...allKeys], (ch: string) => {
      const item = menuItems.find(m => m.key === ch);
      if (item) {
        screen.destroy();
        resolve(item.action);
      }
    });

    screen.key(['escape', 'q', 'C-c'], () => {
      screen.destroy();
      resolve('quit');
    });

    screen.render();
  });
}
