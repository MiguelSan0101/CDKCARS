import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
// import * as nodemailer from 'nodemailer';


const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

const db = new AWS.DynamoDB.DocumentClient();

const RESERVED_RESPONSE = `Error: You're using AWS reserved keywords as attributes`,
  DYNAMODB_EXECUTION_ERROR = `Error: Execution update, caused a Dynamodb error, please take a look at your CloudWatch Logs.`;

export const handler = async (event: any = {}): Promise<any> => {

  if (!event.body) {
    return { statusCode: 400, body: 'invalid request, you are missing the parameter body' };
  }
  const item = typeof event.body == 'object' ? event.body : JSON.parse(event.body);
    
  const {modelo, marca, ...resto } = JSON.parse(event.body);

  item[PRIMARY_KEY] = uuidv4();
  item['created_at'] = new Date().toString();
  const params = {
    TableName: TABLE_NAME,
    Item: item,
    ConditionExpression: 'attribute_not_exists(modelo)'
  };
  const p = {
    IndexName: PRIMARY_KEY,
    TableName: TABLE_NAME,
    KeyConditionExpression: '#mod = :mode',
    ExpressionAttributeNames: { 
    '#mod': 'modelo', 
    },
    ExpressionAttributeValues: { 
    ':mode': modelo
    }
  };
  try {
    const validar = await db.query(p).promise();

    if(validar.Count !== 0 || validar.Count !== undefined){
      return{statusCode: 500, body: `El modelo ya existe`};
    }

    if(modelo === undefined || modelo === ''){
      return{statusCode: 500, body: `El modelo es requerido`};
    }
    if(marca === undefined || marca === ''){
      return{statusCode: 500, body: `La marca es requerida`};
    }
    
  await db.put(params).promise();
  return { statusCode: 201, body: `Exito al crear item ${validar.Count}\n`+JSON.stringify(params.Item)};
      

  } catch (error) {
    const errorResponse = error === 'ValidationException' && error.includes('reserved keyword') ?
      DYNAMODB_EXECUTION_ERROR : RESERVED_RESPONSE;
    return { statusCode: 500, body: errorResponse + `\nEl modelo ya existe`  };
  }
};
