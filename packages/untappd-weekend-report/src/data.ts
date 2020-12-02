import got from 'got';
import { getEnvVar } from './env';

const BEERRADAR_BACKEND = getEnvVar('BEERRADAR_BACKEND');

export async function getUntappdWeekendReport() {
  console.log('BEERRADAR_BACKEND', BEERRADAR_BACKEND);

  const data = await got.get(`${BEERRADAR_BACKEND}/SrBeerStats.php?d=3`, {
    timeout: 50000,
    responseType: 'json',
  });

  console.log(data);

  return data.body;
}
