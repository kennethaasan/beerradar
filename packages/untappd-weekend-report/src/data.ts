import { KnownBlock } from '@slack/types';
import got from 'got';
import { getEnvVar } from './env';

const BEERRADAR_BACKEND = getEnvVar('BEERRADAR_BACKEND');

interface UntappdChecking {
  _checkinId: number;
  _beerId: number;
  _userId: string;
  user: string;
  brewery: string;
  beer: string;
  userRating: number;
  avgRating: number;
}

interface UntappdWeekendReport {
  data?: {
    happies?: UntappdChecking[];
    disappointies?: UntappdChecking[];
    connoisseurs?: UntappdChecking[];
    beerLovers?: Array<{
      count: number;
      user: string;
      avgUserRating: number;
    }>;
    popularBreweries?: Array<{
      count: number;
      brewery: string;
      avgUserRating: number;
    }>;
    popularBeers?: Array<{
      count: number;
      brewery: string;
      beer: string;
      avgUserRating: number;
    }>;
  };
  meta?: {
    _daysBack: string;
    _errors: Array<unknown>;
    _users: {
      [userName: string]: string;
    };
  };
}

async function getUntappdWeekendReportData() {
  const url = `${BEERRADAR_BACKEND}/SrBeerStats.php?d=3`;

  console.log('fetching', url);

  const data = await got.get<UntappdWeekendReport | undefined>(url, {
    timeout: 50000,
    responseType: 'json',
  });

  console.log('fetched data', url, data.body);

  return data.body;
}

export async function getUntappdWeekendReport(): Promise<
  KnownBlock[] | undefined
> {
  const data = await getUntappdWeekendReportData();

  if (!data?.data) {
    return undefined;
  }

  console.log('generating Slack blocks');

  const blocks: KnownBlock[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: 'Happies',
      },
    },
  ];

  data.data.happies?.map((happy) => {
    const block: KnownBlock = {
      type: 'section',
      fields: [
        {
          type: 'plain_text',
          text: happy.user,
        },
        {
          type: 'plain_text',
          text: happy._userId,
        },
        {
          type: 'plain_text',
          text: `Beer: ${happy.beer}`,
        },
        {
          type: 'plain_text',
          text: `Brewery: ${happy.brewery}`,
        },
        {
          type: 'plain_text',
          text: `Rating: ${happy.userRating}`,
        },
        {
          type: 'plain_text',
          text: `Average Rating: ${happy.avgRating}`,
        },
      ],
    };

    blocks.push(block);
    blocks.push({
      type: 'divider',
    });
  });

  console.log('Slack blocks generated');

  return blocks;
}
