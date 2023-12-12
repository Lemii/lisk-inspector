import { eventsToTrack } from './config';
import db from './db';
import { Snapshot, SnapshotInDb, ValidatorData, ValidatorStats, ValidatorStatsMap } from './types';
import { textSync } from 'figlet';

export const snapshotIsNeeded = (date: string) => {
  const recentSnapshot = db.prepare('SELECT human FROM snapshots ORDER BY id DESC LIMIT 1;').get() as {
    human: string;
  };

  return !recentSnapshot || recentSnapshot.human !== date;
};

export const logSplashScreen = () => {
  console.log(textSync('Lisk Inspector'));
  console.log(` by lemii`);
  console.log(' ');
};
