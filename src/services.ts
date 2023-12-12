import { primaryNodeUrl } from './config';
import { getApi, logger } from './lib';
import { ValidatorApiResponse, ValidatorApiData } from './types';

export const fetchValidators = async (): Promise<ValidatorApiData[]> =>
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

      const url = `${primaryNodeUrl}/pos/validators?limit=${pageSize}&sort=rank:asc&offset=${offset}`;

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
