import { IncomingWebhook } from '@slack/webhook';
import { getEnvVar } from './env';

const SLACK_WEBHOOK_URL = getEnvVar('SLACK_WEBHOOK_URL');

const webhook = new IncomingWebhook(SLACK_WEBHOOK_URL, {
  icon_emoji: ':beerradar:',
});

export function sendSlackMessage() {
  return webhook.send({
    attachments: [
      {
        pretext: 'Untappd Weekend Report',
        title: 'Untappd Weekend Report',
      },
    ],
  });
}
