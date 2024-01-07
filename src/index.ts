import dotenv from 'dotenv';
dotenv.config();

import { getLsNode, getMissingUsers, logSplashScreen, shuffleArray, snapshotIsNeeded } from './utils';
import { fetchMissingValidators, fetchNetworkStatistics, fetchValidators } from './services';
import { logger } from './lib';
import { apiPort, updateInterval } from './config';
import { format } from 'date-fns';
import { processSnapshot, processValidators } from './handlers';
import { setupDb } from './db';
import { app } from './api';

const start = () => {
  logSplashScreen();
  setupDb();

  app.listen(apiPort, () => {
    logger.info(`Express server running on port ${apiPort}`);
  });

  setInterval(async () => {
    const date = new Date();

    const success = await generateInspectorData(date);

    if (!success) {
      logger.info('Previous process failed. Skipping snapshot.. 👋\n');
      return;
    }

    generateSnapshot(date);
  }, updateInterval);
};

const generateInspectorData = async (date: Date) => {
  logger.info('Starting validator data process..');
  const timestamp = date.getTime();

  logger.info('Verifying node health..');
  const node = await getLsNode();

  if (!node) {
    logger.info('No healthy nodes available 💀 Stopping..');
    return false;
  }

  logger.info('Fetching live validator data..');
  const validators = await fetchValidators(node);

  if (!validators.length) {
    logger.error('No validators fetched. Stopping process early..');
    return false;
  }

  /**
   * Get the names of validators who didn't show up in the initial fetchValidators query,
   * but who are present in the database.
   *
   * Possible scenarios: validator completely removed self-stake and therefore is
   * not fetched by default any more (because it filters out self-stake <= low amount).
   * The tool still needs to be able to track the changes in statistics,
   * so the data for these validator is explicitly requested.
   */
  const missingUsers = getMissingUsers(validators);

  if (missingUsers.length) {
    const validatorsToCheck = shuffleArray(missingUsers);
    const missingValidators = await fetchMissingValidators(node, validatorsToCheck.slice(-10));
    missingValidators.forEach(validator => validators.push(validator));
  }

  logger.info(`Processing data of ${validators.length} validators..`);
  processValidators(validators, timestamp);

  logger.info(`Updating TVL..`);
  const networkStatistics = await fetchNetworkStatistics(node);

  totalLocked = networkStatistics.data.totalLocked.find(item => item.tokenID === '0000000000000000')?.amount ?? '0';
  totalStaked = networkStatistics.data.totalStaked.amount ?? '0';
  totalSelfStaked = networkStatistics.data.totalSelfStaked.amount ?? '0';

  logger.info('Done! ✅\n');

  return true;
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

// Quick & dirty, because why not at this point 😪
export let totalLocked = '0';
export let totalStaked = '0';
export let totalSelfStaked = '0';
