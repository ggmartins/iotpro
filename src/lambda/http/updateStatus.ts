  import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
//import { UpdateRequest } from '../../requests/UpdateRequest'
import { Response } from '../../models/Response'
import { IotUpdate } from '../../models/IotUpdate'
import { IoTAccess } from '../../dataLayer/IoTAccess'
import { createLogger } from '../../utils/logger'

const iotAccess = new IoTAccess(false)

const logger = createLogger('updatestatus')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const iotUpdate: IotUpdate = JSON.parse(event.body)
  //const updRequest: UpdateRequest = JSON.parse(event.body)
  //logger.info('updateStatus')

  var res: Response = { statusCode: 501, message: 'Not Implemented'};

  //const update: IotUpdate = await todoAccess.newTodoItem(userId, newTodo.name, newTodo.dueDate, res)

  const response: Response = await iotAccess.updIotUpdate(iotUpdate, res)
  logger.info("updateStatus: " + response.message)

  return {
    statusCode: res.statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      response
    })
  }
}
