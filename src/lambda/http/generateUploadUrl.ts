import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import { createLogger } from '../../utils/logger'
import { FileAccess } from '../../dataLayer/FileAccess'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

const docClient = new AWS.DynamoDB.DocumentClient()
const iotTable = process.env.IOT_TABLE
const idxTable = process.env.IOT_INDEX

const logger = createLogger('uploadimg')

const fileAccess: FileAccess = new FileAccess(true)
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const uuid = event.pathParameters.id
  logger.info(uuid);

  var statusCode = 200
  var message = 'OK'

  var Items=[]
  await docClient
  .query({
    TableName: iotTable,
    IndexName: idxTable,
    KeyConditionExpression: 'uuid = :uuid',
    ExpressionAttributeValues: {
      ':uuid': uuid
    }
  })
  .promise().then(function(result){
    //logger.info("query.then")
    Items = result.Items
    if (Items.length == 0){
      statusCode = 404
      message = "Not found"
    }
  }).catch(err=>{
    logger.error(err)
    message = err
    statusCode = 500
  })

  if(statusCode==200){
    logger.info("getting url")
    var url=fileAccess.getUploadUrl(uuid)
    var urlAtt=url.split('?')[0];
    logger.info("upload url:"+url)
    await docClient.update({TableName: iotTable,
      Key:{
        'uuid' : Items[0].uuid,
        'createdAt' : Items[0].createdAt
      },
      UpdateExpression: "set #attachmentUrl = :a",
      ExpressionAttributeNames: {
        "#attachmentUrl": "attachmentUrl"
      },
      ExpressionAttributeValues:{
        ":a":urlAtt,
      },
      ReturnValues:"UPDATED_NEW"
    }).promise().then(function(){
      logger.info("OK")
    }).catch(err=>{
      logger.error("error updating item: "+ err)
      statusCode = 500
      message = err
    })
  }
  
  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      message,
      uploadUrl: url
    })
  }
}
