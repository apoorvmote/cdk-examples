#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CertificateStack } from '../lib/certificate';
import { S3CloudfrontStack } from '../lib/s3cloudfront';
// import { BackendInfraStack } from '../lib/backend-infra-stack';

const virginia = { account: '012345678901', region: 'us-east-1' }

const app = new cdk.App();
// new BackendInfraStack(app, 'BackendInfraStack');

new CertificateStack(app, 'certificate-avDFA2jV6u6gUeUz', { env: virginia })

new S3CloudfrontStack(app, 's3cloudfront-CggFnHGGvbCR4Nww', { env: virginia })