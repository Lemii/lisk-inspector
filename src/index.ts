import dotenv from 'dotenv';
dotenv.config();

import { getLsNode, getMissingUsers, logSplashScreen, snapshotIsNeeded } from './utils';
import { fetchMissingValidators, fetchValidators } from './services';
import { logger } from './lib';
import { apiPort, updateInterval } from './config';
import { format } from 'date-fns';
import { processSnapshot, processValidators } from './handlers';
import { setupDb } from './db';
import './api';
import { app } from './api';

const start = () => {
  logSplashScreen();
  setupDb();

  app.listen(apiPort, () => {
    logger.info(`Express server running on port ${apiPort}`);
  });

  setInterval(async () => {
    const date = new Date();

    await generateData(date);
    generateSnapshot(date);
  }, updateInterval);
};

const generateData = async (date: Date) => {
  logger.info('Starting validator data process..');
  const timestamp = date.getTime();

  logger.info('Verifying node health..');
  const node = await getLsNode();

  if (!node) {
    logger.info('No healthy nodes available 💀 Stopping..');
    return;
  }

  logger.info('Fetching live validator data..');
  const validators = await fetchValidators(node);

  /**
   * Get the names of validators who didn't show up in the initial fetchValidators query,
   * but who are present in the database.
   *
   * Possible scenarios: validator completely removed self-stake and therefore is
   * not fetched by default any more (because it filters out self-stake <= low amount).
   * The tool still needs to be able to track the changes in statistics,
   * so the data for these validator is explicitly requested.
   */
  const validatorsToCheck = getMissingUsers(validators);

  if (validatorsToCheck.length) {
    const missingValidators = await fetchMissingValidators(node, validatorsToCheck);
    missingValidators.forEach(validator => validators.push(validator));
  }

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
