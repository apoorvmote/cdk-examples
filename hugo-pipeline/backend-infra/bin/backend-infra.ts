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

new CertificateStack(app, 'certificate-UfyGK3cks5nZs3Wc', { env: virginia })

new S3CloudfrontStack(app, 's3cloudfront-3ZFF5p53aXZaPqWB', { env: virginia })

new CodePipelineStack(app, 'codepipeline-22RY5f7eRyfWfDjb', { env: virginia })