import { Stack, StackProps, CfnOutput } from "aws-cdk-lib"
import { Construct } from "constructs"
import { DnsValidatedCertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { HostedZone } from 'aws-cdk-lib/aws-route53';
import { hostedZoneId, website_domain } from './variables';

export class CertificateStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
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
