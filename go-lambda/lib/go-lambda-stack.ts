import { Code, Function, Runtime } from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';

export class GoLambdaStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    new Function(this, 'goLambda', {
      runtime: Runtime.GO_1_X,
      handler: 'main',
      code: Code.fromAsset(`${__dirname}/../lambda-fns/hello-world/`, {
        bundling: {
          image: Runtime.GO_1_X.bundlingDockerImage,
          user: 'root',
          command: [
            'bash', '-c', [
              'cd /asset-input',
              'go build -o main main.go',
              'mv /asset-input/main /asset-output/'
            ].join(' && ')
          ]
        }
      })
    })    
  }
}
