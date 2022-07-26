import * as AWS from 'aws-sdk';

const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';


const RESERVED_RESPONSE = `Error: You're using AWS reserved keywords as attributes`,
  DYNAMODB_EXECUTION_ERROR = `Error: Execution update, caused a Dynamodb error, please take a look at your CloudWatch Logs.`;

const db = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: any = {}): Promise<any> => {
  const {year,...resto } = JSON.parse(event.body);
  if (!event.body) {
    return { statusCode: 400, body: 'solicitud no válida, falta el cuerpo del parámetro' };
  }
  if (year === undefined || year === '') {
    return { statusCode: 400, body: 'El año es requerida' };
  }
  const editedItemId = event.pathParameters.id;
  if (!editedItemId) {
    return { statusCode: 400, body: 'Solicitud inválida, te falta el ID del parámetro de la ruta.' };
  }

  const editedItem: any = typeof event.body == 'object' ? event.body : JSON.parse(event.body);
  
  if (!editedItem) {
    return { statusCode: 400, body: 'solicitud inválida, no se proporcionaron argumentos' };
  }
  var m = editedItemId.split("_",2)
  // const params: any = {
  //   TableName: TABLE_NAME,
  //   Key: {
  //     marca: m[0], //Primary key
  //     modelo:m[1]  //Sort key
  //   },
  //   UpdateExpression: `set marca = :marca`,
  //   ExpressionAttributeValues: {
  //     ':marca':marca
  //   },
  //   ReturnValues: 'UPDATED_NEW'
  // }
  var params = {
    TableName: TABLE_NAME,
    Key: {
      marca: m[0], //Primary key
      modelo:m[1]  //Sort key 
    },
    UpdateExpression: 'set #a = :x',
    ExpressionAttributeNames: {'#a' : 'year'},
    ExpressionAttributeValues: {
      ':x' : year
    }
  };
  try {
    await db.update(params).promise();
    return { statusCode: 204, body: 'Actualizado Correctamente' };
  } catch (dbError) {
    return { statusCode: 500, body: dbError +`M0: ${m[0]} M1: ${m[1]}` };
  }
};