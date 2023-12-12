import { eventsToTrack } from './config';

export type ValidatorStats = {
  rank: number;
  totalMissedBlocks: number;
  totalStake: string;
  selfStake: string;
  commission: number;
  generatedBlocks: number;
  consecutiveMissedBlocks: number;
  changeEvents?: ChangeEvent[];
};

export type EventsToTrack = (typeof eventsToTrack)[number];

export type ChangeEvent = {
  timestamp: number;
  type: EventsToTrack;
  oldValue: number | string;
  newValue: number | string;
};

export type ValidatorStatsMap = { [key: string]: ValidatorStats };

export type Snapshot = {
  meta: {
    timestamp: number;
    human: string;
  };
  data: Omit<ValidatorStatsMap, 'changeEvents'>;
};

export type SnapshotInDb = Omit<ValidatorStatsMap, 'changeEvents'>;

/**
 * Lisk Service API responses
 */
export type ValidatorApiResponse = {
  meta: {
    count: number;
    offset: number;
    total: number;
  };
  data: ValidatorData[];
};

export type ValidatorData = {
  name: string;
  totalStake: string;
  selfStake: string;
  validatorWeight: string;
  address: string;
  publicKey: null | string;
  lastGeneratedHeight: number;
  status: 'active' | 'banned' | 'standby';
  isBanned: boolean;
  reportMisbehaviorHeights: number[];
  punishmentPeriods: {
    start: number;
    end: number;
  }[];
  consecutiveMissedBlocks: number;
  commission: number;
  lastCommissionIncreaseHeight: number;
  sharingCoefficients: {
    tokenID: string;
    coefficient: string;
  }[];
  rank: number;
  generatedBlocks: number;
  totalCommission: string;
  totalSelfStakeRewards: string;
  earnedRewards: string;
};
