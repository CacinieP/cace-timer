import { getFrame } from '../mascot/frames';
import { MascotSize } from '../mascot/assets/mint';

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}
export interface Layout {
  mascot?: Rect & { size: MascotSize };
  body: Rect;
  footer: Rect;
}

export function calculateLayout(columns: number, rows: number, bodyRows: number): Layout {
  const width = Math.max(1, Math.floor(columns));
  const height = Math.max(1, Math.floor(rows));
  const usableHeight = Math.max(0, height - 1);
  const footer: Rect = { top: height - 1, left: 0, width, height: 1 };
  const full = getFrame();
  if (width >= full.width + 42 && usableHeight >= Math.max(full.height, bodyRows)) {
    return {
      mascot: { size: 'full', top: 0, left: 0, width: full.width, height: full.height },
      body: { top: 0, left: full.width + 3, width: width - full.width - 3, height: usableHeight },
      footer,
    };
  }
  for (const size of ['full', 'compact', 'tiny'] as const) {
    const frame = getFrame({ size });
    if (frame.width <= width && frame.height + 1 + bodyRows <= usableHeight) {
      const top = frame.height + 1;
      return {
        mascot: {
          size,
          top: 0,
          left: Math.floor((width - frame.width) / 2),
          width: frame.width,
          height: frame.height,
        },
        body: { top, left: 0, width, height: usableHeight - top },
        footer,
      };
    }
  }
  return { body: { top: 0, left: 0, width, height: usableHeight }, footer };
}
