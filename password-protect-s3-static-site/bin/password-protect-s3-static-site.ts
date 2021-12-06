#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PasswordProtectS3StaticSiteStack } from '../lib/password-protect-s3-static-site-stack';
import { virginia } from '../lib/variables';

const app = new cdk.App();
new PasswordProtectS3StaticSiteStack(app, 'PasswordProtectS3StaticSiteStack', { env: virginia });
