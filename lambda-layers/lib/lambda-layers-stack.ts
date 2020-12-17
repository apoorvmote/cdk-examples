import { Code, Function, LayerVersion, Runtime } from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';
import { CfnOutput } from '@aws-cdk/core';
import { account, layerVersionArn } from './variables';

export class LambdaLayersStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const layer = new LayerVersion(this, 'uuidLayer', {
      code: Code.fromAsset(`${__dirname}/../lambda-fns/layer/deployment.zip`),
      compatibleRuntimes: [ Runtime.NODEJS_12_X],
      description: 'uuid package and discount for product'
    })

    layer.addPermission('layerPermission', {
      accountId: account
    })

    new CfnOutput(this, 'layerVersionArn', {
      value: layer.layerVersionArn
    })

    const latestLayer = LayerVersion.fromLayerVersionAttributes(this, 'latestLayer', {
      compatibleRuntimes: [Runtime.NODEJS_12_X],
      layerVersionArn
    })

    new Function(this, 'oneFn', { 
      runtime: Runtime.NODEJS_12_X,
      code: Code.fromAsset(`${__dirname}/../lambda-fns/one/deployment.zip`),
      handler: 'index.handler',
      layers: [latestLayer]
    })

    new Function(this, 'twoFn', { 
      runtime: Runtime.NODEJS_12_X,
      code: Code.fromAsset(`${__dirname}/../lambda-fns/two/deployment.zip`),
      handler: 'index.handler',
      layers: [latestLayer]
    })
  }
}
