#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { HttpApiStack } from '../lib/http-api-stack';
import { virginia } from '../lib/variables';

const app = new cdk.App();
new HttpApiStack(app, 'HttpApiStack-mKsnyabf2uaVWcMR', { env: virginia });
