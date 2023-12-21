import Database from 'better-sqlite3';
import { databasePath } from './config';
import { logger } from './lib';
import { SnapshotData, SnapshotParsed, SnapshotRaw, ValidatorData } from './types';

const db = new Database(databasePath, { verbose: logger.silly });

db.pragma('journal_mode = WAL');

export const setupDb = () => {
  logger.info('Setting up database..');

  logger.debug(`Creating tables (if applicable)..`);
  const createValidatorsTable = `CREATE TABLE IF NOT EXISTS validators (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    data TEXT NOT NULL
);`;

  db.exec(createValidatorsTable);

  const createSnapshotsTable = `CREATE TABLE IF NOT EXISTS snapshots (
    id INTEGER PRIMARY KEY,
    timestamp INTEGER NOT NULL UNIQUE,
    human TEXT NOT NULL UNIQUE,
    totalLocked TEXT NOT NULL DEFAULT "0",
    totalStaked TEXT NOT NULL DEFAULT "0",
    totalSelfStaked TEXT NOT NULL DEFAULT "0",
    data TEXT NOT NULL
);`;

  db.exec(createSnapshotsTable);

  logger.debug('Configuring db close on process exit..');
  process.on('exit', () => {
    logger.debug('Closing database connection..');
    db.close();
  });
  process.on('SIGHUP', () => process.exit(128 + 1));
  process.on('SIGINT', () => process.exit(128 + 2));
  process.on('SIGTERM', () => process.exit(128 + 15));

  logger.info('Done! ✅\n');
};

export const getValidatorByName = (name: string) => {
  const query = 'SELECT data FROM validators WHERE username = ?';
  const dbEntry = db.prepare(query).get(name) as { data: string } | undefined;

  if (!dbEntry?.data) {
    return undefined;
  }

  const data: ValidatorData = JSON.parse(dbEntry.data);

  return data;
};

export const getAllValidators = () => {
  const query = 'SELECT username, data FROM validators';
  const validators = db.prepare(query).all() as { username: string; data: string }[];

  const parsed: { username: string; data: ValidatorData }[] = validators.map(({ username, data }) => ({
    username,
    data: JSON.parse(data),
  }));

  return parsed;
};

export const getAllValidatorUsernames = () => {
  const query = 'SELECT username FROM validators';
  const queryResult = db.prepare(query).all() as { username: string }[];

  return queryResult.map(res => res.username);
};

export const insertValidator = (name: string, data: ValidatorData) => {
  const query = 'INSERT INTO validators (username, data) VALUES (?, ?)';
  db.prepare(query).run(name, JSON.stringify(data));
};

export const updateValidator = (data: ValidatorData, name: string) => {
  const query = 'UPDATE validators SET data = ? WHERE username = ?';
  db.prepare(query).run(JSON.stringify(data), name);
};

export const insertSnapshot = (
  timestamp: number,
  date: string,
  totalLocked: string,
  totalStaked: string,
  totalSelfStaked: string,
  snapshot: SnapshotData,
) => {
  const query =
    'INSERT INTO snapshots (timestamp, human, totalLocked, totalStaked, totalSelfStaked, data) VALUES (?, ?, ?, ?, ?, ?)';
  db.prepare(query).run(timestamp, date, totalLocked, totalStaked, totalSelfStaked, JSON.stringify(snapshot));
};

export const getLatestSnapshotDate = () => {
  const query = 'SELECT human FROM snapshots ORDER BY id DESC LIMIT 1;';
  const snapshot = db.prepare(query).get() as { human: string } | undefined;

  return snapshot;
};

export const getLatestSnapshot = () => {
  const query =
    'SELECT timestamp, human, totalLocked, totalStaked, totalSelfStaked, data FROM snapshots ORDER BY id DESC LIMIT 1';
  const snapshot = db.prepare(query).get() as SnapshotRaw | undefined;

  if (!snapshot) {
    return undefined;
  }

  const parsed: SnapshotParsed = { ...snapshot, data: JSON.parse(snapshot.data) };

  return parsed;
};

export const getOldestSnapshot = () => {
  const query = 'SELECT timestamp, human, totalLocked, totalStaked, totalSelfStaked,data FROM snapshots LIMIT 1';
  const snapshot = db.prepare(query).get() as SnapshotRaw | undefined;

  if (!snapshot) {
    return undefined;
  }

  const parsed: SnapshotParsed = { ...snapshot, data: JSON.parse(snapshot.data) };

  return parsed;
};

export const getSnapshotByDate = (date: string) => {
  const query =
    'SELECT timestamp, human, totalLocked, totalStaked, totalSelfStaked, data FROM snapshots WHERE human = ?';
  const snapshot = db.prepare(query).get(date) as SnapshotRaw | undefined;

  if (!snapshot) {
    return undefined;
  }

  const parsed: SnapshotParsed = { ...snapshot, data: JSON.parse(snapshot.data) };

  return parsed;
};

export const getSnapshots = (amount = 14) => {
  const query =
    'SELECT timestamp, human, totalLocked, totalStaked, totalSelfStaked, data FROM snapshots ORDER BY id DESC LIMIT ?';
  const snapshots = db.prepare(query).all(amount) as SnapshotRaw[];

  const parsedSnapshots: SnapshotParsed[] = snapshots.map(snapshot => ({
    ...snapshot,
    data: JSON.parse(snapshot.data),
  }));

  return parsedSnapshots;
};
