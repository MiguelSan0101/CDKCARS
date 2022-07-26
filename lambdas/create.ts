import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
// import * as nodemailer from 'nodemailer';


const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

const db = new AWS.DynamoDB.DocumentClient();

const RESERVED_RESPONSE = `Error: You're using AWS reserved keywords as attributes`,
  DYNAMODB_EXECUTION_ERROR = `Error: Execution update, caused a Dynamodb error, please take a look at your CloudWatch Logs.`;

export const handler = async (event: any = {}): Promise<any> => {
  const {modelo, marca, year, ...resto } = event.queryStringParameters();
  if(modelo === undefined || modelo === ''){
    return{statusCode: 500, body: `El modelo es requerido`};
  }
  if(marca === undefined || marca === ''){
    return{statusCode: 500, body: `La marca es requerida`};
  }
  if(year === undefined || year === ''){
    return{statusCode: 500, body: `El año es requerido`};
  }
  const params = {
    TableName: TABLE_NAME,
    Item: {
      'id':uuidv4(),
      'created_at':new Date().toString(),
      'modelo':modelo,
      'marca':marca,
      'year':year
    },
    ConditionExpression: 'attribute_not_exists(modelo)'
  };
  try {
    
  await db.put(params).promise();
  return { statusCode: 201, body: `Exito al crear item \n`+JSON.stringify(params.Item)};
      

  } catch (error) {
    const errorResponse = error === 'ValidationException' && error.includes('reserved keyword') ?
      DYNAMODB_EXECUTION_ERROR : RESERVED_RESPONSE;
    return { statusCode: 500, body: errorResponse + `\nEl modelo ya existe`  };
  }
};
