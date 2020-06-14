import { DeviceCreate } from '../../models/DeviceCreate'
import { Response } from '../../models/Response'
import { createLogger } from '../../utils/logger'
import { IoTAccess } from '../../dataLayer/IoTAccess'
import * as jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

const logger = createLogger('loginDevice')
const iotAccess:IoTAccess = new IoTAccess(false)


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  var res : Response = { statusCode: 200, message: 'OK' }
  const body : DeviceCreate = JSON.parse(event.body)

  logger.info("body: " + JSON.stringify(JSON.parse(event.body)))

  await iotAccess.qryDevice(body.devname, res).then((result)=>{
    if (typeof result !== 'undefined') {
        logger.info("checking passwords...")
        const compareResult = bcrypt.compareSync(body.pssword, result.pssword)
        if (compareResult) {
            logger.info("passwords matched.")
            let token = jwt.sign({
                devname: result.devname
            }, process.env.JWT_SECRET)
            res.statusCode = 200
            res.message = token 
            logger.info("token generated.")
        } else {
            res.statusCode = 404
            res.message = "bad password"
        }
    }
  }).catch(err=>{
    console.log(err)
    res.statusCode = 404
    res.message = err
    logger.error(res.message)
  })
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