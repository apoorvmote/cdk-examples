import { HostedZone } from '@aws-cdk/aws-route53';
import { HttpsRedirect } from '@aws-cdk/aws-route53-patterns';
import * as cdk from '@aws-cdk/core';

export class HttpsRedirectStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const hostedZone = HostedZone.fromHostedZoneAttributes(this, 'HostedZoneWithAttrs', {
      hostedZoneId: 'myZoneId',
      zoneName: 'example.com'
    })

    new HttpsRedirect(this, 'wwwToNonWww', {
      recordNames: ['www.example.com'],
      targetDomain: 'example.com',
      zone: hostedZone
    })
  }
}
