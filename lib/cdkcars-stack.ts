import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as pipelines from "aws-cdk-lib/pipelines";

/**
 * Github Code here
 */
export class CdkcarsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      // The pipeline name
      pipelineName: 'CdkCarsPipeline',

      // How it will be built and synthesized
      synth: new pipelines.CodeBuildStep('SynthStep', {
          input: pipelines.CodePipelineSource.connection('MiguelSan0101/CDKCARS', 'main', {
              connectionArn: 'arn:aws:codestar-connections:us-east-2:591039258532:connection/731acae5-6c4d-43f6-aef5-2d333457312a'
          }),
          installCommands: [
            'npm install -g aws-cdk'    
          ],
          commands: [
            'npm ci',
            'npm run build',
            'npx cdk synth'
          ],
      })
    });
    
    // This is where we add the application stages
    // ...
  
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