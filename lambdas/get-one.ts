import * as AWS from 'aws-sdk';

const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

const db = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: any = {}): Promise<any> => {

  const requestedItemModelo = event.pathParameters.modelo;
  if (!requestedItemModelo) {
    return { statusCode: 400, body: `Error: You are missing the path parameter id` };
  }

  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: "modelo = :mod",
    ExpressionAttributeValues: {
        ":mod": requestedItemModelo
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