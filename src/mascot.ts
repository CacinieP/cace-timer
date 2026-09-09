import { t } from './i18n';
import { getDisplay, fitText } from './terminal';
import { getFrame, plainFrame, renderFrame } from './mascot/frames';
import { Expression } from './mascot/assets/mint';

export type CaceMood = 'normal' | 'happy' | 'sleepy' | 'focused' | 'celebrating';
const MOOD_MAP: Record<CaceMood, Expression> = {
  normal: 'little_smile',
  happy: 'happy',
  sleepy: 'asleep',
  focused: 'little_smile',
  celebrating: 'excited',
};

export const CACE_SMALL = plainFrame(getFrame({ size: 'compact' }));
export const CACE_HAPPY = plainFrame(getFrame({ expression: 'happy' }));
export const CACE_SLEEPY = plainFrame(getFrame({ expression: 'asleep' }));
export const CACE_FOCUSED = plainFrame(getFrame());
export const CACE_CELEBRATING = plainFrame(getFrame({ expression: 'excited' }));

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return t('greeting.lateNight');
  if (hour < 12) return t('greeting.morning');
  if (hour < 18) return t('greeting.afternoon');
  return t('greeting.evening');
}

// One-shot commands return promptly. Continuous motion belongs to a TUI screen
// with a lifecycle, not a clear/sleep loop inside task mutations.
export async function showCaceAnimation(message = ''): Promise<void> {
  showCaceSmall(message);
}

export function showCaceSmall(status = '', mood: CaceMood = 'normal'): void {
  const display = getDisplay();
  const columns = process.stdout.columns ?? 80;
  const size = columns >= 22 && (process.stdout.rows ?? 24) >= 18 ? 'compact' : 'tiny';
  const frame = getFrame({ expression: MOOD_MAP[mood], size, ascii: display.ascii });
  if (columns >= frame.width) console.log(renderFrame(frame, display));
  if (status) console.log(fitText(status, columns));
}
