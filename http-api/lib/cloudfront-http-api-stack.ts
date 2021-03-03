import { DnsValidatedCertificate } from '@aws-cdk/aws-certificatemanager';
import { HttpApi, HttpMethod } from '@aws-cdk/aws-apigatewayv2';
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { Code, Function, Runtime } from '@aws-cdk/aws-lambda';
import { ARecord, HostedZone, RecordTarget } from '@aws-cdk/aws-route53';
import { CloudFrontTarget } from '@aws-cdk/aws-route53-targets';
import * as cdk from '@aws-cdk/core';
import { CfnOutput } from '@aws-cdk/core';
import { hostedZoneId, website_domain } from './variables';
import { HttpOrigin } from '@aws-cdk/aws-cloudfront-origins';
import { AllowedMethods, CachePolicy, Distribution, HttpVersion, OriginRequestCookieBehavior, OriginRequestHeaderBehavior, OriginRequestPolicy, OriginRequestQueryStringBehavior, PriceClass, SecurityPolicyProtocol, ViewerProtocolPolicy } from '@aws-cdk/aws-cloudfront';


export class CloudfrontHttpApiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    ///////////////////////////////
    // Part 1
    const hostedZone = HostedZone.fromHostedZoneAttributes(this, 'hostedZoneWithAttributes', {
        hostedZoneId,
        zoneName: website_domain
    })
  
    const certificate = new DnsValidatedCertificate(this, 'ApiSSL', {
        domainName: website_domain,
        hostedZone
    })

    const api = new HttpApi(this, 'apiEndpoint', {
        apiName: 'exampleAPISameDomain',
    })
    
    new CfnOutput(this, 'apiID', {
        value: api.apiEndpoint
    })
    
    const signUpFn = new Function(this, 'signUpFn', {
        runtime: Runtime.NODEJS_14_X,
        code: Code.fromAsset(`${__dirname}/../lambda-fns/sign-up/deployment.zip`),
        handler: 'index.handler',
        memorySize: 512
    })
    ///////////////////////////////
    
    ///////////////////////////////
    // Part 2
    api.addRoutes({
        path: '/api/sign-up',
        methods: [HttpMethod.POST],
        integration: new LambdaProxyIntegration({ handler: signUpFn })
    })
    
    const apiOriginPolicy = new OriginRequestPolicy(this, 'apiOriginPolicy', {
        cookieBehavior: OriginRequestCookieBehavior.all(),
        headerBehavior: OriginRequestHeaderBehavior.none(),
        queryStringBehavior: OriginRequestQueryStringBehavior.all()
    })
    
    const distribution = new Distribution(this, 'websiteAndAPIDistribution', {
        defaultBehavior: {
            origin: new HttpOrigin('origin-source-code.com'),
        },
        additionalBehaviors: {
            'api/*': {
                origin: new HttpOrigin(api.apiEndpoint.replace('https://', '')),
                allowedMethods: AllowedMethods.ALLOW_ALL,
                cachePolicy: CachePolicy.CACHING_DISABLED,
                compress: false,
                originRequestPolicy: apiOriginPolicy,
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS
            }
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
    // Part 3
    new ARecord(this, 'AliasForCloudfront', {
        target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
        zone: hostedZone,
        recordName: website_domain
    })
    ///////////////////////////////
  }
}
