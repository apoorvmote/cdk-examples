#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { LambdaLayersStack } from '../lib/lambda-layers-stack';
import { virginia } from '../lib/variables';

const app = new cdk.App();
new LambdaLayersStack(app, 'LambdaLayersStack', { env: virginia });
