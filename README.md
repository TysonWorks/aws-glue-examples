# AWS Glue Examples with CDK

## Mongo To S3 Example
For the environment variables, create a `.env` folder inside `mongo-to-s3` folder. 
Replace following values in .env file
```
AWS_REGION=us-west-2
AWS_ACCOUNT_ID=""
RTK=""
MONGO_SERVER=""
MONGO_USER=""
MONGO_PASSWORD=""
MONGO_PORT=""
MONGO_SSL=""
MONGO_DATABASE=""
COLLECTIONS="MyCollection,SecondCollection,ThirdCollection
BUCKET_NAME="my-etl-bucket"
```

Install dependencies
`npm install`

Deploy the stack using CDK CLI
`cdk deploy`

Destroy the stack
`cdk destroy`
