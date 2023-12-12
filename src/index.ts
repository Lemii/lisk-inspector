import dotenv from 'dotenv';
dotenv.config();

import { logSplashScreen, processSnapshot, snapshotIsNeeded } from './utils';
import { fetchValidators } from './services';
import { logger } from './lib';
import { updateInterval } from './config';
import { format } from 'date-fns';
import { processValidators } from './handlers';

const start = () => {
  logSplashScreen();

  setInterval(async () => {
    const date = new Date();

    await generateData(date);
    await generateSnapshot(date);
  }, updateInterval);
};

const generateData = async (date: Date) => {
  logger.info('Starting validator data process..');
  const timestamp = date.getTime();

  logger.info('Fetching live validator data..');
  const validators = await fetchValidators();

  logger.info(`Processing data of ${validators.length} validators..`);
  processValidators(validators, timestamp);

  logger.info('Done! ✅\n');
};

const generateSnapshot = async (date: Date) => {
  logger.info('Starting snapshot process..');
  const formattedDate = format(date, 'yyyy-MM-dd');

  if (!snapshotIsNeeded(formattedDate)) {
    logger.info('Snapshot not needed, goodbye 👋\n');
    return;
  }

  logger.info(`Creating new snapshot..`);
  processSnapshot(formattedDate, date.getTime());

  logger.info('Done! ✅\n');
};

start();
