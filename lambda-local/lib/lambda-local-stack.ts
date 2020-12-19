import { Code, Function, Runtime } from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';

export class LambdaLocalStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const oneFn = new Function(this, 'oneFn', {
      runtime: Runtime.NODEJS_12_X,
      code: Code.fromAsset(`${__dirname}/../lambda-fns/one/deployment.zip`),
      handler: 'index.handler'
    })
  }
}
