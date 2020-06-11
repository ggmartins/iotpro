import * as AWS  from 'aws-sdk'
import bcrypt from 'bcryptjs'
import { DeviceCreate } from '../../models/DeviceCreate'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { Response } from '../../models/Response'
import { createLogger } from '../../utils/logger'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

const logger = createLogger('createDevice')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  var res : Response = { statusCode: 200, message: 'OK' }
  const body:DeviceCreate = JSON.parse(event.body)
  const devname = body.devname
  const pssword = body.pssword

  const docClient : DocumentClient = new AWS.DynamoDB.DocumentClient()
  await docClient.put({
            TableName: process.env.DEV_TABLE,
            Item: {
              devname: devname,
              password: bcrypt.hashSync(pssword, 10)
            }
    }).promise().then(()=>{
        logger.info("device created")
    }).catch(err => {
        res.statusCode = 501
        res.message = err
  })

  return {
    statusCode: res.statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      message: res.message,
    })
  }

};