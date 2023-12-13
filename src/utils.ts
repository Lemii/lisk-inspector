import { nodeList } from './config';
import { getLatestSnapshot } from './db';
import { textSync } from 'figlet';
import { nodeIsHealthy } from './services';

export const snapshotIsNeeded = (date: string) => {
  const snapshot = getLatestSnapshot();
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
