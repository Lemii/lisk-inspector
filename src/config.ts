import appRootPath from 'app-root-path';

export const databasePath = appRootPath.toString() + '/database/' + process.env.DB_FILE_NAME ?? 'data.db';

export const nodeList = [
  'https://mainnet-service.lemii.dev/api/v3',
  'https://service.lisk.com/api/v3',
  'https://lisk-mainnet-service.punkrock.me/api/v3',
  'https://mainnet-service.liskscan.com/api/v3',
];

export const eventsToTrack = ['rank', 'totalStake', 'selfStake', 'commission', 'consecutiveMissedBlocks'] as const;

export const updateInterval = process.env.NODE_ENV === 'development' ? 10 * 1000 : 60 * 1000;

export const logLevel = process.env.NODE_ENV === 'development' ? 'debug' : 'info';

export const apiPort = process.env.API_PORT ? Number(process.env.API_PORT) : 4000;

export const corsOptions = {
  origin: ['https://lemii.dev', 'https://www.lemii.dev', 'http://localhost:3000'],
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
