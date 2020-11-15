import { DnsValidatedCertificate } from '@aws-cdk/aws-certificatemanager';
import { HostedZone } from '@aws-cdk/aws-route53';
import * as cdk from '@aws-cdk/core';
import { CfnOutput } from '@aws-cdk/core';
import { hostedZoneId, website_domain } from './variables';

export class CertificateStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    ///////////////////////////////
    // Part 1
    const hostedZone = HostedZone.fromHostedZoneAttributes(this, 'HostedZoneWithAttrs', {
        hostedZoneId,
        zoneName: website_domain
    })

    const websiteCert = new DnsValidatedCertificate(this, 'WebsiteSSL', {
        domainName: website_domain,
        hostedZone
    })

    new CfnOutput(this, 'WebsiteCertArn', {
        value: websiteCert.certificateArn
    })
    ///////////////////////////////
  }
}
