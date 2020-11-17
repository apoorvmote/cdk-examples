#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CertificateStack } from '../lib/certificate';
import { S3CloudfrontStack } from '../lib/s3cloudfront';
import { CodePipelineStack } from '../lib/code-pipeline';
// import { BackendInfraStack } from '../lib/backend-infra-stack';

const virginia = { account: '012345678901', region: 'us-east-1' }

const app = new cdk.App();
// new BackendInfraStack(app, 'BackendInfraStack');

new CertificateStack(app, 'certificate-UfyGK3cks5nZs3Wc', { env: virginia })

new S3CloudfrontStack(app, 's3cloudfront-3ZFF5p53aXZaPqWB', { env: virginia })

new CodePipelineStack(app, 'codepipeline-22RY5f7eRyfWfDjb', { env: virginia })