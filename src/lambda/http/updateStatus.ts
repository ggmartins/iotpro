import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
//import { UpdateRequest } from '../../requests/UpdateRequest'
//import { Key } from '../../models/Key'
import { Response } from '../../models/Response'
import { IotUpdate } from '../../models/IotUpdate'
import { IoTAccess } from '../../dataLayer/IoTAccess'
import { createLogger } from '../../utils/logger'

const iotAccess:IoTAccess = new IoTAccess(process.env.ENABLE_LOCAL == 'true')

const logger = createLogger('updatestatus')

//{ statusCode: 401, message: 'Unauthorized' };
//{ statusCode: 501, message: 'Not Implemented' }
/*function getResponse(res : Response){
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
}*/

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

  switch(event.httpMethod) {
    case("PUT"):
      console.log("Processing PUT...")
      await iotAccess.updIotUpdate(ID, iotUpdate, res)
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
      console.log("Processing GET...")
      await iotAccess.getIotUpdate(ID, res)
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
