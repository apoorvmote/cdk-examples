#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LambdaCostStack } from '../lib/lambda-cost-stack';

const app = new cdk.App();
new LambdaCostStack(app, 'LambdaCostStack');
