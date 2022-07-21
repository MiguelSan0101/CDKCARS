#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkcarsStack } from '../lib/cdkcars-stack';
import { PipelineStack } from './pipeline-stack';

const app = new cdk.App()
new PipelineStack(app, 'cdkcars', {
  env: {
    region: 'us-east-2'
  },
})
