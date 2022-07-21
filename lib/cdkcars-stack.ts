import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkcarsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new Table (this,'carros',{
      partitionKey:{
        name:'id',
        type:AttributeType.STRING
      },
      tableName:'carros',
      removalPolicy:RemovalPolicy.DESTROY,
    })
    
  }
}