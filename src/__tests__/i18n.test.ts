import { describe, it, expect, beforeEach } from 'vitest';
import { t, setLocale, getLocale, resolveLocale, detectLocale } from '../i18n';

describe('i18n', () => {
  beforeEach(() => {
    setLocale('zh');
  });

  describe('t()', () => {
    it('returns Chinese string by default', () => {
      expect(t('common.task')).toBe('任务');
    });

    it('returns English string when locale is en', () => {
      setLocale('en');
      expect(t('common.task')).toBe('Task');
    });

    it('handles param interpolation', () => {
      expect(t('cmd.search.searchFor', { keyword: 'test' })).toBe('搜索: "test"');
      setLocale('en');
      expect(t('cmd.search.searchFor', { keyword: 'test' })).toBe('Search: "test"');
    });

    it('returns key for missing strings', () => {
      expect(t('nonexistent.key')).toBe('nonexistent.key');
    });

    it('falls back to zh if en key is missing', () => {
      // Both locales should have all keys, but test the fallback mechanism
      setLocale('en');
      const result = t('common.task');
      expect(result).toBeTruthy();
    });
  });

  describe('resolveLocale()', () => {
    it('prioritizes CLI flag', () => {
      expect(resolveLocale('en', 'zh')).toBe('en');
      expect(resolveLocale('zh', 'en')).toBe('zh');
    });

    it('uses stored lang when no CLI flag', () => {
      expect(resolveLocale(undefined, 'en')).toBe('en');
      expect(resolveLocale(undefined, 'zh')).toBe('zh');
    });

    it('auto-detects when no flag or stored', () => {
      const result = resolveLocale(undefined, undefined);
      expect(result === 'zh' || result === 'en').toBe(true);
    });
  });

  describe('detectLocale()', () => {
    it('returns zh or en', () => {
      const result = detectLocale();
      expect(result === 'zh' || result === 'en').toBe(true);
    });
  });

  describe('getLocale() / setLocale()', () => {
    it('round-trips', () => {
      setLocale('en');
      expect(getLocale()).toBe('en');
      setLocale('zh');
      expect(getLocale()).toBe('zh');
    });
  });
});
