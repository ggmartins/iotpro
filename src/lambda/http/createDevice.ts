import { DeviceCreate } from '../../models/DeviceCreate'
import { Response } from '../../models/Response'
import { createLogger } from '../../utils/logger'
import { IoTAccess } from '../../dataLayer/IoTAccess'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

const logger = createLogger('createDevice')
const iotAccess:IoTAccess = new IoTAccess(process.env.ENABLE_LOCAL == 'true')


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  var res : Response = { statusCode: 201, message: 'OK' }
  const body:DeviceCreate = JSON.parse(event.body)

  logger.info("body: " + JSON.stringify(JSON.parse(event.body)))

  await iotAccess.pstDevice(body.devname, body.pssword, res)
  logger.info(res.message)

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