#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkcarsStack } from '../lib/cdkcars-stack';

const app = new cdk.App();
new CdkcarsStack(app, 'CdkcarsStack', {
  env:{
    account:'591039258532',
    region:'us-east-2'
  }
});
app.synth();