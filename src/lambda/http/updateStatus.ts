import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
//import { UpdateRequest } from '../../requests/UpdateRequest'
//import { Key } from '../../models/Key'
import { Response } from '../../models/Response'
import { IotUpdate } from '../../models/IotUpdate'
import { IoTAccess } from '../../dataLayer/IoTAccess'
import { createLogger } from '../../utils/logger'

const iotAccess = new IoTAccess(true)

const logger = createLogger('updatestatus')
var keys: Array<string> = null

//{ statusCode: 401, message: 'Unauthorized' };
//{ statusCode: 501, message: 'Not Implemented' }
function getResponse(res : Response){
  return {
    statusCode: res.statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      response: res.message
    })
  }
}

//https://stackoverflow.com/questions/60099777/in-a-apigatewayproxyevent-what-field-will-give-me-the-url
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const iotUpdate: IotUpdate = JSON.parse(event.body)
  const res: Response = { statusCode: 501, message: 'Not Implemented' }
  var ID: string = null
  
  if (event.hasOwnProperty('pathParameters') && 
      event.pathParameters !==null &&
      event.pathParameters.hasOwnProperty('id')) {
      ID = event.pathParameters.id
  }
  
  logger.info("ID: "+ID)
  //TODO: move to authorizer
  if (!keys) {
    await iotAccess.cacheKeyProfiles().then(k=>{
      keys = k
    }).catch(e => {
      console.log(e)
      return getResponse({ statusCode: 501, message: 'Not Implemented'})
    })
  }

  console.log("INFO: keys: " + keys)
  console.log("INFO: key: " + JSON.stringify(iotUpdate))

  if(iotUpdate !== null &&
     iotUpdate.hasOwnProperty('Key') &&
     keys.includes(iotUpdate.Key)) {
    console.log("INFO: Key Validated")
  } else return getResponse({ statusCode: 401, message: 'Unauthorized' })

  //logger.info("updateStatus: " + JSON.stringify(event.httpMethod))
  
  //const updRequest: UpdateRequest = JSON.parse(event.body)
  //logger.info('updateStatus')

  switch(event.httpMethod) {
    case("PUT"):
      console.log("Processing PUT...")
      await iotAccess.updIotUpdate(iotUpdate, res)
    break;
    case("DELETE"):
      console.log("Processing DELETE...")
      await iotAccess.delIotUpdate(iotUpdate, res)
    break;
    case("POST"):
      console.log("Processing POST...")
      await iotAccess.pstIotUpdate(iotUpdate, res)
    break;
    case("GET"): //TODO move this to "getStatus"
      console.log("GET:"+event.httpMethod)
    break;
    default:
  }

  //const update: IotUpdate = await todoAccess.newTodoItem(userId, newTodo.name, newTodo.dueDate, res)
  logger.info("updateStatus: " + JSON.stringify(res.message))

  return {
    statusCode: res.statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      message : res.message
    })
  }
}
