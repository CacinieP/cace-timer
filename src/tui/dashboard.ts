import blessed from 'blessed';
import { loadData, scoreToLevel, getTodayStr } from '../data';
import { formatDuration } from '../utils';
import { t } from '../i18n';
import { getDisplay } from '../terminal';
import { destroyScreen, installSignalCleanup } from './lifecycle';
import { RefreshLoop, startRefreshLoop } from './animation';
import { createSurface } from './surface';

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
  return new Promise((resolve, reject) => {
    const data = loadData();
    const screen = blessed.screen({ smartCSR: true, title: 'CACE TIMER', fullUnicode: true });
    const surface = createSurface(screen);
    let loop: RefreshLoop | undefined = undefined;
    let settled = false;
    const disposeSignals = installSignalCleanup(screen);
    screen.once('destroy', () => {
      loop?.dispose();
      disposeSignals();
    });
    const finish = (action: DashboardAction): void => {
      if (settled) return;
      settled = true;
      loop?.dispose();
      destroyScreen(screen);
      resolve(action);
    };
    const fail = (error: unknown): void => {
      if (settled) return;
      settled = true;
      loop?.dispose();
      destroyScreen(screen);
      reject(error);
    };
    const menu: { key: string; label: string; action: DashboardAction }[] = data.current
      ? [
          { key: 'm', label: t('cmd.mark.markPoint'), action: 'mark' },
          { key: 's', label: t('cmd.help.stopDesc'), action: 'stop' },
        ]
      : [
          { key: 's', label: t('cmd.help.startDesc'), action: 'start' },
          { key: 'f', label: t('cmd.help.focusDesc'), action: 'focus' },
        ];
    menu.push(
      { key: 'b', label: t('cmd.help.summaryDesc'), action: 'summary' },
      { key: 'l', label: t('cmd.help.listDesc'), action: 'list' },
      { key: '?', label: t('cmd.help.helpDesc'), action: 'help' },
    );
    screen.key(
      menu.map((item) => item.key),
      (key: string) => {
        const item = menu.find((item) => item.key === key);
        if (item) finish(item.action);
      },
    );
    screen.key(['escape', 'q'], () => finish('quit'));
    screen.key(['C-c'], () => process.emit('SIGINT'));
    screen.on('resize', () => loop?.refresh());
    const today = getTodayStr();
    let streak = data.streak || 0;
    if (data.lastActiveDate && Date.parse(today) - Date.parse(data.lastActiveDate) > 86400000)
      streak = 0;
    loop = startRefreshLoop(
      (elapsedMs) => {
        const task = data.current;
        const primary = task
          ? [
              `${t('common.task')}: ${task.task}`,
              `${t('cmd.mark.elapsed')}: ${formatDuration(Date.now() - Date.parse(task.start))}`,
            ]
          : [t('tui.ready')];
        const menuLines = menu.map((item) => `[${item.key}] ${item.label}`);
        const height = Number(screen.height);
        const lines =
          height < 12
            ? [...primary, ...menuLines]
            : [
                'C A C E  /  T I M E R',
                '',
                ...primary,
                '',
                ...menuLines,
                '',
                `Lv.${scoreToLevel(data.score || 0)}  |  ${data.score || 0} pts  |  ${t('tui.streak', { days: String(streak) })}`,
              ];
        surface.render('little_smile', elapsedMs, lines, t('tui.quit'));
      },
      fail,
      getDisplay().animation ? 100 : 1000,
    );
  });
}
