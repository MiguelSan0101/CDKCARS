import { Stage, StageProps } from 'aws-cdk-lib'
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from 'aws-cdk-lib/pipelines'
import { Construct } from 'constructs'
import { CdkcarsStack } from '../lib/cdkcars-stack';

export class CommonPipelineStage {
  constructor(scope: Construct, stage: string, branchName: string) {
    const pipeline = new CodePipeline(scope, 'Pipeline', {
        pipelineName: 'TestPipeline',
        synth: new ShellStep('Synth',{
          input: CodePipelineSource.gitHub('MiguelSan0101/CDKCARS','main'),
          commands: ['npm ci',
                     'npm run build',
                     'npx cdk synth']
        }),
      });
    const stackName = `cdkcars-${stage}`
    const stageName = `cdkcars-${stage}`
    pipeline.addStage(
      new PipelineStage(scope, stageName, stackName, {
        env: { region: 'us-east-2' },
      })
    )
  }
}

class PipelineStage extends Stage {
  constructor(
    scope: Construct,
    id: string,
    stackName: string,
    props?: StageProps
  ) {
    super(scope, id, props)
    new CdkcarsStack(this, stackName, { stackName, ...props })
  }
}