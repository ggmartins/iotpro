import 'source-map-support/register'
import { createLogger } from '../../utils/logger'
import { IoTAccess } from '../../dataLayer/IoTAccess'
import { Response } from '../../models/Response'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

const iotAccess:IoTAccess = new IoTAccess(false)

const logger = createLogger('uploading')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  var res : Response = { statusCode: 200, message: 'OK' }
  const uuid = event.pathParameters.id
  logger.info(uuid);

  var url: string

  await iotAccess.getIotUpload(uuid, res).then(u=>{ url = u }).catch(err => {
    res.statusCode = 500
    res.message = err+""
    console.log(err+"")
    logger.error(err)
  })
  
  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  return {
    statusCode: res.statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      message: res.message,
      uploadUrl: url
    })
  }
}
