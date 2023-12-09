import { eventsToTrack } from './config';
import { Snapshot, ValidatorData, ValidatorStats, ValidatorStatsMap } from './types';
import { textSync } from 'figlet';

export const processValidators = (
  validators: ValidatorData[],
  currentValidatorStatsMap: ValidatorStatsMap,
  timestamp: number,
) => {
  const updatedValidatorStatsMap = structuredClone(currentValidatorStatsMap);

  for (const validator of validators) {
    const currentValidatorStats = currentValidatorStatsMap[validator.name];

    if (currentValidatorStats) {
      const updatedValidatorStats = structuredClone(currentValidatorStats);

      for (const key of eventsToTrack) {
        const oldValue = currentValidatorStats[key];
        const newValue = validator[key];

        if (newValue !== oldValue) {
          // @ts-ignore
          updatedValidatorStats[key] = newValue;
          updatedValidatorStats.changeEvents.push({ timestamp, type: key, oldValue, newValue });

          if (key === 'consecutiveMissedBlocks' && (newValue as number) > 0) {
            const diff = (newValue as number) - (oldValue as number);
            updatedValidatorStats.totalMissedBlocks += diff;
          }
        }
      }

      updatedValidatorStatsMap[validator.name] = updatedValidatorStats;
    } else {
      const stats: ValidatorStats = {
        rank: validator.rank,
        totalMissedBlocks: 0,
        totalStake: validator.totalStake,
        selfStake: validator.selfStake,
        commission: validator.commission,
        generatedBlocks: validator.generatedBlocks,
        consecutiveMissedBlocks: validator.consecutiveMissedBlocks,
        changeEvents: [],
      };

      updatedValidatorStatsMap[validator.name] = stats;
    }
  }

  return updatedValidatorStatsMap;
};

export const snapshotIsNeeded = (currentSnapshots: Snapshot[], date: string) => {
  const mostRecentSnapshot = currentSnapshots[currentSnapshots.length - 1];

  return !mostRecentSnapshot || mostRecentSnapshot.meta.human !== date;
};

export const processSnapshot = (
  currentSnapshots: Snapshot[],
  currentValidatorStatsMap: ValidatorStatsMap,
  date: string,
  timestamp: number,
) => {
  const updatedSnapshots = structuredClone(currentSnapshots);

  const snapshot: Snapshot = {
    meta: { timestamp, human: date },
    data: currentValidatorStatsMap,
  };

  // Empty events array to save space
  Object.entries(snapshot.data).forEach(([username, data]) => {
    snapshot.data[username] = data;
    data.changeEvents = [];
  });

  updatedSnapshots.push(snapshot);

  return updatedSnapshots;
};

export const logSplashScreen = () => {
  console.log(textSync('Lisk Inspector'));
  console.log(` by lemii`);
  console.log(' ');
};
