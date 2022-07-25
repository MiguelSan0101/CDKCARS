import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ManualApprovalStep, ShellStep } from 'aws-cdk-lib/pipelines';
import { MyPipelineAppStage } from './stage';

export class CdkcarsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, 'Pipeline', {
        pipelineName: 'TestPipeline',
        synth: new ShellStep('Synth',{
          input: CodePipelineSource.gitHub('MiguelSan0101/CDKCARS','main'),
          commands: ['npm ci',
                     'npm run build',
                     'npx cdk synth']
        }),
      });

      const testingStage = pipeline.addStage(new MyPipelineAppStage(this, "dev", {
        env: { account: "591039258532", region: "us-east-2" }
      }));
  
  
      // testingStage.addPre(new ShellStep("Run Unit Tests", { commands: ['npm install', 'npm test'] }));
      // testingStage.addPost(new ManualApprovalStep('Manual approval before production'));
  
      // const prodStage = pipeline.addStage(new MyPipelineAppStage(this, "prod", {
      //   env: { account: "591039258532", region: "us-east-2" }
      // }));

  }
}

    // new CodePipeline(this, 'Pipeline', {
    //   pipelineName: 'TestPipeline',
    //   synth: new ShellStep('Synth',{
    //     input: CodePipelineSource.gitHub('MiguelSan0101/CDKCARS','main'),
    //     commands: ['npm ci',
    //                'npm run build',
    //                'npx cdk synth']
    //   }),
    // });