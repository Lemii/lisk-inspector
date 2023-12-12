import { eventsToTrack } from './config';
import db from './db';
import { Snapshot, ValidatorData, ValidatorStats, ValidatorStatsMap } from './types';

export const processValidators = (validators: ValidatorData[], timestamp: number) => {
  for (const validator of validators) {
    const dbEntry = db.prepare('SELECT data FROM validators WHERE username = ?').get(validator.name) as {
      data?: string;
    };

    if (dbEntry?.data) {
      const validatorStats: ValidatorStats = JSON.parse(dbEntry.data);

      for (const key of eventsToTrack) {
        const oldValue = validatorStats[key];
        const newValue = validator[key];

        if (newValue !== oldValue) {
          // @ts-ignore
          validatorStats[key] = newValue;
          validatorStats.changeEvents?.push({ timestamp, type: key, oldValue, newValue });

          if (key === 'consecutiveMissedBlocks' && (newValue as number) > 0) {
            const diff = (newValue as number) - (oldValue as number);
            validatorStats.totalMissedBlocks += diff;
          }
        }
      }

      db.prepare('UPDATE validators SET data = ? WHERE username = ?').run(
        JSON.stringify(validatorStats),
        validator.name,
      );
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

      db.prepare('INSERT INTO validators (username, data) VALUES (?, ?)').run(validator.name, JSON.stringify(stats));
    }
  }
};
