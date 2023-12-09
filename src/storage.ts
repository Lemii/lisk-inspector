import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { baseOutputPath, outputFileName, snapshotsFileName } from './config';
import { Snapshot, ValidatorStatsMap } from './types';

/**
 * TODO: Change JSON storage to SqLite3
 */

export const getStoredValidatorStatsMap = (): ValidatorStatsMap => {
  const path = `${baseOutputPath}/${outputFileName}`;

  if (!existsSync(path)) {
    return {};
  }

  const data = readFileSync(path, 'utf8');

  return JSON.parse(data) as unknown as ValidatorStatsMap;
};

export const saveValidatorStatsMap = (data: ValidatorStatsMap) => {
  const path = `${baseOutputPath}/${outputFileName}`;

  if (existsSync(path)) {
    copyFileSync(path, path + '.bak');
  }

  writeFileSync(path, JSON.stringify(data));
};

export const getSnapshots = (): Snapshot[] => {
  const path = `${baseOutputPath}/${snapshotsFileName}`;

  if (!existsSync(path)) {
    return [];
  }

  const data = readFileSync(path, 'utf8');

  return JSON.parse(data) as unknown as Snapshot[];
};

export const saveSnapshots = (data: Snapshot[]) => {
  const path = `${baseOutputPath}/${snapshotsFileName}`;

  if (existsSync(path)) {
    copyFileSync(path, path + '.bak');
  }

  writeFileSync(path, JSON.stringify(data));
};
