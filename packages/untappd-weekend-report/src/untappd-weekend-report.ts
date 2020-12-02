import { getUntappdWeekendReport } from './data';
import { sendSlackMessage } from './slack';

export const handler = async () => {
  console.log('untappd-weekend-report - creating');

  const blocks = await getUntappdWeekendReport();

  if (!blocks?.length) {
    console.log('untappd-weekend-report - no data');
    return;
  }

  await sendSlackMessage({
    blocks,
  });

  console.log('untappd-weekend-report - sent');
};
