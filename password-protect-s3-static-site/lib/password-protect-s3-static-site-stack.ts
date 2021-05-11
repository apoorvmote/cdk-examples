import { DnsValidatedCertificate } from '@aws-cdk/aws-certificatemanager';
import { AllowedMethods, CacheHeaderBehavior, CachePolicy, Distribution, experimental, HttpVersion, LambdaEdgeEventType, OriginProtocolPolicy, PriceClass, SecurityPolicyProtocol, ViewerProtocolPolicy } from '@aws-cdk/aws-cloudfront';
import { HttpOrigin } from '@aws-cdk/aws-cloudfront-origins';
import { AnyPrincipal, Effect, PolicyStatement } from '@aws-cdk/aws-iam';
import { Code, Runtime } from '@aws-cdk/aws-lambda';
import { ARecord, HostedZone, RecordTarget } from '@aws-cdk/aws-route53';
import { CloudFrontTarget } from '@aws-cdk/aws-route53-targets';
import { Bucket } from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';
import { CfnOutput, Duration, RemovalPolicy } from '@aws-cdk/core';
import { hostedZoneId, website_domain, preview_domain, previewSecret, previewBucketWebsiteUrl } from './variables';

export class PasswordProtectS3StaticSiteStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    ///////////////////////////////
    // Part 1
    const hostedZone = HostedZone.fromHostedZoneAttributes(this, 'HostedZoneWithAttr', {
      hostedZoneId: hostedZoneId,
      zoneName: website_domain
    })
    
    const previewCert = new DnsValidatedCertificate(this, 'previewSSL', {
      domainName: preview_domain,
      hostedZone
    })
    
    const previewBucket = new Bucket(this, 'previewBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      bucketName: preview_domain,
      autoDeleteObjects: true,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: '404.html'
    })

    new CfnOutput(this, 'previewBucketWebsiteUrl', {
      value: previewBucket.bucketWebsiteUrl
    })
    ///////////////////////////////
    
    ///////////////////////////////
    // Part 2
    previewBucket.addToResourcePolicy(new PolicyStatement({
      sid: 'allow request from cloudfront to s3 website',
      effect: Effect.ALLOW,
      principals: [new AnyPrincipal()],
      actions: ['s3:GetObject'],
      resources: [`${previewBucket.bucketArn}/*`],
      conditions: {
        "StringLike": {
          "aws:Referer": [previewSecret]
        }
      }
    }))

    const previewCachePolicy = new CachePolicy(this, 'previewCachePolicy', {
      defaultTtl: Duration.minutes(30),
      minTtl: Duration.minutes(25),
      maxTtl: Duration.minutes(35),
      enableAcceptEncodingBrotli: true,
      enableAcceptEncodingGzip: true,
      headerBehavior: CacheHeaderBehavior.allowList('authorization')
    })

    const edgeAuth = new experimental.EdgeFunction(this, 'edgeAuthFn', {
      runtime: Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: Code.fromAsset(`${__dirname}/../lambda-fns/basic-auth/deployment.zip`),
      memorySize: 128
    })
    ///////////////////////////////
    
    ///////////////////////////////
    // Part 3
    const previewDistribution = new Distribution(this, 'previewDistribution', {
      defaultBehavior: {
        origin: new HttpOrigin(previewBucketWebsiteUrl, {
          protocolPolicy: OriginProtocolPolicy.HTTP_ONLY,
          customHeaders: {
            'Referer': previewSecret
          }
        }),
        edgeLambdas: [{
          functionVersion: edgeAuth.currentVersion,
          eventType: LambdaEdgeEventType.VIEWER_REQUEST
        }],
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachePolicy: previewCachePolicy,
        compress: true,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS
      },
      domainNames: [preview_domain],
      certificate: previewCert,
      minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2019,
      httpVersion: HttpVersion.HTTP2,
      priceClass: PriceClass.PRICE_CLASS_ALL
    })
    ///////////////////////////////

    ///////////////////////////////
    // Part 4
    new ARecord(this, 'aliasForPreview', {
      target: RecordTarget.fromAlias(new CloudFrontTarget(previewDistribution)),
      zone: hostedZone,
      recordName: preview_domain
    })
    ///////////////////////////////

  }
}
