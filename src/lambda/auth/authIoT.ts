import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { IoTAccess } from '../../dataLayer/IoTAccess'

const iotAccess:IoTAccess = new IoTAccess(false)
var keys: Array<string> = null
import { createLogger } from '../../utils/logger'
const logger = createLogger('auth')

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing IoT Device')
  console.log("token: " +JSON.stringify(event.authorizationToken))
  const key:string = event.authorizationToken

  if (!keys) {
    await iotAccess.cacheKeyProfiles().then(k=>{
      keys = k
    }).catch(e => {
      console.log(e)
      return {
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
    })
  }

  if(keys.includes(key)) {
   console.log("INFO: Key Validated")
  } else return {
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