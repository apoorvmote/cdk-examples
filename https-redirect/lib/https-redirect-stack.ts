import { Stack, StackProps } from "aws-cdk-lib"
import { Construct } from "constructs"
import { HostedZone } from 'aws-cdk-lib/aws-route53';
import { HttpsRedirect } from 'aws-cdk-lib/aws-route53-patterns';

export class HttpsRedirectStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
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
