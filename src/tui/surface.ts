import blessed from 'blessed';
import { Expression } from '../mascot/assets/mint';
import { getFrame, renderFrame } from '../mascot/frames';
import { fitText, getDisplay, resolveColor } from '../terminal';
import { calculateLayout } from './layout';

// Artwork is tagged, user text is not. This prevents task names such as
// "{red-bg}" from being interpreted as blessed markup.
export function createSurface(screen: blessed.Widgets.Screen): {
  render(
    expression: Expression,
    elapsedMs: number,
    lines: string[],
    footer: string,
    bodyRows?: number,
  ): void;
} {
  const mascot = blessed.box({ parent: screen, tags: true, wrap: false, align: 'left' });
  const body = blessed.box({ parent: screen, tags: false, wrap: false, align: 'left' });
  const hint = blessed.box({ parent: screen, tags: false, wrap: false });
  let previous = '';
  return {
    render(expression, elapsedMs, lines, footer, bodyRows = lines.length) {
      const columns = Number(screen.width);
      const rows = Number(screen.height);
      const layout = calculateLayout(columns, rows, bodyRows);
      const display = getDisplay();
      const plain = resolveColor() === 'never';
      body.style.fg = plain ? 'default' : display.theme === 'light' ? '#526764' : '#d5e7e3';
      hint.style.fg = plain ? 'default' : display.theme === 'light' ? '#687776' : '#82989e';
      const frame = layout.mascot
        ? getFrame({
            expression,
            size: layout.mascot.size,
            elapsedMs,
            motion: display.animation,
            ascii: display.ascii,
          })
        : undefined;
      const picture = frame ? renderFrame(frame, { ...display, format: 'blessed' }) : '';
      const content = lines
        .slice(0, layout.body.height)
        .map((line) => fitText(line, layout.body.width))
        .join('\n');
      const footerText = fitText(footer, columns);
      const signature = JSON.stringify([columns, rows, layout, picture, content, footerText]);
      if (signature === previous) return;
      previous = signature;
      if (layout.mascot) {
        Object.assign(mascot, layout.mascot);
        mascot.show();
        mascot.setContent(picture);
      } else mascot.hide();
      Object.assign(body, layout.body);
      if (layout.body.height) body.show();
      else body.hide();
      body.setContent(content);
      Object.assign(hint, layout.footer);
      hint.setContent(footerText);
      screen.render();
    },
  };
}
