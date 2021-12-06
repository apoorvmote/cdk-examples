#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { HttpsRedirectStack } from '../lib/https-redirect-stack';

const app = new cdk.App();

const virginia = { account: '012345678901', region: 'us-east-1' }

new HttpsRedirectStack(app, 'HttpsRedirectStack', { env: virginia });