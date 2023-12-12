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

export const processSnapshot = (date: string, timestamp: number) => {
  const validators = db.prepare('SELECT username, data FROM validators').all() as {
    username: string;
    data: string;
  }[];

  const snapshot: SnapshotInDb = {};

  validators.forEach(({ username, data }) => {
    const validatorStats: ValidatorStats = JSON.parse(data);
    snapshot[username] = validatorStats;

    // Empty events array to save space
    delete snapshot[username]?.changeEvents;
  });

  db.prepare('INSERT INTO snapshots (timestamp, human, data) VALUES (?, ?, ?)').run(
    timestamp,
    date,
    JSON.stringify(snapshot),
  );
};

export const logSplashScreen = () => {
  console.log(textSync('Lisk Inspector'));
  console.log(` by lemii`);
  console.log(' ');
};
