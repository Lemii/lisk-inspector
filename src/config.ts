import appRootPath from 'app-root-path';

export const databasePath = appRootPath.toString() + '/database/' + process.env.DB_FILE_NAME ?? 'data.db';

export const primaryNodeUrl = process.env.LS_NODE ?? 'https://service.lisk.com/api/v3';

export const eventsToTrack = [
  'rank',
  'totalStake',
  'selfStake',
  'commission',
  'consecutiveMissedBlocks',
  'generatedBlocks',
] as const;

export const updateInterval = process.env.NODE_ENV === 'development' ? 10 * 1000 : 60 * 1000;

export const logLevel = process.env.NODE_ENV === 'development' ? 'debug' : 'info';
