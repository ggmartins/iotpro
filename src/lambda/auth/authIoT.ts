import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { IoTAccess } from '../../dataLayer/IoTAccess'
import * as jwt from 'jsonwebtoken'

const iotAccess:IoTAccess = new IoTAccess(false)
var keys: Array<string> = null
import { createLogger } from '../../utils/logger'
const logger = createLogger('authIoT')

const deny = {
    principalId: 'user',
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: 'Deny',
          Resource: '*'
        }
      ]
    }
}

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  
  var str: string[] = event.authorizationToken.split("|", 3)

  if (str.length != 3) {
    logger.info('malformed')
    return deny //malformed
  }
  const uuid:string = str[0]
  const key:string = str[1]   //"shared key"
  const token:string = str[2]

  logger.info("event:" + JSON.stringify(event))
  logger.info("uuid:" + uuid)
  logger.info("token:" + token)

  if (!event.requestContext.resourcePath.startsWith("/dev")) {
    if (typeof token === 'undefined') return deny
    let decodedJwt = jwt.verify(token, process.env.JWT_SECRET)

    if (typeof decodedJwt.devname !== 'undefined' &&
        decodedJwt.devname.length > 0) {
        if (decodedJwt.devname == uuid){
            logger.info("token validated:" + decodedJwt.devname)
        } else {
            logger.info("token devname differ" + decodedJwt.devname)
            return deny
        }
    } else return deny
  }

  if (!keys) {
    await iotAccess.cacheKeyProfiles().then(k=>{
      keys = k
    }).catch(e => {
      console.log(e)
      return deny
    })
  }

  if(keys.includes(key)) {
   console.log("INFO: Key Validated")
  } else return deny
  

  return {
    principalId: 'id',
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: '*'
        }
      ]
    }
  }
}