import { CorsHttpMethod, DomainName, HttpApi, HttpMethod } from '@aws-cdk/aws-apigatewayv2';
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { DnsValidatedCertificate } from '@aws-cdk/aws-certificatemanager';
import { Architecture, Code, Function, Runtime } from '@aws-cdk/aws-lambda';
import { ARecord, HostedZone, RecordTarget } from '@aws-cdk/aws-route53';
import { ApiGatewayv2DomainProperties } from '@aws-cdk/aws-route53-targets';
import * as cdk from '@aws-cdk/core';
import { CfnOutput } from '@aws-cdk/core';
import { api_domain, hostedZoneId, website_domain } from './variables';

export class HttpApiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    ///////////////////////////////
    // Part 1
    const hostedZone = HostedZone.fromHostedZoneAttributes(this, 'hostedZoneWithAttributes', {
      hostedZoneId,
      zoneName: website_domain
    })

    const apiCert = new DnsValidatedCertificate(this, 'ApiSSL', {
      domainName: api_domain,
      hostedZone
    })
    ///////////////////////////////

    ///////////////////////////////
    // Part 2
    const domain = new DomainName(this, 'api_domain', {
      domainName: api_domain,
      certificate: apiCert
    })

    const api = new HttpApi(this, 'apiEndpoint', {
      defaultDomainMapping: {
        domainName: domain
      },
      corsPreflight: {
        allowCredentials: true,
        allowHeaders: ['Content-Type'],
        allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.POST, CorsHttpMethod.PUT, CorsHttpMethod.DELETE],
        allowOrigins: [
          'https://example.com'
        ]
      },
      apiName: 'exampleAPI',
      disableExecuteApiEndpoint: true
    })

    new CfnOutput(this, 'apiID', {
      value: api.httpApiId
    })

    const signUpFn = new Function(this, 'signUpFn', {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset(`${__dirname}/../lambda-fns/sign-up/deployment.zip`),
      handler: 'index.handler',
      architectures: [Architecture.ARM_64],
      memorySize: 512
    })
    ///////////////////////////////

    // const existingAPI = HttpApi.fromHttpApiAttributes(this, 'existingAPI', {
    //   apiEndpoint: api_domain,
    //   httpApiId: 'myApiId'
    // })
    
    ///////////////////////////////
    // Part 3
    new ARecord(this, 'apiAliasRecord', {
      zone: hostedZone,
      target: RecordTarget.fromAlias(new ApiGatewayv2DomainProperties(domain.regionalDomainName, domain.regionalHostedZoneId))
    })

    api.addRoutes({
      path: '/sign-up',
      methods: [HttpMethod.POST],
      integration: new LambdaProxyIntegration({ handler: signUpFn })
    })
    ///////////////////////////////
  }
}
