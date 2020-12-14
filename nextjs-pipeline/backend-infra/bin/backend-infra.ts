#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { BackendInfraStack } from '../lib/backend-infra-stack';
import { virginia } from '../lib/variables';
import { WOLoadBalancerStack } from '../lib/witout-load-balancer';

const app = new cdk.App();

new BackendInfraStack(app, 'BackendInfraStack', { env: virginia });

new WOLoadBalancerStack(app, 'withoutLoadBalancer', { env: virginia })
