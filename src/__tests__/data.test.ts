import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { loadData, saveData, setDataFile, getDataFile } from '../data';

describe('data', () => {
  const originalDataFile = getDataFile();
  const tmpDir = os.tmpdir();
  let tmpFile: string;

  beforeEach(() => {
    tmpFile = path.join(tmpDir, `.cace-timer-test-${Date.now()}.json`);
    setDataFile(tmpFile);
  });

  afterEach(() => {
    if (fs.existsSync(tmpFile)) {
      fs.unlinkSync(tmpFile);
    }
    setDataFile(originalDataFile);
  });

  describe('loadData', () => {
    it('returns default when file does not exist', () => {
      const data = loadData();
      expect(data.current).toBeNull();
      expect(data.history).toEqual([]);
    });

    it('returns default when file has corrupt JSON', () => {
      fs.writeFileSync(tmpFile, 'not json');
      const data = loadData();
      expect(data.current).toBeNull();
      expect(data.history).toEqual([]);
    });

    it('loads valid data', () => {
      const payload = { current: null, history: [{ id: 'abc', task: 'test' }] };
      fs.writeFileSync(tmpFile, JSON.stringify(payload));
      const data = loadData();
      expect(data.history.length).toBe(1);
      expect(data.history[0].task).toBe('test');
    });
  });

  describe('saveData', () => {
    it('writes data to file', () => {
      const data = { current: null, history: [] };
      saveData(data);
      const written = JSON.parse(fs.readFileSync(tmpFile, 'utf-8'));
      expect(written.history).toEqual([]);
    });

    it('throws on invalid path', () => {
      setDataFile(path.join(tmpDir, 'nonexistent-dir-xyz', 'data.json'));
      expect(() => saveData({ current: null, history: [] })).toThrow();
      setDataFile(tmpFile);
    });
  });
});
