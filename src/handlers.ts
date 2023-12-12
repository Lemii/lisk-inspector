import { eventsToTrack } from './config';
import * as db from './db';
import { SnapshotData, ValidatorApiData, ValidatorData } from './types';

export const processValidators = (validators: ValidatorApiData[], timestamp: number) => {
  for (const validatorApiData of validators) {
    const validatorData = db.getValidatorByName(validatorApiData.name);

    if (validatorData) {
      /** statistics that should be included in changeEvents field */
      for (const key of eventsToTrack) {
        const oldValue = validatorData[key];
        const newValue = validatorApiData[key];

        if (newValue !== oldValue) {
          // @ts-ignore
          validatorData[key] = newValue;
          validatorData.changeEvents?.push({ timestamp, type: key, oldValue, newValue });

          /** Unique handling of consecutiveMissedBlocks to keep track of total missed blocks */
          if (key === 'consecutiveMissedBlocks' && (newValue as number) > 0) {
            const diff = (newValue as number) - (oldValue as number);
            validatorData.totalMissedBlocks += diff;
          }
        }
      }

      /** statistics that should still be tracked, but not included in changeEvents */
      validatorData.generatedBlocks = validatorApiData.generatedBlocks;

      db.updateValidator(validatorData, validatorApiData.name);
    } else {
      /** create new entry in db */
      const validatorData: ValidatorData = {
        rank: validatorApiData.rank,
        totalMissedBlocks: 0,
        totalStake: validatorApiData.totalStake,
        selfStake: validatorApiData.selfStake,
        commission: validatorApiData.commission,
        generatedBlocks: validatorApiData.generatedBlocks,
        consecutiveMissedBlocks: validatorApiData.consecutiveMissedBlocks,
        changeEvents: [],
      };

      db.insertValidator(validatorApiData.name, validatorData);
    }
  }
};

export const processSnapshot = (date: string, timestamp: number) => {
  const validators = db.getAllValidators();

  const snapshot: SnapshotData = {};

  validators.forEach(({ username, data }) => {
    const validatorStats: ValidatorData = JSON.parse(data);
    snapshot[username] = validatorStats;

    // Empty events array to save space
    delete snapshot[username]?.changeEvents;
  });

  db.insertSnapshot(timestamp, date, snapshot);
};
