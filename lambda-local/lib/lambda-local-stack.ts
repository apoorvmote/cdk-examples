import { Stack, StackProps, CfnOutput, RemovalPolicy, Duration } from "aws-cdk-lib"
import { Construct } from "constructs"
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';

export class LambdaLocalStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const oneFn = new Function(this, 'oneFn', {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset(`${__dirname}/../lambda-fns/one/deployment.zip`),
      handler: 'index.handler'
    })
  }
}
