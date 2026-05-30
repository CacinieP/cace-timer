import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { TimeKeeperData } from './types';

// ============ Data Management ============
let DATA_FILE = path.join(os.homedir(), '.cace-timer.json');

export function getDataFile(): string {
  return DATA_FILE;
}

export function setDataFile(p: string): void {
  DATA_FILE = p;
}

export function loadData(): TimeKeeperData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch {
    // Ignore errors, return default
  }
  return { current: null, history: [] };
}

export function saveData(data: TimeKeeperData): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    throw new Error(`Failed to save data to ${DATA_FILE}: ${(e as Error).message}`);
  }

  // Sync to external path if set
  if (data.syncPath && fs.existsSync(path.dirname(data.syncPath))) {
    try {
      fs.writeFileSync(data.syncPath, JSON.stringify(data, null, 2));
    } catch (e) {
      process.stderr.write(`Warning: sync to ${data.syncPath} failed: ${(e as Error).message}\n`);
    }
  }
}
