import { KnownBlock } from '@slack/types';
import { IncomingWebhook } from '@slack/webhook';
import { getEnvVar } from './env';

const SLACK_WEBHOOK_URL = getEnvVar('SLACK_WEBHOOK_URL');

const webhook = new IncomingWebhook(SLACK_WEBHOOK_URL, {
  icon_emoji: ':beerradar:',
});

export function sendSlackMessage(args: { blocks: KnownBlock[] }) {
  return webhook.send({
    attachments: [
      {
        pretext: 'Untappd Weekend Report',
        blocks: args.blocks,
      },
    ],
  });
}
