import express from 'express';
import { getAllValidators, getLatestSnapshot } from './db';
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

  const withMissedBlocks = validators.filter(validator => validator.data.totalMissedBlocks);

  res.send(withMissedBlocks);
});

app.get('/snapshot/latest', (_req, res) => {
  const snapshot = getLatestSnapshot();

  if (!snapshot) {
    res.sendStatus(204); // no content
  }

  res.send(snapshot);
});
