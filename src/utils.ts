import { nodeList } from './config';
import { getAllValidatorUsernames, getLatestSnapshotDate } from './db';
import { textSync } from 'figlet';
import { nodeIsHealthy } from './services';
import { ValidatorApiData } from './types';

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
