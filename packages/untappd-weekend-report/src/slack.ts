import { IncomingWebhook } from '@slack/webhook';
import { getEnvVar } from './env';

const SLACK_WEBHOOK_URL = getEnvVar('SLACK_WEBHOOK_URL');

const webhook = new IncomingWebhook(SLACK_WEBHOOK_URL, {
  icon_emoji: ':beerradar:',
});

export function sendSlackMessage(message: unknown) {
  return webhook.send({
    attachments: [
      {
        pretext: 'Untappd Weekend Report',
        text: JSON.stringify(message, null, 2),
      },
    ],
  });
}
