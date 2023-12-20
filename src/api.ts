import express from 'express';
import { getAllValidators, getLatestSnapshot, getOldestSnapshot, getSnapshotByDate, getSnapshots } from './db';
import { logger } from './lib';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { corsOptions } from './config';

export const app = express();

/** API configuration */
app.use(cors(corsOptions));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});
app.use(apiLimiter);

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} request`);
  next();
});

/** API routes */
app.get('/', (req, res) => {
  res.sendStatus(200);
});

app.get('/validators', (_req, res) => {
  const validators = getAllValidators();
  res.send(validators);
});

app.get('/validators/missed', (_req, res) => {
  const validators = getAllValidators();

  const withMissedBlocks = validators
    .filter(validator => validator.data.totalMissedBlocks)
    .sort((a, b) => (b.data.totalMissedBlocks > a.data.totalMissedBlocks ? 1 : -1));

  res.send(withMissedBlocks);
});

app.get('/validators/punished', (_req, res) => {
  const validators = getAllValidators();

  const withPunishments = validators
    .filter(validator => validator.data.totalPunishments)
    .sort((a, b) => (b.data.totalPunishments > a.data.totalPunishments ? 1 : -1));

  res.send(withPunishments);
});

app.get('/snapshot', (_req, res) => {
  const snapshot = getLatestSnapshot();

  if (!snapshot) {
    res.sendStatus(204); // no content
    return;
  }

  res.send(snapshot);
});

app.get('/snapshot/:date', (req, res) => {
  const { date } = req.params;
  const { fallback } = req.query;

  let snapshot = getSnapshotByDate(date);

  if (!snapshot && fallback) {
    snapshot = getOldestSnapshot();
  }

  if (!snapshot) {
    res.sendStatus(204); // no content
    return;
  }

  res.send(snapshot);
});

app.get('/historical/rank/:amount', (req, res) => {
  const { amount } = req.params;
  const snapshots = getSnapshots(amount ? Number(amount) : undefined);

  if (!snapshots) {
    res.sendStatus(204); // no content
    return;
  }

  const filtered = snapshots.map(snapshot => {
    const data: { username: string; rank: number }[] = Object.entries(snapshot.data).map(
      ([username, validatorData]) => ({ username, rank: validatorData.rank }),
    );

    return { date: snapshot.human, data };
  });

  res.send(filtered);
});
