import { IResource, LambdaIntegration, MockIntegration, PassthroughBehavior, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, StreamViewType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime,StartingPosition } from 'aws-cdk-lib/aws-lambda';
import { RemovalPolicy, CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { join } from 'path'
import { Construct } from 'constructs';
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import * as iam from "aws-cdk-lib/aws-iam";

export class MyLambdaStack extends Stack {
    constructor(scope: Construct, id: string, stageName: string, props?: StackProps) {
      super(scope, id, props);
      const CarrosTable = new Table (this, 'carros', {
        tableName:`carros - ${stageName}`,
        partitionKey:{
            name:'modelo',
            type: AttributeType.STRING
        },
        sortKey:{
            name:'modelo',
            type:AttributeType.STRING
        },
        stream: StreamViewType.NEW_AND_OLD_IMAGES,
        removalPolicy:RemovalPolicy.DESTROY
      })

      const nodeJsFunctionProps: NodejsFunctionProps = {
        bundling: {
          externalModules: [
            'aws-sdk', 
          ],
        },
        depsLockFilePath: join(__dirname, '../', 'package-lock.json'),
        environment: {
          PRIMARY_KEY: 'modelo',
          TABLE_NAME: CarrosTable.tableName
        },
        runtime: Runtime.NODEJS_14_X,
      }
    // Create a Lambda function for each of the CRUD operations
    const getOneLambda = new NodejsFunction(this, 'getOneItemFunction', {
      entry: join(__dirname, '../lambdas', 'get-one.ts'),
      functionName:`getOneItemFunction - ${stageName}`,
      ...nodeJsFunctionProps,
    });
    const getAllLambda = new NodejsFunction(this, 'getAllItemsFunction', {
      entry: join(__dirname, '../lambdas', 'get-all.ts'),
      functionName:`getAllItemsFunction - ${stageName}`,
      ...nodeJsFunctionProps,
    });
    const createOneLambda = new NodejsFunction(this, 'createItemFunction', {
      entry: join(__dirname, '../lambdas', 'create.ts'),
      functionName:`createItemFunction - ${stageName}`,
      ...nodeJsFunctionProps,
    });
    const updateOneLambda = new NodejsFunction(this, 'updateItemFunction', {
      entry: join(__dirname, '../lambdas', 'update-one.ts'),
      functionName:`updateItemFunction - ${stageName}`,
      ...nodeJsFunctionProps,
    });
    const deleteOneLambda = new NodejsFunction(this, 'deleteItemFunction', {
      entry: join(__dirname, '../lambdas', 'delete-one.ts'),
      functionName:`deleteItemFunction - ${stageName}`,
      ...nodeJsFunctionProps,
    });

    const notificationsLambda = new NodejsFunction(this, 'notificationsFunction', {
      entry: join(__dirname, '../lambdas', 'notification.ts'),
      functionName:`notificationsFunction - ${stageName}`,
      ...nodeJsFunctionProps,
    });


    // Grant the Lambda function read access to the DynamoDB table
    CarrosTable.grantReadWriteData(getAllLambda);
    CarrosTable.grantReadWriteData(getOneLambda);
    CarrosTable.grantReadWriteData(createOneLambda);
    CarrosTable.grantReadWriteData(updateOneLambda);
    CarrosTable.grantReadWriteData(deleteOneLambda);

    notificationsLambda.addEventSource(new DynamoEventSource(CarrosTable, {
      startingPosition:StartingPosition.TRIM_HORIZON,
      batchSize: 1,
    }));
    notificationsLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["ses:SendEmail"],
        resources: ["*"],
      })
    );

    //Outputs
    new CfnOutput(this, 'DynamoDBTable', {value:CarrosTable.tableName});
    new CfnOutput(this, 'LambdaFunctionArn', {value:notificationsLambda.functionArn});

    
    // Integrate the Lambda functions with the API Gateway resource
    const getAllIntegration = new LambdaIntegration(getAllLambda);
    const createOneIntegration = new LambdaIntegration(createOneLambda);
    const getOneIntegration = new LambdaIntegration(getOneLambda);
    const updateOneIntegration = new LambdaIntegration(updateOneLambda);
    const deleteOneIntegration = new LambdaIntegration(deleteOneLambda);


    // Create an API Gateway resource for each of the CRUD operations
    const api = new RestApi(this, 'itemsApi', {
      restApiName: `Items Service - ${stageName}`,
    });

    const items = api.root.addResource('items');
    items.addMethod('GET', getAllIntegration);
    items.addMethod('POST', createOneIntegration);
    addCorsOptions(items);

    const singleItem = items.addResource('{id}');
    singleItem.addMethod('GET', getOneIntegration);
    singleItem.addMethod('PATCH', updateOneIntegration);
    singleItem.addMethod('DELETE', deleteOneIntegration);
    addCorsOptions(singleItem);
  }
}
export function addCorsOptions(apiResource: IResource) {
  apiResource.addMethod('OPTIONS', new MockIntegration({
    integrationResponses: [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
        'method.response.header.Access-Control-Allow-Origin': "'*'",
        'method.response.header.Access-Control-Allow-Credentials': "'false'",
        'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET,PUT,POST,DELETE'",
      },
    }],
    passthroughBehavior: PassthroughBehavior.NEVER,
    requestTemplates: {
      "application/json": "{\"statusCode\": 200}"
    },
  }), {
    methodResponses: [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Access-Control-Allow-Headers': true,
        'method.response.header.Access-Control-Allow-Methods': true,
        'method.response.header.Access-Control-Allow-Credentials': true,
        'method.response.header.Access-Control-Allow-Origin': true,
      },
    }]
  })

}