#sls create --template aws-nodejs-typescript --path iotpro
#sls dynamodb install
#sls dynamodb start --migrate
#sls dynamodb start --seed test
#SLS_DEBUG=* sls dynamodb migrate --stage dev 
#sls plugin install --name serverless-offline
#sls plugin install --name serverless-s3-local
#SLS_DEBUG=* sls offline
#sls deploy -noDeploy
