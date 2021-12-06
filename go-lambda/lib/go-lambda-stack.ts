import { Stack, StackProps } from "aws-cdk-lib"
import { Construct } from "constructs"
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';

export class GoLambdaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    new Function(this, 'goLambda', {
      runtime: Runtime.GO_1_X,
      handler: 'main',
      code: Code.fromAsset(`${__dirname}/../lambda-fns/hello-world/`, {
        bundling: {
          image: Runtime.GO_1_X.bundlingImage,
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
