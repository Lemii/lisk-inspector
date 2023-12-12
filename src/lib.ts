import axios from 'axios';
import winston, { format } from 'winston';
import { logLevel } from './config';

export const getApi = () => axios;

const { combine, timestamp, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

export const logger = winston.createLogger({
  format: combine(timestamp(), myFormat),
  transports: [new winston.transports.Console({ level: logLevel })],
});
