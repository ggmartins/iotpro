//import * as AWS  from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'
//import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { IotUpdate } from '../models/IotUpdate'
import { Response } from '../models/Response'
import { Key } from '../models/Key'
//import * as uuid from 'uuid'

//const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('iotAccess')

//const iotTable = process.env.IOT_TABLE
//const iotIndex = process.env.IOT_INDEX

export class IoTAccess {
    constructor(
        private enableAWSX:boolean,  
        //private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        //private readonly IotTable: string = iotTable,
        //private readonly IotIndex: string = iotIndex,      
    ){
        if(this.enableAWSX)
        {
            logger.info('AWSX: enable')
        }
        else 
        {
            logger.info('AWSX: disable')
        }
        //  this.docClient = new XAWS.DynamoDB.DocumentClient()
    }

    async cacheKeyProfiles(): Promise<Key[]> {

        return []
    }

    async updIotUpdate(iotUpdate: IotUpdate,  response: Response) {
        response.statusCode = 200
        response.message = 'OK'
        logger.info("iotUpdate: "+iotUpdate)
        console.log('iotUpdate: '+iotUpdate)
        return response
    }
}