import { sendSlackMessage } from './slack';

export const handler = async () => {
  console.log('untappd-weekend-report - sending');

  await sendSlackMessage();

  console.log('untappd-weekend-report - sent');
};
