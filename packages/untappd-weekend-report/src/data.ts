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

function generateUntappdCheckinsSlackBlocks(args: {
  header: string;
  checkins: UntappdChecking[];
}) {
  const blocks: KnownBlock[] = [
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: args.header,
        },
      ],
    },
  ];

  args.checkins.forEach((checkin) => {
    const block: KnownBlock = {
      type: 'section',
      fields: [
        {
          type: 'plain_text',
          text: checkin.user,
        },
        {
          type: 'plain_text',
          text: checkin._userId,
        },
        {
          type: 'plain_text',
          text: `Beer: ${checkin.beer}`,
        },
        {
          type: 'plain_text',
          text: `Brewery: ${checkin.brewery}`,
        },
        {
          type: 'plain_text',
          text: `Rating: ${checkin.userRating}`,
        },
        {
          type: 'plain_text',
          text: `Average Rating: ${checkin.avgRating}`,
        },
      ],
    };
    blocks.push(block);
    blocks.push({
      type: 'divider',
    });
  });

  return blocks;
}

export async function getUntappdWeekendReport(): Promise<
  KnownBlock[] | undefined
> {
  const data = await getUntappdWeekendReportData();

  if (!data?.data) {
    return undefined;
  }

  console.log('generating Slack blocks');

  const blocks: KnownBlock[] = [];

  if (data.data.happies?.length) {
    blocks.push(
      ...generateUntappdCheckinsSlackBlocks({
        header: ':happycarsten: *Happies* :happycarsten:',
        checkins: data.data.happies,
      })
    );
  }

  if (data.data.disappointies?.length) {
    blocks.push(
      ...generateUntappdCheckinsSlackBlocks({
        header: ':sad_cat: *Disappointies* :sad_cat:',
        checkins: data.data.disappointies,
      })
    );
  }

  if (data.data.connoisseurs?.length) {
    blocks.push(
      ...generateUntappdCheckinsSlackBlocks({
        header: ':thinking_face: *Connoisseurs* :thinking_face:',
        checkins: data.data.connoisseurs,
      })
    );
  }

  console.log('Slack blocks generated');

  if (!blocks.length) {
    return undefined;
  }

  return [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: 'Untappd Weekend Report',
      },
    },
    ...blocks,
  ];
}
