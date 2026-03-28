#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { EthnographyStack } from '../lib/ethnography-stack';

const app = new cdk.App();

new EthnographyStack(app, 'EthnographyStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  description: 'Voice ethnography: S3, Transcribe, Bedrock moderation, API for Next.js',
});

app.synth();
