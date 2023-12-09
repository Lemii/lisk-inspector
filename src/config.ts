import appRootPath from 'app-root-path';

export const baseOutputPath = appRootPath.toString() + '/output';

export const outputFileName = process.env.OUTPUT_FILENAME ?? 'validator-data.json';

export const snapshotsFileName = process.env.SNAPSHOTS_FILENAME ?? 'snapshots.json';

export const baseNodeUrl = process.env.LS_NODE ?? 'https://service.lisk.com/api/v3';

export const eventsToTrack = ['rank', 'totalStake', 'selfStake', 'commission', 'consecutiveMissedBlocks'] as const;

export const updateInterval = 60 * 1000;
