import { paint } from '../terminal';
import * as fs from 'fs';
import * as path from 'path';
import { loadData, saveData } from '../data';
import { showCaceSmall } from '../mascot';
import { t } from '../i18n';

export function cmdSync(filePath: string): void {
  if (!filePath || filePath.trim() === '') {
    console.log(paint(`${t('cmd.sync.emptyPath')}`, 'yellow'));
    return;
  }

  const data = loadData();
  const absPath = path.resolve(filePath);
  const parentDir = path.dirname(absPath);

  if (!fs.existsSync(parentDir)) {
    console.log(paint(`${t('cmd.sync.dirNotExist', { dir: parentDir })}`, 'yellow'));
    return;
  }

  data.syncPath = absPath;
  saveData(data);

  console.log();
  showCaceSmall(t('cmd.sync.configured'));
  console.log();
  console.log(`  ${t('cmd.sync.syncPath', { path: absPath })}`);
  console.log(`  ${t('cmd.sync.syncTip')}`);
  console.log();
}
