import blessed from 'blessed';
import { t } from '../i18n';

interface ReflectionResult {
  text: string;
}

export function showReflectionInput(): Promise<ReflectionResult> {
  return new Promise(resolve => {
    const screen = blessed.screen({
      smartCSR: true,
      title: 'CACE TIMER',
      fullUnicode: true,
    });

    // Title
    blessed.box({
      parent: screen,
      top: 1,
      left: 'center',
      width: '100%',
      height: 1,
      align: 'center',
      style: { fg: 'cyan', bold: true },
      content: t('cmd.stop.reflection'),
    });

    // Text input area
    const input = blessed.textarea({
      parent: screen,
      top: 3,
      left: '10%',
      width: '80%',
      height: 5,
      border: { type: 'line' },
      style: {
        border: { fg: 'cyan' },
        fg: 'white',
        bg: 'black',
        focus: { border: { fg: 'green' } },
      },
      inputOnFocus: true,
    });

    // Hint
    blessed.box({
      parent: screen,
      top: 9,
      left: 'center',
      width: '100%',
      height: 1,
      align: 'center',
      style: { fg: 'gray' },
      content: 'Enter to confirm | Esc to skip',
    });

    input.focus();

    input.key('enter', () => {
      const text = input.getValue().trim();
      screen.destroy();
      resolve({ text });
    });

    input.key('escape', () => {
      screen.destroy();
      resolve({ text: '' });
    });

    screen.key(['C-c'], () => {
      screen.destroy();
      resolve({ text: '' });
    });

    screen.render();
  });
}
