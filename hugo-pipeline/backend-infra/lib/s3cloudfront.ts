import { Stack, StackProps, CfnOutput, RemovalPolicy, Duration } from "aws-cdk-lib"
import { Construct } from "constructs"
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { AllowedMethods, CachePolicy, CloudFrontWebDistribution, Distribution, HttpVersion, OriginAccessIdentity, OriginProtocolPolicy, PriceClass, SecurityPolicyProtocol, ViewerCertificate, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { HttpOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Repository } from 'aws-cdk-lib/aws-codecommit';
import { AnyPrincipal, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { HttpsRedirect } from 'aws-cdk-lib/aws-route53-patterns';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { bucketRefererSecret, bucketWebsiteUrl, hostedZoneId, websiteCertArn, website_domain } from './variables';

export class S3CloudfrontStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    ///////////////////////////////
    // Part 2
    const bucket = new Bucket(this, 'websiteBucket', {
        removalPolicy: RemovalPolicy.DESTROY,
        bucketName: website_domain,
        autoDeleteObjects: true,
        websiteIndexDocument: 'index.html',
        websiteErrorDocument: '404.html'
    })
    
    bucket.addToResourcePolicy(new PolicyStatement({
        effect: Effect.ALLOW,
        principals: [new AnyPrincipal()],
        actions: ['s3:GetObject'],
        resources: ['arn:aws:s3:::example.com/*'],
        conditions: {
            "StringLike":{"aws:Referer":[bucketRefererSecret]}
          }
    }))

    new CfnOutput(this, 'websiteBucketArn', {
        value: bucket.bucketArn
    })

    new CfnOutput(this, 'websiteBucketUrl', {
        value: bucket.bucketWebsiteUrl
    })
    ///////////////////////////////

    ///////////////////////////////
    // Part 3
    const certificate = Certificate.fromCertificateArn(this, 'websiteCert', websiteCertArn)
    
    const cachePolicy = new CachePolicy(this, 'examplePolicy', {
        defaultTtl: Duration.hours(24),
        minTtl: Duration.hours(24),
        maxTtl: Duration.hours(24),
        enableAcceptEncodingBrotli: true,
        enableAcceptEncodingGzip: true
    })

    const distribution = new Distribution(this, 'exampleDistribution', {
        defaultBehavior: {
            origin: new HttpOrigin(bucketWebsiteUrl, {
                protocolPolicy: OriginProtocolPolicy.HTTP_ONLY,
                customHeaders: {
                    'Referer': bucketRefererSecret
                }
            }),
            allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
            cachePolicy,
            compress: true,
            viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS
        },
        domainNames: [website_domain],
        certificate,
        minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2019,
        enableIpv6: true,
        enabled: true,
        httpVersion: HttpVersion.HTTP2,
        priceClass: PriceClass.PRICE_CLASS_ALL
    })
    ///////////////////////////////

    ///////////////////////////////
    // Part 4
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
    // Part 5
    new HttpsRedirect(this, 'wwwToNonWww', {
        recordNames: ['www.example.com'],
        targetDomain: website_domain,
        zone:hostedZone
    })

    const repo = new Repository(this, 'hugoSourceCode', {
        repositoryName: 'example',
        description: `hugo repo for ${website_domain}`
    })

    new CfnOutput(this, 'hugoRepoArn', {
        value: repo.repositoryArn
    })
    ///////////////////////////////
  }
}
