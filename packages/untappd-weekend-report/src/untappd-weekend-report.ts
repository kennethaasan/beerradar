import { getEnvVar } from './env';

const SLACK_WEBHOOK_URL = getEnvVar('SLACK_WEBHOOK_URL');

export const handler = () => {
  console.log('untappd-weekend-report', SLACK_WEBHOOK_URL);
};
