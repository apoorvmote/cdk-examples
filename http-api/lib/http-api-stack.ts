import { DomainName, HttpApi, HttpMethod } from '@aws-cdk/aws-apigatewayv2';
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { DnsValidatedCertificate } from '@aws-cdk/aws-certificatemanager';
import { Code, Function, Runtime } from '@aws-cdk/aws-lambda';
import { ARecord, HostedZone, RecordTarget } from '@aws-cdk/aws-route53';
import { ApiGatewayv2Domain } from '@aws-cdk/aws-route53-targets';
import * as cdk from '@aws-cdk/core';
import { CfnOutput } from '@aws-cdk/core';
import { api_domain, hostedZoneId, website_domain } from './variables';

export class HttpApiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const hostedZone = HostedZone.fromHostedZoneAttributes(this, 'hostedZoneWithAttributes', {
      hostedZoneId,
      zoneName: website_domain
    })

    const apiCert = new DnsValidatedCertificate(this, 'ApiSSL', {
      domainName: api_domain,
      hostedZone
    })

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
        allowMethods: [HttpMethod.GET, HttpMethod.POST, HttpMethod.PUT, HttpMethod.DELETE],
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

    // const existingAPI = HttpApi.fromHttpApiAttributes(this, 'existingAPI', {
    //   apiEndpoint: api_domain,
    //   httpApiId: 'myApiId'
    // })
    
    new ARecord(this, 'apiAliasRecord', {
      zone: hostedZone,
      target: RecordTarget.fromAlias(new ApiGatewayv2Domain(domain))
    })

    const signUpFn = new Function(this, 'signUpFn', {
      runtime: Runtime.NODEJS_12_X,
      code: Code.fromAsset(`${__dirname}/../lambda-fns/sign-up/deployment.zip`),
      handler: 'index.handler',
      memorySize: 512
    })

    api.addRoutes({
      path: '/sign-up',
      methods: [HttpMethod.POST],
      integration: new LambdaProxyIntegration({ handler: signUpFn })
    })
  }
}
