import { eventsToTrack } from './config';

export type ValidatorData = {
  rank: number;
  totalMissedBlocks: number;
  totalPunishments: number;
  totalStake: string;
  selfStake: string;
  commission: number;
  generatedBlocks: number;
  consecutiveMissedBlocks: number;
  changeEvents?: ChangeEvent[]; // optional to be able to delete it in snapshot without compiler errors
};

export type EventsToTrack = (typeof eventsToTrack)[number];

export type ChangeEvent = {
  timestamp: number;
  type: EventsToTrack;
  oldValue: number | string;
  newValue: number | string;
};

export type SnapshotData = { [key: string]: ValidatorData };

export type SnapShot<T> = {
  timestamp: number;
  human: string;
  totalLocked: string;
  totalStaked: string;
  totalSelfStaked: string;
  data: T;
};

export type SnapshotRaw = SnapShot<string>;

export type SnapshotParsed = SnapShot<SnapshotData>;

export type Statistics = {
  totalLocked: string;
  totalStaked: string;
  totalSelfStaked: string;
};

/**
 * Lisk Service API responses
 */
export type ValidatorApiResponse = {
  meta: {
    count: number;
    offset: number;
    total: number;
  };
  data: ValidatorApiData[];
};

export type ValidatorApiData = {
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

export interface IndexStatusAPIResponse {
  data: {
    genesisHeight: number;
    lastBlockHeight: number;
    lastIndexedBlockHeight: number;
    chainLength: number;
    numBlocksIndexed: number;
    percentageIndexed: number;
    isIndexingInProgress: boolean;
  };
  meta: {
    lastUpdate: number;
  };
}

export interface NetworkStatisticsAPIResponse {
  data: {
    basic: {
      totalPeers: number;
      connectedPeers: number;
      disconnectedPeers: number;
    };
    height: {
      [key: string]: number;
    };
    networkVersion: {
      [key: string]: number;
    };
    totalLocked: {
      tokenID: string;
      amount: string;
    }[];
    totalStaked: {
      tokenID: string;
      amount: string;
    };
    totalSelfStaked: {
      tokenID: string;
      amount: string;
    };
  };
  meta: {};
}
