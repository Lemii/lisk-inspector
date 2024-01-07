import { nodeList } from './config';
import { getAllValidatorUsernames, getLatestSnapshotDate } from './db';
import { textSync } from 'figlet';
import { nodeIsHealthy } from './services';
import { ValidatorApiData } from './types';
import { logger } from './lib';
import { AxiosError } from 'axios';

export const snapshotIsNeeded = (date: string) => {
  const snapshot = getLatestSnapshotDate();
  return !snapshot || snapshot.human !== date;
};

export const logSplashScreen = () => {
  console.log(textSync('Lisk Inspector'));
  console.log(` by lemii`);
  console.log(' ');
};

export const getLsNode = async () => {
  let output = '';

  for await (const node of nodeList) {
    if (await nodeIsHealthy(node)) {
      output = node;
      break;
    }
  }

  if (!output) {
    return null;
  }

  return output;
};

export const getMissingUsers = (validators: ValidatorApiData[]) => {
  const fetchedValidatorNames = validators.map(validator => validator.name);
  const validatorNamesInDb = getAllValidatorUsernames();

  return validatorNamesInDb.filter(name => !fetchedValidatorNames.includes(name));
};

export const handleError = (error: unknown) => {
  let message: any = 'Something went wrong';

  if (typeof error === 'string') {
    message = error;
  } else if (error instanceof AxiosError) {
    message = error.response?.data || error.message;
  } else if (error instanceof Error) {
    message = error.message;
  } else {
    message = error;
  }

  logger.error(message);
};

export const shuffleArray = (array: any[]) => {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
};
