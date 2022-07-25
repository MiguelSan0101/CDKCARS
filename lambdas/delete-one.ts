import * as AWS from 'aws-sdk';

const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

const db = new AWS.DynamoDB.DocumentClient();
const ddb = new AWS.DynamoDB();

export const handler = async (event: any = {}): Promise<any> => {

  const requestedItemId = event.pathParameters.id;
  if (!requestedItemId) {
    return { statusCode: 400, body: `Error: You are missing the path parameter id` };
  }

  var marca = requestedItemId.split("_",2)
  const params = {
    TableName: TABLE_NAME,
    Key: {
      marca: marca[0],
      modelo:marca[1]
    }
  }

  try {
    // const statement = `SELECT * FROM ${TABLE_NAME} WHERE marca = '${marca[0]}' and modelo = '${marca[1]}' `
    // const results = await ddb.executeStatement({Statement: statement}).promise();

    await db.delete(params).promise();
    return { statusCode: 200, body: 'Exito al eliminar item' };
  } catch (dbError) {
    return { statusCode: 500, body: JSON.stringify(dbError)+`M0: ${marca[0]} M1: ${marca[1]}` };
  }
};