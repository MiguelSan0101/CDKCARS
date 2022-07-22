import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Function, InlineCode, Runtime, Code} from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import { Table, AttributeType } from 'aws-cdk-lib/aws-dynamodb';
import { RemovalPolicy } from 'aws-cdk-lib';

export class MyLambdaStack extends cdk.Stack {
    constructor(scope: Construct, id: string, stageName: string, props?: cdk.StackProps) {
      super(scope, id, props);
      new Function(this, 'LambdaFunction', {
        runtime: Runtime.NODEJS_12_X, //using node for this, but can easily use python or other
        handler: 'handler.handler',
        code: Code.fromAsset(path.join(__dirname, 'lambda')), //resolving to ./lambda directory
        environment: { "stageName": stageName } //inputting stagename
      });

      const CarrosTable = new Table (this, 'carros', {
        tableName:'carros',
        partitionKey:{
            name:'id',
            type: AttributeType.STRING
        },
        sortKey:{
            name:'modelo',
            type:AttributeType.STRING
        },
        removalPolicy:RemovalPolicy.DESTROY
      })


    }
    
    
}