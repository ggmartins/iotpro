import * as AWS  from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { IotUpdate } from '../models/IotUpdate'
import { Response } from '../models/Response'
import { DeviceCreate } from '../models/DeviceCreate'
import { FileAccess } from './FileAccess'
import bcrypt from 'bcryptjs'

//import { Key } from '../models/Key'
//import * as uuid from 'uuid'

const bcrypt_salt = parseInt(process.env.BCRYPT_SALT)

//const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('iotAccess')

const devTable: string = process.env.DEV_TABLE
const iotTable: string = process.env.IOT_TABLE
const idxTable: string = process.env.IOT_INDEX

const sharedKey: string = process.env.SHARED_KEY

const fileAccess: FileAccess = new FileAccess(process.env.ENABLE_LOCAL == 'true')

export class IoTAccess {
    private readonly docClient: DocumentClient // = new AWS.DynamoDB.DocumentClient(),
    private readonly IotTable: string = iotTable
    private readonly DevTable: string = devTable
    constructor(
        private enableLocal:boolean,  
        //private readonly IotIndex: string = iotIndex,      
    ){
        if(!this.enableLocal)
        {
           logger.info('Local: disable')
           this.docClient = new AWS.DynamoDB.DocumentClient({})
        }
        else 
        {
            logger.info('Local: enable')
            this.docClient = new AWS.DynamoDB.DocumentClient({
                region: 'localhost',
                endpoint: 'http://localhost:3001',
                accessKeyId: 'DEFAULT_ACCESS_KEY',
                secretAccessKey: 'DEFAULT_SECRET' 
            })
        }
    }

    // Yes, this is a hardcoded "shared" password
    async cacheKeyProfiles(): Promise<string[]> {
        return [sharedKey]
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

    async pstDevice(devicename: string, password: string, response: Response): Promise<boolean> {
        await this.docClient.put({
            TableName: this.DevTable,
            Item: {
                devname: devicename,
                pssword: bcrypt.hashSync(password, bcrypt_salt)
            }
        }).promise().then(()=>{
            logger.info("pstDevice: device created")
        }).catch(err => {
            response.statusCode = 500
            response.message = err
            logger.error(err)
            return false
        })
        return true
    }

    async qryDevice(devicename: string, response: Response): Promise<DeviceCreate> {
        var ret: DeviceCreate = null
        await this.docClient.query({
            TableName: this.DevTable,
            KeyConditionExpression: '#devname = :devname',
            ExpressionAttributeNames: {
              '#devname': 'devname'
            },
            ExpressionAttributeValues: {
              ':devname': devicename
            }
        }).promise().then((result)=>{
            ret = { devname: result.Items[0].devname, pssword: result.Items[0].pssword }
            logger.info("qryDevice: device found ("+ret.devname+")")
        }).catch(err => {
            response.statusCode = 500
            response.message = err
            logger.error(err)
        })
        return ret
    }

    async pstIotUpdate(iotUpdate: IotUpdate,  response: Response): Promise<boolean> {
        response.statusCode = 201
        response.message = 'Created'
        let ret = true

        logger.info("pstIotUpdate " + iotUpdate.uuid + " " + iotUpdate.createdAt)

        await this.docClient.put({TableName: this.IotTable,
            Item:{
                'uuid': iotUpdate.uuid,
                'id': iotUpdate.id,
                'idType': iotUpdate.idType,
                'createdAt': iotUpdate.createdAt,
                'lastSeen': iotUpdate.LastSeen,
                'bundleList': iotUpdate.bundleList,
                'bundleListType': iotUpdate.bundleListType,
                'bundleListDesc': iotUpdate.bundleListDesc,
                'bundleListUUID': iotUpdate.bundleListUUID
            },
            }).promise().then( result => {
                logger.info("pstIotUpdate OK: " + JSON.stringify(result))
            }).catch( err => { //resource not found for the offline plugin
                /*console.log(JSON.stringify({Item:{
                  'uuid': iotUpdate.uuid,
                  'id': iotUpdate.id,
                  'idType': iotUpdate.idType,
                  'createdAt': iotUpdate.createdAt,
                  'lastSeen': iotUpdate.LastSeen,
                  'bundleList': iotUpdate.bundleList,
                  'bundleListType': iotUpdate.bundleListType,
                  'bundleListDesc': iotUpdate.bundleListDesc,
                  'bundleListUUID': iotUpdate.bundleListUUID
                }}))*/
                //logger.error("pstIotUpdate err: " +  this.IotTable)
                logger.error("pstIotUpdate err: " + err)
                //logger.error("pstIotUpdate err: " + JSON.stringify(iotUpdate))
                response.statusCode = 500
                response.message = err
                ret = false
                if (err.code == 'ConditionalCheckFailedException') {
                    response.statusCode = 404
                    logger.info("pstIotUpdate 404 Not Found")
                }
        })
        return ret
    }

    async getIotUpdate(uuid: string, response: Response): Promise<boolean> {
      response.statusCode = 200
      response.message = 'OK'
      let ret = true
      
      logger.info("updIotUpdate " + uuid) //":" + iotUpdate.uuid + " " + iotUpdate.createdAt)

      /*if (uuid != iotUpdate.uuid) { //sanity check
          response.statusCode = 400
          response.message = 'Invalid uuid'
          return false 
      }*/

      await this.docClient.query({TableName: this.IotTable,
          KeyConditionExpression: '#uuid = :uuid',//'createdAt = :createdAt and #uuid = :uuid',
          ExpressionAttributeNames: {
              '#uuid': 'uuid'
          },
          ExpressionAttributeValues:{
            ":uuid": uuid
          },
        }).promise().then( result => {
          logger.info("getIotUpdate OK: " + JSON.stringify(result))
          response.message = JSON.stringify(result)
          }).catch( err => {
              logger.error("getIotUpdate err: " + err)
              response.statusCode = 500
              response.message = err
              ret = false
              if (err.code == 'ConditionalCheckFailedException') {
                  response.statusCode = 404
                  logger.info("getIotUpdate 404 Not Found")
              }
      })
      return ret
   }


    async updIotUpdate(uuid: string, iotUpdate: IotUpdate,  response: Response): Promise<boolean> {
        response.statusCode = 200
        response.message = 'OK'
        let ret = true
        
        logger.info("updIotUpdate " + uuid + ":" + iotUpdate.uuid + " " + iotUpdate.createdAt)

        if (uuid != iotUpdate.uuid) { //sanity check
            response.statusCode = 400
            response.message = 'Invalid uuid'
            return false 
        }

        await this.docClient.update({TableName: this.IotTable,
            Key:{
              'uuid' : iotUpdate.uuid,
              'createdAt' : iotUpdate.createdAt
            },
            ConditionExpression: 'createdAt = :createdAt and #uuid = :uuid',
            UpdateExpression: 
              "set lastSeen=:lastSeen,"+
              "bundleList=:bundleList,"+
              "bundleListType=:bundleListType,"+
              "bundleListDesc=:bundleListDesc,"+
              "bundleListUUID=:bundleListUUID",
            ExpressionAttributeNames: {
                '#uuid': 'uuid'
            },
            ExpressionAttributeValues:{
              ":lastSeen": iotUpdate.LastSeen,
              //":id": iotUpdate.id,  //unlikely to see changes in ids
              //":idType": iotUpdate.idType,
              ":bundleList": iotUpdate.bundleList,
              ":bundleListType": iotUpdate.bundleListType,
              ":bundleListDesc": iotUpdate.bundleListDesc,
              ":bundleListUUID": iotUpdate.bundleListUUID,
              ":createdAt": iotUpdate.createdAt,
              ":uuid": iotUpdate.uuid
            },
            ReturnValues:"UPDATED_NEW"
          }).promise().then( result => {
            logger.info("updIotUpdate OK: " + JSON.stringify(result))
            }).catch( err => {
                logger.error("updIotUpdate err: " + err)
                response.statusCode = 500
                response.message = err
                ret = false
                if (err.code == 'ConditionalCheckFailedException') {
                    response.statusCode = 404
                    logger.info("updIotUpdate 404 Not Found")
                }
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
            },
            ConditionExpression: 'createdAt = :createdAt and #uuid = :uuid',
            ExpressionAttributeNames: {
                '#uuid': 'uuid'
            },
            ExpressionAttributeValues:{
                ":createdAt": iotUpdate.createdAt,
                ":uuid": iotUpdate.uuid
            }
        }).promise().then( result=>{
            logger.info("OK:"+JSON.stringify(result))
        }).catch( err=>{
            response.statusCode = 500
            response.message = err
            ret = false
            if (err.code == 'ConditionalCheckFailedException') {
                response.statusCode = 404
                logger.info("delIotUpdate 404 Not Found")
            }
        })
        return ret
    }

    async getIotUpload(id: string, response: Response): Promise<string> {
        response.statusCode = 200
        response.message = 'OK'
        var Items=[]
        logger.info("checking id...")
        await this.docClient
        .query({
          TableName: iotTable,
          IndexName: idxTable,
          KeyConditionExpression: '#uuid = :uuid',
          ExpressionAttributeNames: {
            '#uuid': 'uuid'
          },
          ExpressionAttributeValues: {
            ':uuid': id
          } 
        })
        .promise().then(function(result){
          //logger.info("query.then")
          Items = result.Items
          if (Items.length == 0){
            response.statusCode = 404
            response.message = "Not found"
          }
        }).catch(err=>{
          logger.error(err)
          response.message = err
          response.statusCode = 500
        })
        logger.info("updating id..")
        if(response.statusCode==200){
          logger.info("getting url")
          var url=fileAccess.getUploadUrl(id)
          var urlAtt=url.split('?')[0];
          logger.info("upload url:"+url)
          await this.docClient.update({TableName: iotTable,
            Key:{
              'uuid' : Items[0].uuid,
              'createdAt' : Items[0].createdAt
            },
            UpdateExpression: "set #attachmentUrl = :a",
            ExpressionAttributeNames: {
              "#attachmentUrl": "attachmentUrl"
            },
            ExpressionAttributeValues:{
              ":a":urlAtt,
            },
            ReturnValues:"UPDATED_NEW"
          }).promise().then(function(){
            logger.info("OK")
          }).catch(err=>{
            logger.error("error updating item: "+ err)
            response.statusCode = 500
            response.message = err
          })
          return url
        }
        return ''
    }
}
        