import * as cdk from '@aws-cdk/core';
import { BeerRadarStack } from './cdk-stack';
import { getEnvVar } from './env';

export function deploy() {
  const app = new cdk.App();

  new BeerRadarStack(app, 'BeerRadarStack', {
    env: {
      account: getEnvVar('AWS_ACCOUNT_ID'),
      region: 'us-east-1',
    },
  });
}
