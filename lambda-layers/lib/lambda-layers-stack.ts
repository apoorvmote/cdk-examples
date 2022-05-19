import { Stack, StackProps, CfnOutput } from "aws-cdk-lib"
import { Construct } from "constructs"
import { Architecture, Code, Function, LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda';
import { account, layerVersionArn } from './variables';

export class LambdaLayersStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const layer = new LayerVersion(this, 'uuidLayer', {
      code: Code.fromAsset(`${__dirname}/../lambda-fns/layer/deployment.zip`),
      compatibleRuntimes: [ Runtime.NODEJS_16_X],
      compatibleArchitectures: [Architecture.ARM_64],
      description: 'uuid package and discount for product'
    })

    layer.addPermission('layerPermission', {
      accountId: account
    })

    new CfnOutput(this, 'layerVersionArn', {
      value: layer.layerVersionArn
    })

    const latestLayer = LayerVersion.fromLayerVersionAttributes(this, 'latestLayer', {
      compatibleRuntimes: [Runtime.NODEJS_16_X],
      layerVersionArn
    })

    new Function(this, 'oneFn', { 
      runtime: Runtime.NODEJS_16_X,
      code: Code.fromAsset(`${__dirname}/../lambda-fns/one/deployment.zip`),
      handler: 'index.handler',
      architecture: Architecture.ARM_64,
      layers: [latestLayer]
    })

    new Function(this, 'twoFn', { 
      runtime: Runtime.NODEJS_16_X,
      code: Code.fromAsset(`${__dirname}/../lambda-fns/two/deployment.zip`),
      handler: 'index.handler',
      architecture: Architecture.ARM_64,
      layers: [latestLayer]
    })
  }
}
