import { KnownBlock } from '@slack/types';
import { WebClient } from '@slack/web-api';
import { getEnvVar } from './env';

const SLACK_TOKEN = getEnvVar('SLACK_TOKEN');
const SLACK_CHANNEL = getEnvVar('SLACK_CHANNEL');

const slackClient = new WebClient(SLACK_TOKEN);

export function sendSlackMessage(args: { blocks: KnownBlock[] }) {
  return slackClient.chat.postMessage({
    channel: SLACK_CHANNEL,
    icon_emoji: ':beerradar:',
    text: '',
    blocks: args.blocks,
  });
}
