#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CertificateStack } from '../lib/certificate';
import { S3CloudfrontStack } from '../lib/s3cloudfront';
import { CodePipelineStack } from '../lib/code-pipeline';
import { virginia } from '../lib/variables';
// import { BackendInfraStack } from '../lib/backend-infra-stack';

const app = new cdk.App();
// new BackendInfraStack(app, 'BackendInfraStack');

new CertificateStack(app, 'certificate-avDFA2jV6u6gUeUz', { env: virginia })

new S3CloudfrontStack(app, 's3cloudfront-CggFnHGGvbCR4Nww', { env: virginia })

new CodePipelineStack(app, 'codepipeline-VdGaVYQZ7XSa3VWF', { env: virginia })