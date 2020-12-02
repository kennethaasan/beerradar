import * as lambda from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';
import path from 'path';
import { getEnvVar } from './env';

export class BeerRadarStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new lambda.Function(this, 'untappd-weekend-report', {
      code: lambda.Code.fromAsset(
        path.join(__dirname, '../../untappd-weekend-report')
      ),
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'build/index.handler',
      timeout: cdk.Duration.seconds(60),
      memorySize: 128,
      environment: {
        NODE_ENV: 'production',
        SLACK_WEBHOOK_URL: getEnvVar('SLACK_WEBHOOK_URL'),
        BEERRADAR_BACKEND: getEnvVar('BEERRADAR_BACKEND'),
      },
    });
  }
}
