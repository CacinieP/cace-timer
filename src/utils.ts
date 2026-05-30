// ============ Utilities ============
import { getLocale } from './i18n';

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const locale = getLocale() === 'zh' ? 'zh-CN' : 'en-US';
  return date.toLocaleString(locale, {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const locale = getLocale() === 'zh' ? 'zh-CN' : 'en-US';
  return date.toLocaleDateString(locale);
}
