import { KnownBlock } from '@slack/types';
import got from 'got';
import { getEnvVar } from './env';
import { formatNumber } from './numbers';

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
          type: 'mrkdwn',
          text: `*${checkin.user}* - ${checkin.userRating} (${formatNumber(
            checkin.avgRating
          )} avg)\n*${checkin.beer}* (${checkin.brewery})`,
        },
      ],
      accessory: {
        type: 'button',
        text: {
          type: 'plain_text',
          text: ':untappd:',
          emoji: true,
        },
        url: `https://untappd.com/c/${checkin._checkinId}`,
      },
    };
    blocks.push(block);
  });

  blocks.push({
    type: 'divider',
  });

  return blocks;
}

function generateUntappdRankingsSlackBlocks(args: {
  header: string;
  rankings: Array<{
    name: string;
    count: number;
  }>;
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

  args.rankings.forEach((ranking) => {
    const block: KnownBlock = {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `${ranking.count} - ${ranking.name}`,
        },
      ],
    };
    blocks.push(block);
  });

  blocks.push({
    type: 'divider',
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

  if (data.data.beerLovers?.length) {
    blocks.push(
      ...generateUntappdRankingsSlackBlocks({
        header: ':beers: *Beer Lovers* :beers:',
        rankings: data.data.beerLovers.map((beerLover) => ({
          name: `*${beerLover.user}* (${formatNumber(
            beerLover.avgUserRating
          )} avg)`,
          count: beerLover.count,
        })),
      })
    );
  }

  if (data.data.popularBreweries?.length) {
    blocks.push(
      ...generateUntappdRankingsSlackBlocks({
        header: ':monkey_brew: *Popular Breweries* :monkey_brew:',
        rankings: data.data.popularBreweries.map((popularBrewery) => ({
          name: `*${popularBrewery.brewery}* (${formatNumber(
            popularBrewery.avgUserRating
          )} avg)`,
          count: popularBrewery.count,
        })),
      })
    );
  }

  if (data.data.popularBeers?.length) {
    blocks.push(
      ...generateUntappdRankingsSlackBlocks({
        header: ':beer: *Popular Beers* :beer:',
        rankings: data.data.popularBeers.map((popularBeer) => ({
          name: `*${popularBeer.beer}* (${formatNumber(
            popularBeer.avgUserRating
          )} avg)\n${popularBeer.brewery}`,
          count: popularBeer.count,
        })),
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
