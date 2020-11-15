import { Certificate } from '@aws-cdk/aws-certificatemanager';
import { CloudFrontWebDistribution, OriginAccessIdentity, PriceClass, SecurityPolicyProtocol, ViewerCertificate } from '@aws-cdk/aws-cloudfront';
import { Repository } from '@aws-cdk/aws-codecommit';
import { ARecord, HostedZone, RecordTarget } from '@aws-cdk/aws-route53';
import { HttpsRedirect } from '@aws-cdk/aws-route53-patterns';
import { CloudFrontTarget } from '@aws-cdk/aws-route53-targets';
import { Bucket } from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';
import { CfnOutput, Duration, RemovalPolicy } from '@aws-cdk/core';
import { hostedZoneId, websiteCertArn, website_domain } from './variables';

export class S3CloudfrontStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    ///////////////////////////////
    // Part 2
    const bucket = new Bucket(this, 'websiteBucket', {
        removalPolicy: RemovalPolicy.DESTROY,
        bucketName: website_domain
    })
    
    new CfnOutput(this, 'websiteBucketArn', {
        value: bucket.bucketArn
    })
    ///////////////////////////////

    ///////////////////////////////
    // Part 3
    const originAccessIdentity = new OriginAccessIdentity(this, 'originAccessIdentity', {
        comment: 'Give cloudfront unrestricted read only access to website bucket'
    })
    
    bucket.grantRead(originAccessIdentity)
    ///////////////////////////////

    ///////////////////////////////
    // Part 4
    const certificate = Certificate.fromCertificateArn(this, 'websiteCert', websiteCertArn)
    
    const distribution = new CloudFrontWebDistribution(this, 'cloudfrontWebDistribution', {
        priceClass: PriceClass.PRICE_CLASS_ALL,
        originConfigs: [{
            s3OriginSource: {
                s3BucketSource: bucket,
                originAccessIdentity
            },
            behaviors: [{
                isDefaultBehavior: true,
                defaultTtl: Duration.hours(1),
                forwardedValues: {
                    cookies: {
                        forward: 'all'
                    },
                    queryString: true
                }
            }]
        }],
        viewerCertificate: ViewerCertificate.fromAcmCertificate(certificate, {
            aliases: [website_domain],
            securityPolicy: SecurityPolicyProtocol.TLS_V1_2_2019
        })
    })
    ///////////////////////////////

    ///////////////////////////////
    // Part 5
    const hostedZone = HostedZone.fromHostedZoneAttributes(this, 'hostedZoneWithAttrs', {
        hostedZoneId,
        zoneName: website_domain
    })
    
    new ARecord(this, 'aliasForCloudfront', {
        target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
        zone: hostedZone,
        recordName: website_domain
    })
    ///////////////////////////////

    ///////////////////////////////
    // Part 6
    new HttpsRedirect(this, 'wwwToNonWww', {
        recordNames: ['www.example.com'],
        targetDomain: website_domain,
        zone:hostedZone
    })

    const repo = new Repository(this, 'reactSourceCode', {
        repositoryName: 'example',
        description: `react repo for ${website_domain}`
    })

    new CfnOutput(this, 'reactRepoArn', {
        value: repo.repositoryArn
    })
    ///////////////////////////////
  }
}
