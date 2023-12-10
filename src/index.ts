import dotenv from 'dotenv';
dotenv.config();

import { logSplashScreen, processSnapshot, processValidators, snapshotIsNeeded } from './utils';
import { getSnapshots, getStoredValidatorStatsMap, saveSnapshots, saveValidatorStatsMap } from './storage';
import { fetchValidators } from './services';
import { logger } from './lib';
import { updateInterval } from './config';
import { format } from 'date-fns';

logSplashScreen();

const generateData = async (date: Date) => {
  logger.info('Starting validator data process..');
  const timestamp = date.getTime();

  logger.info('Loading stored validator statistics..');
  const validatorStatsMap = getStoredValidatorStatsMap();

  logger.info('Fetching live validator data..');
  const validators = await fetchValidators();

  logger.info(`Processing data of ${validators.length} validators..`);
  const updatedValidatorStatsMap = processValidators(validators, validatorStatsMap, timestamp);

  logger.info('Saving updated validator statistics..');
  saveValidatorStatsMap(updatedValidatorStatsMap);

  logger.info('Done! ✅\n');
};

const generateSnapshot = async (date: Date) => {
  logger.info('Starting snapshot process..');
  const formattedDate = format(date, 'yyyy-MM-dd');

  logger.info('Loading stored snapshots..');
  const snapshots = getSnapshots();

  if (!snapshotIsNeeded(snapshots, formattedDate)) {
    logger.info('Snapshot not needed, goodbye 👋\n');
    return;
  }

  logger.info('Loading stored validator statistics..');
  const validatorStatsMap = getStoredValidatorStatsMap();

  logger.info(`Creating new snapshot..`);
  const updatedSnapshots = processSnapshot(snapshots, validatorStatsMap, formattedDate, date.getTime());

  logger.info('Saving updated snapshots..');
  saveSnapshots(updatedSnapshots);

  logger.info('Done! ✅\n');
};

setInterval(async () => {
  const date = new Date();

  await generateData(date);
  await generateSnapshot(date);
}, updateInterval);
