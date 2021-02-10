import { Runtime } from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import * as cdk from '@aws-cdk/core';

export class TsLambdaStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    new NodejsFunction(this, 'helloWorldFn', {
      runtime: Runtime.NODEJS_14_X,
      entry: `${__dirname}/../lambda-fns/hello-world/index.ts`,
      handler: 'myFunction',
      memorySize: 128,
      bundling: {
        minify: true,
        // tsconfig: `${__dirname}/../lambda-fns/hello-world/tsconfig.json` // if you want to override defaults
      }
    })
  }
}
