import { Stack, StackProps } from "aws-cdk-lib"
import { Construct } from "constructs"
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export class TsLambdaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    new NodejsFunction(this, 'helloWorldFn', {
      runtime: Runtime.NODEJS_14_X,
      entry: `${__dirname}/../lambda-fns/hello-world/index.ts`,
      handler: 'myFunction',
      memorySize: 128,
      architecture: Architecture.ARM_64,
      bundling: {
        minify: true,
        // tsconfig: `${__dirname}/../lambda-fns/hello-world/tsconfig.json` // if you want to override defaults
      }
    })
  }
}
