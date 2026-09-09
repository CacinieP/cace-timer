import blessed from 'blessed';
import { EXPRESSIONS, Expression, MascotSize } from '../mascot/assets/mint';
import { getFrame, renderFrame } from '../mascot/frames';
import { getDisplay } from '../terminal';
import { getLocale, t } from '../i18n';
import { isInteractiveTerminal } from '../tui';
import { createSurface } from '../tui/surface';
import { RefreshLoop, startRefreshLoop } from '../tui/animation';
import { destroyScreen, installSignalCleanup } from '../tui/lifecycle';

export async function cmdMascot(options: {
  all?: boolean;
  expression?: string;
  size?: string;
}): Promise<void> {
  if (options.expression && !EXPRESSIONS.some((item) => item.key === options.expression)) {
    throw new Error(
      t('mascot.invalidExpression', { names: EXPRESSIONS.map((item) => item.key).join(', ') }),
    );
  }
  if (options.size && !['full', 'compact', 'tiny'].includes(options.size)) {
    throw new Error(t('mascot.invalidSize'));
  }
  const display = getDisplay();
  if (options.all || options.size || !isInteractiveTerminal()) {
    const selected = options.all
      ? EXPRESSIONS
      : EXPRESSIONS.filter((item) => item.key === (options.expression ?? 'little_smile'));
    for (const item of selected) {
      console.log(`${item.key} / ${item[getLocale()]}`);
      console.log(
        renderFrame(
          getFrame({
            expression: item.key,
            size: (options.size ?? 'full') as MascotSize,
            ascii: display.ascii,
          }),
          display,
        ),
      );
      console.log();
    }
    return;
  }
  await new Promise<void>((resolve, reject) => {
    const screen = blessed.screen({ smartCSR: true, title: 'CACE / MINT', fullUnicode: true });
    const surface = createSurface(screen);
    let loop: RefreshLoop | undefined = undefined;
    let index = Math.max(
      0,
      EXPRESSIONS.findIndex((item) => item.key === options.expression),
    );
    let settled = false;
    const disposeSignals = installSignalCleanup(screen);
    screen.once('destroy', () => {
      loop?.dispose();
      disposeSignals();
    });
    const finish = (error?: unknown): void => {
      if (settled) return;
      settled = true;
      loop?.dispose();
      destroyScreen(screen);
      if (error !== undefined) reject(error);
      else resolve();
    };
    screen.key(['escape', 'q'], () => finish());
    screen.key(['C-c'], () => process.emit('SIGINT'));
    screen.key(['right', 'n', 'space'], () => {
      index = (index + 1) % EXPRESSIONS.length;
      loop?.refresh();
    });
    screen.key(['left', 'p'], () => {
      index = (index + EXPRESSIONS.length - 1) % EXPRESSIONS.length;
      loop?.refresh();
    });
    screen.on('resize', () => loop?.refresh());
    loop = startRefreshLoop(
      (elapsed) => {
        const item = EXPRESSIONS[index];
        surface.render(
          item.key as Expression,
          elapsed,
          [`C A C E  /  M I N T`, `${index + 1}/16  ${item[getLocale()]}`, item.key],
          t('mascot.controls'),
        );
      },
      finish,
      display.animation ? 100 : 1000,
    );
  });
}
