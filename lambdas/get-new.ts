import * as AWS from 'aws-sdk';

const TABLE_NAME = process.env.TABLE_NAME || '';

const db = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: any = {}): Promise<any> => {

 const order = event.queryStringParameters.order;
 if (!order) {
    return { statusCode: 400, body: `Es necesario el parametro del orden '?order=asc | des'` };
  }
var bandera = true;
 if(order === 'ase'){
    bandera=true
 }
 if(order === 'des'){
    bandera=false
 }

  const requestedItemId = event.pathParameters.id;
  if (!requestedItemId) {
    return { statusCode: 400, body: `Error: You are missing the path parameter id` };
  }

  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: "marca = :m",
    ExpressionAttributeValues: {
        ":m": requestedItemId
    },
    ScanIndexForward:bandera
  };

  try {
    const response = await db.query(params).promise();
    if (response.Items) {
      return { statusCode: 200, body: JSON.stringify(response.Items) };
    } else {
      return { statusCode: 404 };
    }
  } catch (dbError) {
    return { statusCode: 500, body: JSON.stringify(dbError) };
  }
};