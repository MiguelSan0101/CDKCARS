import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { CommonPipelineStage } from './pipeline-stage'

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StageProps) {
    super(scope, id, props)
  
    new CommonPipelineStage(this, 'dev', 'develop')
    new CommonPipelineStage(this, 'qa', 'qa')
    // new CommonPipelineStage(this, 'prod', 'master')
  }
}
