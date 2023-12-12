import Database from 'better-sqlite3';
import { databasePath } from './config';
import { logger } from './lib';

const db = new Database(databasePath, { verbose: logger.debug });

db.pragma('journal_mode = WAL');

const initializeDatabase = () => {
  const createValidatorsTable = `CREATE TABLE IF NOT EXISTS validators (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    data TEXT NOT NULL
);`;

  db.exec(createValidatorsTable);

  const createSnapshotsTable = `CREATE TABLE IF NOT EXISTS snapshots (
    id INTEGER PRIMARY KEY,
    timestamp INTEGER NOT NULL,
    human TEXT NOT NULL,
    data TEXT NOT NULL
);`;

  db.exec(createSnapshotsTable);
};

initializeDatabase();

export const getAllValidatorByName = (name: string) => {
  const dbEntry = db.prepare('SELECT data FROM validators WHERE username = ?').get(name);

  console.log(dbEntry);
};

getAllValidatorByName('panzer');

export default db;
