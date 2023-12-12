import Database from 'better-sqlite3';
import { databasePath } from './config';
import { logger } from './lib';
import { SnapshotData, ValidatorData } from './types';

const db = new Database(databasePath, { verbose: logger.debug });

db.pragma('journal_mode = WAL');

export const initializeDatabase = () => {
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
    data TEXT NOT NULL
);`;

  db.exec(createSnapshotsTable);
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

  return validators;
};

export const insertValidator = (name: string, data: ValidatorData) => {
  const query = 'INSERT INTO validators (username, data) VALUES (?, ?)';
  db.prepare(query).run(name, JSON.stringify(data));
};

export const updateValidator = (data: ValidatorData, name: string) => {
  const query = 'UPDATE validators SET data = ? WHERE username = ?';
  db.prepare(query).run(JSON.stringify(data), name);
};

export const insertSnapshot = (timestamp: number, date: string, snapshot: SnapshotData) => {
  const query = 'INSERT INTO snapshots (timestamp, human, data) VALUES (?, ?, ?)';
  db.prepare(query).run(timestamp, date, JSON.stringify(snapshot));
};

export const getLatestSnapshot = () => {
  const query = 'SELECT human FROM snapshots ORDER BY id DESC LIMIT 1;';
  const snapshot = db.prepare(query).get() as { human: string } | undefined;

  return snapshot;
};
