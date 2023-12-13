import { getApi, logger } from './lib';
import { ValidatorApiResponse, ValidatorApiData, IndexStatusAPIResponse } from './types';

export const nodeIsHealthy = async (node: string) => {
  try {
    const url = `${node}/index/status`;

    logger.debug(`Fetching index status from ${url}`);

    const status = await getApi()
      .get<IndexStatusAPIResponse>(url)
      .then(res => res.data);

    if (status.data.isIndexingInProgress) {
      logger.debug(`Node is indexing and not unavailable..`);
      return false;
    }

    return true;
  } catch (err) {
    logger.debug(`Node is unreachable..`);
    return false;
  }
};

export const fetchValidators = async (node: string): Promise<ValidatorApiData[]> =>
  new Promise(async resolve => {
    const output: ValidatorApiData[] = [];
    const selfStakeThreshold = BigInt('100000000000'); // limit results to validators with >= 1000 LSK self-stake
    const pageSize = 103;

    let offset = 0;
    let stopped = false;

    const fetchData = async (offset: number) => {
      if (stopped) {
        resolve(output);
        return;
      }

      const url = `${node}/pos/validators?limit=${pageSize}&sort=rank:asc&offset=${offset}`;

      logger.debug(`Fetching validator data from ${url}`);

      const validatorData = await getApi()
        .get<ValidatorApiResponse>(url)
        .then(res => res.data);

      for (const validator of validatorData.data) {
        if (BigInt(validator.selfStake) < selfStakeThreshold) {
          stopped = true;
          break;
        }

        output.push(validator);
      }

      offset += pageSize;
      fetchData(offset);
    };

    fetchData(offset);
  });
