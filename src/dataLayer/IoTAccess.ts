import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { IotUpdate } from '../models/IotUpdate'
import { Response } from '../models/Response'
//import { Key } from '../models/Key'
//import * as uuid from 'uuid'

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('iotAccess')

const iotTable = process.env.IOT_TABLE
//const iotIndex = process.env.IOT_INDEX

export class IoTAccess {
    constructor(
        private enableAWSX:boolean,  
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly IotTable: string = iotTable,
  //      private readonly IotIndex: string = iotIndex,      
    ){
        if(this.enableAWSX)
        {
            logger.info('AWSX: enable')
            this.docClient = new XAWS.DynamoDB.DocumentClient()
        }
        else 
        {
            logger.info('AWSX: disable')
        }
    }

    async cacheKeyProfiles(): Promise<string[]> {
        return ['thissecretistmp']
    }


    async updIotUpdate(iotUpdate: IotUpdate,  response: Response): Promise<IotUpdate> {
        response.statusCode = 200
        response.message = 'OK'
        logger.info("iotUpdate: "+iotUpdate)
        console.log('iotUpdate: '+iotUpdate)
        await this.docClient.update({TableName: this.IotTable,
            Key:{
              'Id' : iotUpdate.id,
              'uuid' : iotUpdate.uuid
            },
            UpdateExpression: "set lastSeen=:l, idList=:idL",
            ExpressionAttributeValues:{
              ":l": iotUpdate.LastSeen,
              ":idL": iotUpdate.bundleList
            },
            ReturnValues:"UPDATED_NEW"
          }).promise().then( result => {
            logger.info("OK: " + JSON.stringify(result))
            }).catch( err => {
                logger.error("updTodoItem:" + err)
                response.statusCode = 500
                response.message = err
        })
        return iotUpdate
    }
}
        