#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { DynamodbCrudStack } from '../lib/dynamodb-crud-stack';

const app = new cdk.App();
new DynamodbCrudStack(app, 'DynamodbCrudStack-AnBmdHH53PUgeF7R');
