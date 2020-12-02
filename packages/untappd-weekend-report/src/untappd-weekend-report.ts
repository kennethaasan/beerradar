import { getUntappdWeekendReport } from './data';
import { sendSlackMessage } from './slack';

export const handler = async () => {
  console.log('untappd-weekend-report - sending');

  const uwr = await getUntappdWeekendReport();

  await sendSlackMessage(uwr);

  console.log('untappd-weekend-report - sent');
};
