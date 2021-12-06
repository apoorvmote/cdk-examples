#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LambdaLocalStack } from '../lib/lambda-local-stack';
import { virginia } from '../lib/variables';

const app = new cdk.App();
new LambdaLocalStack(app, 'LambdaLocalStack-WDzD8ERde7sB6sfJ', { env: virginia });
