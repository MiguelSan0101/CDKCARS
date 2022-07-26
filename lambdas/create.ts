import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
const parser = require('lambda-multipart-parser');
// import * as nodemailer from 'nodemailer';
import { PutObjectRequest } from 'aws-sdk/clients/s3';
const fs = require('fs'); 


const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

const db = new AWS.DynamoDB.DocumentClient();
const S3 = new AWS.S3({ region: 'us-east-2' })

const RESERVED_RESPONSE = `Error: You're using AWS reserved keywords as attributes`,
  DYNAMODB_EXECUTION_ERROR = `Error: Execution update, caused a Dynamodb error, please take a look at your CloudWatch Logs.`;

export const handler = async (event: any = {}): Promise<any> => {
  const result = await parser.parse(event)
  const modelo =result.modelo;
  const marca =result.marca;
  const year =result.year;
  const { content, filename, contentType } = result.files[0];

  // const paramsImg = {
  //   Bucket: "imagenesmiguel",
  //   Key: filename,
  //   Body: content,
  //   ContentDisposition: `attachment; filename="${filename}";`,
  //   ContentType: contentType,
  //   ACL: "public-read"
  // };


  if(modelo === undefined || modelo === ''){
    return{statusCode: 500, body: `El modelo es requerido`};
  }
  if(marca === undefined || marca === ''){
    return{statusCode: 500, body: `La marca es requerida`};
  }
  if(year === undefined || year === ''){
    return{statusCode: 500, body: `El año es requerido`};
  }

  try {
    const imgdata = fs.readFileSync(content)
    const paramsImg: PutObjectRequest =  {
      Bucket: 'imagenesmiguel',
      Key: filename,
      Body: imgdata,
      ACL: 'public-read',
      ContentType: contentType
    }
    const res = await S3.upload(paramsImg).promise();
    const params = {
      TableName: TABLE_NAME,
      Item: {
        'id':uuidv4(),
        'created_at':new Date().toString(),
        'modelo':modelo,
        'marca':marca,
        'year':year,
        'url_Img':res.Location
      },
      ConditionExpression: 'attribute_not_exists(modelo)'
    };
    
  await db.put(params).promise();
  return { statusCode: 201, body: `Exito al crear item |${filename}|${contentType} \n`+JSON.stringify(params.Item)};
      

  } catch (error) {
    const errorResponse = error === 'ValidationException' && error.includes('reserved keyword') ?
      DYNAMODB_EXECUTION_ERROR : RESERVED_RESPONSE;
    return { statusCode: 500, body: error + `\nEl modelo ya existe`  };
  }
};
