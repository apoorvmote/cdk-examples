#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { TsLambdaStack } from '../lib/ts-lambda-stack';

const app = new cdk.App();
new TsLambdaStack(app, 'TsLambdaStack');
