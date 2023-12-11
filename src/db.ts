import Database from 'better-sqlite3';
import { databasePath } from './config';

const db = new Database(databasePath);

db.pragma('journal_mode = WAL');

export default db;
