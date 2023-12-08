import dotenv from 'dotenv';
dotenv.config();

import { getStoredValidatorStatsMap, logSplashScreen, processValidators, saveValidatorStatsMap } from './utils';
import { fetchValidators } from './services';
import { logger } from './lib';
import { updateInterval } from './config';

logSplashScreen();

const main = async () => {
  logger.info('Starting update..');
  const timestamp = Date.now();

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

setInterval(() => main(), updateInterval);

main();
