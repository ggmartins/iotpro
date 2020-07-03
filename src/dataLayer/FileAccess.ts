import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { Response } from '../models/Response'
import { createLogger } from '../utils/logger'
//import * as uuid from 'uuid'

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('fileAccess')

const VERSION='v4'
const bucketName = process.env.S3_BUCKET_PCAP
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)

export class FileAccess {
    private readonly s3 //TODO type?
    private readonly BucketName: string = bucketName
    constructor(
        private enableLocal:boolean,
        private enableAWSXR:boolean
        ){
            if(!this.enableLocal){
                if (this.enableAWSXR){
                    this.s3 = new XAWS.S3({ 
                        signatureVersion: VERSION,
                    })
                } else {
                    this.s3 = new AWS.S3({ 
                        signatureVersion: VERSION,
                    })
                }
            } else {
                this.s3 = new AWS.S3(process.env.IS_OFFLINE ? {
                    s3ForcePathStyle: true,
                    endpoint: "http://localhost:8000",
                    accessKeyId: "S3RVER", // This keys are required
                    secretAccessKey: "S3RVER", // This keys are required
                  } : {})
            }
    }
    async delObject(name: string, res:Response): Promise<void> {
        await this.s3.deleteObject({  
            Bucket: this.BucketName, 
            Key: name
        }).promise().catch(err=>{
          logger.error("delObject:"+err)
          res.message = res.message + "|" +err
        })
    }

    getUploadUrl(file: string) {
        return this.s3.getSignedUrl('putObject', {
          Bucket: this.BucketName,
          Key: file,
          Expires: urlExpiration
        })
    }

}
