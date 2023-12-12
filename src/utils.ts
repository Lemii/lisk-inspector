import { getLatestSnapshot } from './db';
import { textSync } from 'figlet';

export const snapshotIsNeeded = (date: string) => {
  const snapshot = getLatestSnapshot();
  return !snapshot || snapshot.human !== date;
};

export const logSplashScreen = () => {
  console.log(textSync('Lisk Inspector'));
  console.log(` by lemii`);
  console.log(' ');
};
