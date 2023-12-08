import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { baseOutputPath, eventsToTrack, outputFileName } from './config';
import { ValidatorData, ValidatorStats, ValidatorStatsMap } from './types';
import { textSync } from 'figlet';

export const getStoredValidatorStatsMap = (): ValidatorStatsMap => {
  const path = `${baseOutputPath}/${outputFileName}`;

  if (!existsSync(path)) {
    return {};
  }

  const data = readFileSync(path, 'utf8');

  return JSON.parse(data) as unknown as ValidatorStatsMap;
};

export const saveValidatorStatsMap = (data: ValidatorStatsMap) => {
  const path = `${baseOutputPath}/${outputFileName}`;

  if (existsSync(path)) {
    copyFileSync(path, path + '.bak');
  }

  writeFileSync(path, JSON.stringify(data, null, 4));
};

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

export const logSplashScreen = () => {
  console.log(textSync('Lisk Inspector'));
  console.log(` by lemii`);
  console.log(' ');
};
