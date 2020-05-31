import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { IotUpdate } from '../models/IotUpdate'
import { Response } from '../models/Response'
//import { Key } from '../models/Key'
//import * as uuid from 'uuid'

//const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('iotAccess')

const iotTable = process.env.IOT_TABLE
//const iotIndex = process.env.IOT_INDEX

export class IoTAccess {
    private readonly docClient: DocumentClient // = new AWS.DynamoDB.DocumentClient(),
    private readonly IotTable: string = iotTable

    constructor(
        private enableAWSX:boolean,  

  //      private readonly IotIndex: string = iotIndex,      
    ){
        if(this.enableAWSX)
        {
           logger.info('AWSX: enable')
           const ddbClient = AWSXRay.captureAWSClient(new AWS.DynamoDB({
                region: 'localhost',
                endpoint: 'http://localhost:3001',
                accessKeyId: 'DEFAULT_ACCESS_KEY',
                secretAccessKey: 'DEFAULT_SECRET' 
           }));
           this.docClient = new AWS.DynamoDB.DocumentClient({
                service: ddbClient
           });
        }
        else 
        {
            logger.info('AWSX: disable')
            this.docClient = new AWS.DynamoDB.DocumentClient()
        }
    }

    async cacheKeyProfiles(): Promise<string[]> {
        return ['thissecretistmp']
    }

    //SCAN TEST
    /*await this.docClient.scan({
        TableName: this.IotTable,
        Select: 'ALL_ATTRIBUTES',
        ReturnConsumedCapacity: 'NONE'
    }).promise().then( result => {
        logger.info("OK: " + JSON.stringify(result))
        }).catch( err => {
            logger.error("updIotUpdate err: " + err)
            response.statusCode = 500
            response.message = err
    })*/

    async updIotUpdate(iotUpdate: IotUpdate,  response: Response): Promise<boolean> {
        response.statusCode = 200
        response.message = 'OK'
        let ret = true
        logger.info("updIotUpdate " + iotUpdate.uuid + " " + iotUpdate.createdAt)

        await this.docClient.update({TableName: this.IotTable,
            Key:{
              'uuid' : iotUpdate.uuid,
              'createdAt' : iotUpdate.createdAt
            },
            ConditionExpression: 'createdAt = :createdAt',
            UpdateExpression: "set lastSeen=:l, idList=:idL",
            ExpressionAttributeValues:{
              ":l": iotUpdate.LastSeen,
              ":idL": iotUpdate.bundleList,
              ":createdAt": iotUpdate.createdAt
            },
            ReturnValues:"UPDATED_NEW"
          }).promise().then( result => {
            logger.info("OK: " + JSON.stringify(result))
            }).catch( err => {
                logger.error("updIotUpdate err: " + err)
                response.statusCode = 500
                response.message = err
                ret = false
        })
        return ret
    }

    async delIotUpdate(iotUpdate: IotUpdate,  response: Response): Promise<boolean> {
        response.statusCode = 200
        response.message = 'OK'
        let ret = true
        logger.info("delIotUpdate " + iotUpdate.uuid + " " + iotUpdate.createdAt)
        await this.docClient.delete({
            TableName: this.IotTable,
            Key:{
                'uuid' : iotUpdate.uuid,
                'createdAt' : iotUpdate.createdAt
            }
        }).promise().then( result=>{
            logger.info("OK:"+result)
        }).catch( err=>{
            response.statusCode = 500
            response.message = err
            ret = false
        })
        return ret
    }
}
        