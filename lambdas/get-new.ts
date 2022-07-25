import * as AWS from 'aws-sdk';

const TABLE_NAME = process.env.TABLE_NAME || '';

const db = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: any = {}): Promise<any> => {

  const requestedItemId = event.pathParameters.id;
  if (!requestedItemId) {
    return { statusCode: 400, body: `Error: You are missing the path parameter id` };
  }

  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: "marca = :m",
    ExpressionAttributeValues: {
        ":m": requestedItemId
    }
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