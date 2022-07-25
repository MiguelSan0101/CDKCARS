import * as AWS from 'aws-sdk';

const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';


const RESERVED_RESPONSE = `Error: You're using AWS reserved keywords as attributes`,
  DYNAMODB_EXECUTION_ERROR = `Error: Execution update, caused a Dynamodb error, please take a look at your CloudWatch Logs.`;

const db = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: any = {}): Promise<any> => {
  const {marca, ...resto } = JSON.parse(event.body);
  if (!event.body) {
    return { statusCode: 400, body: 'solicitud no válida, falta el cuerpo del parámetro' };
  }
  if (marca === undefined || marca === '') {
    return { statusCode: 400, body: 'La marca es requerida' };
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
  const params: any = {
    TableName: TABLE_NAME,
    Key: {
      marca: m[0], //Primary key
      modelo:m[1]  //Sort key
    },
    UpdateExpression: `set marca = :marca`,
    ExpressionAttributeValues: {
      ':marca':marca
    },
    ReturnValues: 'UPDATED_NEW'
  }

  try {
    await db.update(params).promise();
    return { statusCode: 204, body: 'Actualizado Correctamente' };
  } catch (dbError) {
    const errorResponse = dbError === 'ValidationException' && dbError.includes('reserved keyword') ?
      DYNAMODB_EXECUTION_ERROR : RESERVED_RESPONSE;
    return { statusCode: 500, body: errorResponse +`M0: ${m[0]} M1: ${m[1]}` };
  }
};