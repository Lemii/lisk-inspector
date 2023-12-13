import express from 'express';
import { getAllValidators } from './db';
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
